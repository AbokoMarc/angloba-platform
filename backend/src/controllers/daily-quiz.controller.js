// backend/src/controllers/daily-quiz.controller.js
//
// Quiz quotidien de 20 questions, tire de TOUT le contenu deja debloque
// (semaine 1 -> semaine actuelle de l'eleve). Plus l'eleve avance, plus le
// quiz pioche dans des semaines recentes/difficiles — la difficulte suit
// naturellement sa progression, sans jamais depasser ce qu'il a deja appris.
//
// Le tirage est DETERMINISTE par (eleve, jour) : recharger la page ne
// remelange pas les questions, mais chaque jour propose un nouveau tirage.

import { db } from "../db/client.js";
import { requireRole } from "../middleware/auth.js";
import { requireActiveAccess } from "../middleware/subscription.js";
import { sendJson, readJsonBody } from "../utils/http.js";
import { newId } from "../utils/ids.js";
import { recordActivity } from "../utils/activity.js";
import { sendPushToRole } from "../services/webpush.service.js";

const QUESTIONS_PER_DAY = 20;

// Petit generateur pseudo-aleatoire deterministe (seed = chaine) pour que le
// tirage du jour soit stable si l'eleve recharge la page.
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return function () {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed(arr, rand) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// GET /api/daily-quiz — genere (ou rappelle) le quiz du jour pour l'eleve connecte.
export async function getDailyQuiz(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;
  const ok = await requireActiveAccess(req, res, user);
  if (!ok) return;

  const profile = (await db.execute({ sql: "SELECT current_week FROM student_profiles WHERE user_id = ?", args: [user.id] })).rows[0];
  const currentWeek = profile?.current_week || 1;
  const today = new Date().toISOString().slice(0, 10);

  const pool = (await db.execute({
    sql: `SELECT e.id, e.question, e.options_json, w.number as week_number
          FROM exercises e JOIN weeks w ON w.id = e.week_id
          WHERE w.number <= ? ORDER BY w.number ASC`,
    args: [currentWeek],
  })).rows;

  if (!pool.length) return sendJson(res, 200, { questions: [], quizDate: today, alreadyDone: false });

  // Ponderation "difficulte croissante" : on privilegie les semaines
  // recentes (2x plus de chances d'etre piochees que les anciennes), tout
  // en gardant un peu de revision des semaines passees.
  const weighted = [];
  for (const q of pool) {
    const weight = q.week_number >= currentWeek - 2 ? 2 : 1;
    for (let i = 0; i < weight; i++) weighted.push(q);
  }

  const rand = seededRandom(`${user.id}-${today}`);
  const shuffled = shuffleWithSeed(weighted, rand);

  // Deduplique (le poids peut repeter le meme id) en gardant l'ordre, puis
  // complete par tirage avec remise si le contenu disponible est < 20.
  const seen = new Set();
  const unique = [];
  for (const q of shuffled) {
    if (!seen.has(q.id)) { seen.add(q.id); unique.push(q); }
  }
  while (unique.length < QUESTIONS_PER_DAY && pool.length) {
    unique.push(pool[Math.floor(rand() * pool.length)]);
  }
  const selected = unique.slice(0, QUESTIONS_PER_DAY);

  const alreadyDone = (await db.execute({
    sql: "SELECT score_pct FROM daily_quiz_attempts WHERE student_id = ? AND quiz_date = ?",
    args: [user.id, today],
  })).rows[0];

  sendJson(res, 200, {
    quizDate: today,
    alreadyDone: alreadyDone ? alreadyDone.score_pct : null,
    questions: selected.map((q) => ({ id: q.id, question: q.question, options: JSON.parse(q.options_json), weekNumber: q.week_number })),
  });
}

// POST /api/daily-quiz/submit — body: { answers: [{questionId, selectedIndex}] }
export async function submitDailyQuiz(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;

  const body = await readJsonBody(req);
  const answers = body.answers || [];
  if (!answers.length) return sendJson(res, 400, { error: "Aucune reponse fournie." });

  const ids = answers.map((a) => a.questionId);
  const placeholders = ids.map(() => "?").join(",");
  const questions = (await db.execute({
    sql: `SELECT id, correct_index FROM exercises WHERE id IN (${placeholders})`,
    args: ids,
  })).rows;
  const correctById = Object.fromEntries(questions.map((q) => [q.id, q.correct_index]));

  const results = answers.map((a) => ({ questionId: a.questionId, correct: correctById[a.questionId] === a.selectedIndex }));
  const scorePct = Math.round((results.filter((r) => r.correct).length / results.length) * 100);
  const today = new Date().toISOString().slice(0, 10);

  await db.execute({
    sql: `INSERT INTO daily_quiz_attempts (id, student_id, quiz_date, score_pct, total_questions)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(student_id, quiz_date) DO UPDATE SET score_pct = excluded.score_pct, total_questions = excluded.total_questions`,
    args: [newId("dq"), user.id, today, scorePct, answers.length],
  });

  await recordActivity(user.id);
  sendPushToRole("admin", { title: "English Academy - Quiz du jour", body: `${user.name} a fait son quiz quotidien — score ${scorePct}%.`, url: "/admin/students.html" }, "system").catch(() => {});

  sendJson(res, 200, { scorePct, results });
}
