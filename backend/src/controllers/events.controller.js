// backend/src/controllers/events.controller.js
//
// A - L'ELEVE NOTIFIE L'ADMIN EN TEMPS REEL.
// Quand un eleve fait une action significative (commence un cours, echoue un
// exercice...), le frontend POST ici. On enregistre l'evenement ET on pousse
// une notification push a TOUS les admins/superadmin — meme si leur dashboard
// est ferme, ils recoivent une notif sur leur telephone.

import { db } from "../db/client.js";
import { requireRole } from "../middleware/auth.js";
import { sendJson, readJsonBody } from "../utils/http.js";
import { newId } from "../utils/ids.js";
import { sendPushToRole } from "../services/webpush.service.js";

const EVENT_MESSAGES = {
  COURS_COMMENCE: (name, week) => `${name} a commencé la semaine ${week}.`,
  COURS_TERMINE: (name, week) => `${name} a terminé la semaine ${week}. 🎉`,
  EXERCICE_ECHOUE: (name, week) => `${name} a échoué les exercices de la semaine ${week}.`,
  COMPOSITION_SOUMISE: (name) => `${name} a soumis une composition, en attente de correction.`,
};

// POST /api/events — body: { type, weekNumber? }
export async function createEvent(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;

  const body = await readJsonBody(req);
  const type = body.type;
  if (!EVENT_MESSAGES[type]) return sendJson(res, 400, { error: "Type d'evenement inconnu." });

  await db.execute({
    sql: "INSERT INTO events (id, user_id, type, week_number) VALUES (?, ?, ?, ?)",
    args: [newId("evt"), user.id, type, body.weekNumber || null],
  });

  const messageBuilder = EVENT_MESSAGES[type];
  const message = messageBuilder(user.name, body.weekNumber);

  // On envoie aux admins ET superadmin (le prof titulaire est aussi superadmin).
  sendPushToRole("admin", { title: "English Academy - Activité", body: message, url: "/admin/students.html" }, "system").catch(() => {});
  sendPushToRole("superadmin", { title: "English Academy - Activité", body: message, url: "/admin/students.html" }, "system").catch(() => {});

  sendJson(res, 201, { ok: true });
}
