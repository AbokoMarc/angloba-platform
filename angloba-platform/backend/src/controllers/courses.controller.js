// backend/src/controllers/courses.controller.js
//
// Le "Course Builder" : tout le programme (9 mois / 36 semaines /
// grammaire / vocabulaire / exercices) est en base, donc editable par
// l'admin/superadmin sans toucher au code. Les eleves et profs le
// consultent en lecture seule via ces memes routes.

import { db } from "../db/client.js";
import { requireRole, requirePermission } from "../middleware/auth.js";
import { sendJson, readJsonBody } from "../utils/http.js";
import { newId } from "../utils/ids.js";

// GET /api/courses/months — programme complet (arbre mois > semaines), lecture publique-connectee
export async function getFullProgram(req, res) {
  const user = requireRole(req, res, "student", "teacher", "admin", "superadmin");
  if (!user) return;

  const months = (await db.execute({ sql: "SELECT * FROM months ORDER BY number", args: [] })).rows;
  const weeks = (await db.execute({ sql: "SELECT * FROM weeks ORDER BY number", args: [] })).rows;

  const tree = months.map((m) => ({
    ...m,
    weeks: weeks.filter((w) => w.month_id === m.id),
  }));
  sendJson(res, 200, { months: tree });
}

// GET /api/courses/weeks/:number — detail complet d'une semaine (grammaire, vocab, exercices)
export async function getWeekDetail(req, res, params) {
  const user = requireRole(req, res, "student", "teacher", "admin", "superadmin");
  if (!user) return;

  const weekNum = Number(params.number);
  const week = (await db.execute({ sql: "SELECT * FROM weeks WHERE number = ?", args: [weekNum] })).rows[0];
  if (!week) return sendJson(res, 404, { error: "Semaine introuvable." });

  const vocabulary = (await db.execute({ sql: "SELECT * FROM vocabulary_words WHERE week_id = ?", args: [week.id] })).rows;
  const exercises = (await db.execute({ sql: "SELECT * FROM exercises WHERE week_id = ?", args: [week.id] })).rows
    .map((e) => ({ ...e, options: JSON.parse(e.options_json) }));
  const audios = (await db.execute({ sql: "SELECT * FROM audio_resources WHERE week_id = ?", args: [week.id] })).rows;

  sendJson(res, 200, { week, vocabulary, exercises, audios });
}

// PUT /api/courses/weeks/:number — edition du contenu d'une semaine (admin/superadmin)
export async function updateWeek(req, res, params) {
  const user = requireRole(req, res, "admin", "superadmin");
  if (!user) return;
  if (user.role === "admin") {
    const ok = await requirePermission(req, res, user, "can_manage_courses");
    if (!ok) return;
  }

  const weekNum = Number(params.number);
  const body = await readJsonBody(req);
  const fields = [];
  const args = [];
  for (const [col, key] of [["title", "title"], ["grammar_title", "grammarTitle"], ["grammar_html", "grammarHtml"], ["speaking_task", "speakingTask"]]) {
    if (body[key] !== undefined) { fields.push(`${col} = ?`); args.push(body[key]); }
  }
  if (fields.length) {
    args.push(weekNum);
    await db.execute({ sql: `UPDATE weeks SET ${fields.join(", ")} WHERE number = ?`, args });
  }
  sendJson(res, 200, { ok: true });
}

// POST /api/courses/weeks/:number/vocabulary — ajouter un mot (admin/superadmin, ou prof via can_manage_media pour l'audio uniquement)
export async function addVocabularyWord(req, res, params) {
  const user = requireRole(req, res, "admin", "superadmin");
  if (!user) return;
  if (user.role === "admin") {
    const ok = await requirePermission(req, res, user, "can_manage_courses");
    if (!ok) return;
  }

  const weekNum = Number(params.number);
  const week = (await db.execute({ sql: "SELECT id FROM weeks WHERE number = ?", args: [weekNum] })).rows[0];
  if (!week) return sendJson(res, 404, { error: "Semaine introuvable." });

  const body = await readJsonBody(req);
  const id = newId("voc");
  await db.execute({
    sql: `INSERT INTO vocabulary_words (id, week_id, word, word_type, fr, gb_variant, us_variant, audio_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, week.id, body.word, body.wordType || "noun", body.fr || "", body.gbVariant || null, body.usVariant || null, body.audioUrl || null],
  });
  sendJson(res, 201, { id });
}

// POST /api/courses/weeks/:number/exercises — ajouter un exercice QCM
export async function addExercise(req, res, params) {
  const user = requireRole(req, res, "admin", "superadmin");
  if (!user) return;
  if (user.role === "admin") {
    const ok = await requirePermission(req, res, user, "can_manage_courses");
    if (!ok) return;
  }

  const weekNum = Number(params.number);
  const week = (await db.execute({ sql: "SELECT id FROM weeks WHERE number = ?", args: [weekNum] })).rows[0];
  if (!week) return sendJson(res, 404, { error: "Semaine introuvable." });

  const body = await readJsonBody(req);
  const id = newId("exo");
  await db.execute({
    sql: `INSERT INTO exercises (id, week_id, question, options_json, correct_index) VALUES (?, ?, ?, ?, ?)`,
    args: [id, week.id, body.question, JSON.stringify(body.options || []), body.correctIndex ?? 0],
  });
  sendJson(res, 201, { id });
}

// GET /api/courses/speaking-scenarios — liste pour le Speaking Lab
export async function listSpeakingScenarios(req, res) {
  const user = requireRole(req, res, "student", "teacher", "admin", "superadmin");
  if (!user) return;
  const rows = (await db.execute({ sql: "SELECT * FROM speaking_scenarios ORDER BY id", args: [] })).rows;
  sendJson(res, 200, { scenarios: rows });
}

// POST /api/courses/speaking-scenarios — creer un scenario (admin/superadmin, ou prof avec can_manage_media pour l'audio d'exemple)
export async function createSpeakingScenario(req, res) {
  const user = requireRole(req, res, "admin", "superadmin");
  if (!user) return;
  if (user.role === "admin") {
    const ok = await requirePermission(req, res, user, "can_manage_courses");
    if (!ok) return;
  }
  const body = await readJsonBody(req);
  const id = newId("scn");
  await db.execute({
    sql: `INSERT INTO speaking_scenarios (key, title, emoji, level, ai_persona, ai_opening, goal, audio_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [body.key, body.title, body.emoji || "🗣️", body.level || "Beginner", body.aiPersona, body.aiOpening, body.goal, body.audioUrl || null],
  });
  sendJson(res, 201, { ok: true });
}
