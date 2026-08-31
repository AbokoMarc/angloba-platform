// backend/src/controllers/push.controller.js

import { db } from "../db/client.js";
import { requireAuth } from "../middleware/auth.js";
import { sendJson, readJsonBody } from "../utils/http.js";
import { newId } from "../utils/ids.js";

// GET /api/push/vapid-public-key — PUBLIC (le navigateur en a besoin avant
// meme d'etre authentifie pour construire l'abonnement push).
export async function vapidPublicKey(req, res) {
  sendJson(res, 200, { publicKey: process.env.VAPID_PUBLIC_KEY || null });
}

// POST /api/push/subscribe — enregistre l'abonnement push du navigateur
// courant pour l'utilisateur connecte (eleve, prof ou admin). Un utilisateur
// peut avoir plusieurs appareils : on upsert par "endpoint" (unique par
// navigateur/appareil).
export async function subscribe(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  const body = await readJsonBody(req);
  const subscription = body.subscription;
  if (!subscription?.endpoint) return sendJson(res, 400, { error: "Abonnement push invalide." });

  const existing = await db.execute({ sql: "SELECT id FROM push_subscriptions WHERE endpoint = ?", args: [subscription.endpoint] });

  if (existing.rows.length) {
    await db.execute({
      sql: "UPDATE push_subscriptions SET user_id = ?, role = ?, subscription_json = ? WHERE endpoint = ?",
      args: [user.id, user.role, JSON.stringify(subscription), subscription.endpoint],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO push_subscriptions (id, user_id, role, endpoint, subscription_json) VALUES (?, ?, ?, ?, ?)`,
      args: [newId("psh"), user.id, user.role, subscription.endpoint, JSON.stringify(subscription)],
    });
  }

  sendJson(res, 201, { ok: true });
}
