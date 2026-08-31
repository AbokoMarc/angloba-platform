// backend/src/controllers/engagement.controller.js
//
// B1 - HARCELEMENT MANUEL (par le prof/admin) : un bouton "Envoyer un
//      rappel" sur la liste des eleves declenche une notif push ciblee.
// B2 - HARCELEMENT AUTOMATIQUE (le systeme, façon Duolingo) : une route
//      appelee par un CRON externe (cron-job.org, gratuit) toutes les
//      quelques heures, qui relance tout eleve inactif depuis 24h et casse
//      le streak de ceux inactifs depuis 48h+.

import { db } from "../db/client.js";
import { requireRole } from "../middleware/auth.js";
import { sendJson, readJsonBody } from "../utils/http.js";
import { sendPushToUser } from "../services/webpush.service.js";

// POST /api/admin/notify — body: { studentId, title, body }
// Un prof ne peut relancer que SES eleves ; admin/superadmin, n'importe qui.
export async function notifyStudent(req, res) {
  const user = requireRole(req, res, "teacher", "admin", "superadmin");
  if (!user) return;

  const body = await readJsonBody(req);
  if (!body.studentId || !body.title || !body.body) {
    return sendJson(res, 400, { error: "studentId, title et body sont requis." });
  }

  if (user.role === "teacher") {
    const owns = await db.execute({
      sql: "SELECT 1 FROM student_profiles WHERE user_id = ? AND teacher_id = ?",
      args: [body.studentId, user.id],
    });
    if (!owns.rows.length) return sendJson(res, 403, { error: "Cet eleve n'est pas dans ta classe." });
  }

  await sendPushToUser(body.studentId, { title: body.title, body: body.body, url: "/student/dashboard.html" }, user.id);
  sendJson(res, 200, { ok: true });
}

// GET /api/cron/check-inactifs?secret=... — appelee par un CRON externe
// (jamais de JWT ici : proteger par un secret partage en query string).
export async function checkInactive(req, res) {
  const url = new URL(req.url, "http://x");
  if (url.searchParams.get("secret") !== process.env.CRON_SECRET) {
    return sendJson(res, 403, { error: "Secret invalide." });
  }

  // Inactifs depuis 24h+ : relance "tu vas perdre ton streak"
  const inactive24h = (await db.execute({
    sql: `SELECT u.id, u.name, sp.streak_days FROM student_profiles sp
          JOIN users u ON u.id = sp.user_id
          WHERE u.status = 'active' AND (sp.last_active_at IS NULL OR sp.last_active_at < datetime('now', '-24 hours'))`,
    args: [],
  })).rows;

  for (const student of inactive24h) {
    await sendPushToUser(student.id, {
      title: "Hey, tu vas perdre ton streak ! 🔥",
      body: student.streak_days > 0
        ? `Ta série de ${student.streak_days} jours est en jeu. 5 minutes suffisent aujourd'hui !`
        : "Tu n'as pas fait ton anglais aujourd'hui. 5 minutes seulement !",
      url: "/student/dashboard.html",
    }, "system");
  }

  // Inactifs depuis 48h+ : le streak est vraiment casse (comme Duolingo sans "streak freeze")
  const resetResult = await db.execute({
    sql: `UPDATE student_profiles SET streak_days = 0
          WHERE streak_days > 0 AND (last_active_at IS NULL OR last_active_at < datetime('now', '-48 hours'))`,
    args: [],
  });

  sendJson(res, 200, {
    notified: inactive24h.length,
    streaksReset: resetResult.rowsAffected || 0,
  });
}
