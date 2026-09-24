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
import { correctionAssist } from "../services/ai.service.js";

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

// GET /api/cron/auto-correct-compositions?secret=... — appelee par un CRON
// externe (recommande : toutes les 10-15 min). Corrige automatiquement par
// IA toute composition soumise depuis 30+ minutes et toujours en attente
// d'un professeur — pour que l'eleve ne reste jamais bloque si personne
// n'est disponible.
export async function autoCorrectCompositions(req, res) {
  const url = new URL(req.url, "http://x");
  if (url.searchParams.get("secret") !== process.env.CRON_SECRET) {
    return sendJson(res, 403, { error: "Secret invalide." });
  }

  const pending = (await db.execute({
    sql: `SELECT s.id, s.body, s.student_id, c.prompt, c.min_words
          FROM composition_submissions s JOIN compositions c ON c.id = s.composition_id
          WHERE s.status = 'submitted' AND s.submitted_at < datetime('now', '-30 minutes')`,
    args: [],
  })).rows;

  let corrected = 0;
  for (const sub of pending) {
    try {
      const assist = await correctionAssist({ prompt: sub.prompt, minWords: sub.min_words, studentText: sub.body });
      await db.execute({
        sql: `UPDATE composition_submissions SET status='corrected', score=?, teacher_feedback=?, corrected_at=datetime('now'), corrected_by=NULL WHERE id=?`,
        args: [assist.suggestedScore, `[Corrige automatiquement par l'IA — professeur indisponible sous 30 min] ${assist.strengths} ${assist.improvements}`, sub.id],
      });
      sendPushToUser(sub.student_id, { title: "English Academy", body: `Ta composition a été corrigée automatiquement — score ${assist.suggestedScore}/100.`, url: "/student/compositions.html" }, "system").catch(() => {});
      corrected++;
    } catch (err) {
      console.error("[cron/auto-correct] echec pour", sub.id, err.message);
    }
  }

  sendJson(res, 200, { corrected, checked: pending.length });
}

// GET /api/cron/check-inactifs?secret=... — appelee par un CRON externe
// (jamais de JWT ici : proteger par un secret partage en query string).
// B2 - relance les inactifs 24h+ ("tu vas perdre ton streak"), casse le
// streak des inactifs 48h+, et retrograde d'une semaine ceux qui n'ont pas
// touche l'app depuis 14 jours (absence longue).
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

  // Absence longue (14 jours+) : retrogradation automatique d'une semaine —
  // "si un etudiant dure sans revenir... il est retrograde par le systeme".
  // Ne descend jamais sous la semaine 1. L'admin garde la main pour corriger
  // manuellement a tout moment (Admin > Students).
  const demoteCandidates = (await db.execute({
    sql: `SELECT u.id, u.name, sp.current_week FROM student_profiles sp
          JOIN users u ON u.id = sp.user_id
          WHERE sp.current_week > 1 AND sp.last_active_at < datetime('now', '-14 days')`,
    args: [],
  })).rows;

  for (const student of demoteCandidates) {
    const newWeek = Math.max(1, student.current_week - 1);
    const weekRow = (await db.execute({ sql: "SELECT month_id FROM weeks WHERE number = ?", args: [newWeek] })).rows[0];
    const monthRow = weekRow ? (await db.execute({ sql: "SELECT number FROM months WHERE id = ?", args: [weekRow.month_id] })).rows[0] : null;
    await db.execute({
      sql: "UPDATE student_profiles SET current_week = ?, current_month = ? WHERE user_id = ?",
      args: [newWeek, monthRow?.number || 1, student.id],
    });
    sendPushToUser(student.id, {
      title: "English Academy",
      body: `Tu étais absent depuis longtemps — on t'a remis à la semaine ${newWeek} pour repartir sur de bonnes bases.`,
      url: "/student/dashboard.html",
    }, "system").catch(() => {});
  }

  sendJson(res, 200, {
    notified: inactive24h.length,
    streaksReset: resetResult.rowsAffected || 0,
    demoted: demoteCandidates.length,
  });
}
