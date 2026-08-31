// backend/src/services/webpush.service.js
//
// Enveloppe autour de la librairie "web-push" (implementation standard du
// protocole Web Push — la seule dependance "non-zero" du backend en dehors
// de @libsql/client, le protocole etant trop complexe a reimplementer a la
// main de facon fiable : chiffrement VAPID, signatures ECDSA...).
//
// Sans VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY, l'envoi echoue silencieusement
// (logge en console) — le reste de la plateforme continue de fonctionner.
//
// Generer les cles UNE FOIS avec : npx web-push generate-vapid-keys

import webpush from "web-push";
import { db } from "../db/client.js";
import { newId } from "../utils/ids.js";

let configured = false;

function ensureConfigured() {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:contact@example.com",
    pub,
    priv
  );
  configured = true;
  return true;
}

/**
 * Envoie une notification a TOUTES les subscriptions d'un role donne
 * (utilise pour notifier tous les admins/superadmin quand un eleve agit).
 */
export async function sendPushToRole(role, payload, sentBy = "system") {
  if (!ensureConfigured()) { console.warn("[webpush] VAPID non configure — push ignore."); return; }
  const subs = (await db.execute({ sql: "SELECT * FROM push_subscriptions WHERE role = ?", args: [role] })).rows;
  await sendToSubscriptionRows(subs, payload, sentBy);
}

/**
 * Envoie une notification a un utilisateur precis (tous ses appareils).
 */
export async function sendPushToUser(userId, payload, sentBy = "system") {
  if (!ensureConfigured()) { console.warn("[webpush] VAPID non configure — push ignore."); return; }
  const subs = (await db.execute({ sql: "SELECT * FROM push_subscriptions WHERE user_id = ?", args: [userId] })).rows;
  await sendToSubscriptionRows(subs, payload, sentBy);
}

async function sendToSubscriptionRows(subs, payload, sentBy) {
  const body = JSON.stringify(payload);
  const notifiedUserIds = new Set();

  for (const sub of subs) {
    try {
      const parsed = JSON.parse(sub.subscription_json);
      await webpush.sendNotification(parsed, body);
      notifiedUserIds.add(sub.user_id);
    } catch (err) {
      // 404/410 = l'abonnement n'existe plus cote navigateur -> on le supprime.
      if (err.statusCode === 404 || err.statusCode === 410) {
        await db.execute({ sql: "DELETE FROM push_subscriptions WHERE id = ?", args: [sub.id] });
      } else {
        console.error("[webpush] envoi echoue:", err.message);
      }
    }
  }

  for (const userId of notifiedUserIds) {
    await db.execute({
      sql: "INSERT INTO notifications_log (id, user_id, title, body, sent_by) VALUES (?, ?, ?, ?, ?)",
      args: [newId("ntf"), userId, payload.title, payload.body, sentBy],
    });
  }
}
