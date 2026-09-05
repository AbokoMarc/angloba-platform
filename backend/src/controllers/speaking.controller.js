// backend/src/controllers/speaking.controller.js
//
// Le SPEAKING LAB. C'est le coeur IA de la plateforme :
//  1) l'eleve choisit un scenario
//  2) POST /api/speaking/turn a chaque tour -> l'IA repond dans le personnage
//     (calibree sur le niveau de l'eleve, cf ai.service.js)
//  3) POST /api/speaking/finish -> l'IA note la session et donne un feedback
//     -> tout est enregistre dans speaking_sessions pour que le PROF puisse
//        relire les echanges de ses eleves (transparence pedagogique).

import { db } from "../db/client.js";
import { requireRole } from "../middleware/auth.js";
import { requireActiveAccess } from "../middleware/subscription.js";
import { sendJson, readJsonBody } from "../utils/http.js";
import { newId } from "../utils/ids.js";
import { recordActivity } from "../utils/activity.js";
import { speakingReply, speakingScore } from "../services/ai.service.js";
import { sendPushToRole } from "../services/webpush.service.js";

// POST /api/speaking/turn
// body: { scenarioKey, level, history: [{from,text}], studentMessage }
export async function speakingTurn(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;
  const ok = await requireActiveAccess(req, res, user);
  if (!ok) return;

  const body = await readJsonBody(req);
  const scenario = (await db.execute({
    sql: "SELECT * FROM speaking_scenarios WHERE key = ?",
    args: [body.scenarioKey],
  })).rows[0];
  if (!scenario) return sendJson(res, 404, { error: "Scenario introuvable." });

  try {
    const reply = await speakingReply({
      scenario,
      level: body.level || scenario.level,
      history: body.history || [],
      studentMessage: body.studentMessage,
    });
    await recordActivity(user.id);
    sendJson(res, 200, { reply });
  } catch (err) {
    sendJson(res, 503, { error: err.message });
  }
}

// POST /api/speaking/finish
// body: { scenarioKey, level, transcript: [{from,text}] }
// -> note la session, la sauvegarde, et renvoie les scores a afficher.
export async function speakingFinish(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;

  const body = await readJsonBody(req);
  const scenario = (await db.execute({
    sql: "SELECT * FROM speaking_scenarios WHERE key = ?",
    args: [body.scenarioKey],
  })).rows[0];
  if (!scenario) return sendJson(res, 404, { error: "Scenario introuvable." });

  try {
    const scores = await speakingScore({ scenario, level: body.level || scenario.level, transcript: body.transcript || [] });
    const id = newId("spk");
    await db.execute({
      sql: `INSERT INTO speaking_sessions (id, student_id, scenario_id, transcript_json, scores_json, ai_feedback)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, user.id, scenario.id, JSON.stringify(body.transcript || []), JSON.stringify(scores), scores.feedback || ""],
    });
    await recordActivity(user.id);

    sendPushToRole("admin", { title: "English Academy - Speaking Lab", body: `${user.name} a terminé "${scenario.title}" — score ${scores.overall}%.`, url: "/admin/students.html" }, "system").catch(() => {});
    sendPushToRole("superadmin", { title: "English Academy - Speaking Lab", body: `${user.name} a terminé "${scenario.title}" — score ${scores.overall}%.`, url: "/admin/students.html" }, "system").catch(() => {});

    sendJson(res, 200, { sessionId: id, scores });
  } catch (err) {
    sendJson(res, 503, { error: err.message });
  }
}

// GET /api/speaking/history — historique de l'eleve connecte (pour My Progress)
export async function speakingHistory(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;
  const rows = (await db.execute({
    sql: `SELECT ss.id, ss.scores_json, ss.created_at, sc.title, sc.emoji
          FROM speaking_sessions ss JOIN speaking_scenarios sc ON sc.id = ss.scenario_id
          WHERE ss.student_id = ? ORDER BY ss.created_at DESC LIMIT 20`,
    args: [user.id],
  })).rows;
  sendJson(res, 200, { sessions: rows.map((r) => ({ ...r, scores: JSON.parse(r.scores_json) })) });
}

// GET /api/speaking/student/:id — un prof relit les sessions d'un de SES eleves
export async function speakingForStudent(req, res, params) {
  const user = requireRole(req, res, "teacher", "admin", "superadmin");
  if (!user) return;

  if (user.role === "teacher") {
    const owns = await db.execute({
      sql: "SELECT 1 FROM student_profiles WHERE user_id = ? AND teacher_id = ?",
      args: [params.id, user.id],
    });
    if (!owns.rows.length) return sendJson(res, 403, { error: "Cet eleve n'est pas dans ta classe." });
  }

  const rows = (await db.execute({
    sql: `SELECT ss.*, sc.title FROM speaking_sessions ss JOIN speaking_scenarios sc ON sc.id = ss.scenario_id
          WHERE ss.student_id = ? ORDER BY ss.created_at DESC`,
    args: [params.id],
  })).rows;
  sendJson(res, 200, { sessions: rows.map((r) => ({ ...r, transcript: JSON.parse(r.transcript_json), scores: JSON.parse(r.scores_json || "{}") })) });
}
