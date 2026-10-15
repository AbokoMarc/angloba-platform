// backend/src/controllers/days.controller.js
//
// Coeur du parcours JOURNALIER (Day 1 ... Day 252). UNE SEMAINE = 7 JOURS
// COMPLETS (voir utils/day-mapping.js). Chaque jour contient plusieurs TACHES ;
// l'eleve ne peut passer au jour suivant que lorsque TOUTES sont faites.
//
//   Jour 1 Grammar    : lire la lecon + mini-quiz (5 questions)
//   Jour 2 Vocabulary : parcourir les mots + quiz de vocabulaire (8 questions)
//   Jour 3 Exercises  : 20 questions notees
//   Jour 4 Speaking   : repeter les phrases a voix haute (+ Speaking Lab si la semaine en a un)
//   Jour 5 Writing    : composition de la semaine (corrigee) sinon ecriture courte
//   Jour 6 Review     : revision de 20 questions des semaines passees
//   Jour 7 Weekly Test: test de fin de semaine (20 questions, 70 %) -> semaine terminee
//
// GET /today renvoie exactement ce que l'eleve doit voir aujourd'hui, avec la
// liste des taches et leur etat. Les bonnes reponses ne quittent jamais le serveur.

import { db } from "../db/client.js";
import { requireRole } from "../middleware/auth.js";
import { requireActiveAccess } from "../middleware/subscription.js";
import { sendJson, readJsonBody, httpError } from "../utils/http.js";
import { fixRows } from "../utils/public-url.js";
import { recordActivity } from "../utils/activity.js";
import { sendPushToRole } from "../services/webpush.service.js";
import { buildQuiz, stripAnswers, gradeQuiz, QUIZ_CONFIG } from "../utils/day-quizzes.js";
import { KEY_PHRASES, WRITING_PROMPTS } from "../db/content/index.js";
import { dayToWeek, dayTypeOf, weekToMonth, overallPct, DAY_TYPE_LABELS, DAYS_PER_WEEK, TOTAL_DAYS } from "../utils/day-mapping.js";

const SPEAKING_PASS_THRESHOLD = Number(process.env.SPEAKING_PASS_THRESHOLD || 70);
// Temps minimum (secondes) avant de pouvoir confirmer une tache "lecture" :
// evite de tout valider d'un clic sans rien lire.
const MIN_READ_SECONDS = Number(process.env.MIN_READ_SECONDS || 20);

const CONFIRM_TASKS = new Set(["lesson_read", "words_seen", "phrases"]);

// Quelles taches pour quel type de journee (selon le contenu de la semaine)
function taskKeysFor(dayType, ctx) {
  switch (dayType) {
    case 1: return ["lesson_read", "grammar_quiz"];
    case 2: return ["words_seen", "vocab_quiz"];
    case 3: return ["exercises"];
    case 4: return ctx.speakingScenario ? ["phrases", "speaking_lab"] : ["phrases"];
    case 5: return [ctx.composition ? "composition" : "writing"];
    case 6: return ["review"];
    default: return ["weekly_test"];
  }
}

const TASK_TITLES = {
  lesson_read: "Lis la leçon",
  grammar_quiz: "Mini-quiz de grammaire",
  words_seen: "Parcours les mots du jour",
  vocab_quiz: "Quiz de vocabulaire",
  exercises: "20 exercices notés",
  phrases: "Répète les phrases à voix haute",
  speaking_lab: "Speaking Lab",
  composition: "Composition de la semaine",
  writing: "Écriture courte",
  review: "Révision (20 questions)",
  weekly_test: "Test de la semaine",
};

async function loadContext(userId) {
  const profile = (await db.execute({ sql: "SELECT current_day FROM student_profiles WHERE user_id = ?", args: [userId] })).rows[0];
  if (!profile) return null;
  const day = Math.max(1, Math.min(TOTAL_DAYS, Number(profile.current_day) || 1));
  const weekNumber = dayToWeek(day);
  const week = (await db.execute({ sql: "SELECT * FROM weeks WHERE number = ?", args: [weekNumber] })).rows[0];
  if (!week) return { day, weekNumber, week: null };
  const composition = (await db.execute({ sql: "SELECT * FROM compositions WHERE week_id = ?", args: [week.id] })).rows[0] || null;
  const speakingScenario = (await db.execute({ sql: "SELECT * FROM speaking_scenarios WHERE week_number = ?", args: [weekNumber] })).rows[0] || null;
  return { day, weekNumber, week, dayType: dayTypeOf(day), composition, speakingScenario };
}

async function getTaskRows(userId, day) {
  const rows = (await db.execute({ sql: "SELECT * FROM day_tasks WHERE student_id = ? AND day = ?", args: [userId, day] })).rows;
  return Object.fromEntries(rows.map((r) => [r.task_key, r]));
}

async function ensureOpened(userId, day, keys) {
  for (const key of keys) {
    await db.execute({
      sql: `INSERT INTO day_tasks (student_id, day, task_key, done, attempts, opened_at, updated_at)
            VALUES (?, ?, ?, 0, 0, datetime('now'), datetime('now'))
            ON CONFLICT(student_id, day, task_key) DO NOTHING`,
      args: [userId, day, key],
    });
  }
}

async function bestSpeakingScore(userId, scenarioId) {
  const sessions = (await db.execute({ sql: "SELECT scores_json FROM speaking_sessions WHERE student_id = ? AND scenario_id = ?", args: [userId, scenarioId] })).rows;
  return sessions.reduce((max, s) => {
    try { return Math.max(max, JSON.parse(s.scores_json).overall || 0); } catch { return max; }
  }, 0);
}

async function getSubmission(userId, compositionId) {
  return (await db.execute({
    sql: "SELECT * FROM composition_submissions WHERE composition_id = ? AND student_id = ?",
    args: [compositionId, userId],
  })).rows[0] || null;
}

// Etat de chaque tache du jour : { key, title, done, detail }
async function evaluateTasks(userId, ctx) {
  const keys = taskKeysFor(ctx.dayType, ctx);
  const rows = await getTaskRows(userId, ctx.day);
  const tasks = [];
  for (const key of keys) {
    const row = rows[key];
    let done = Boolean(row?.done);
    let detail = null;

    if (key === "speaking_lab") {
      const best = await bestSpeakingScore(userId, ctx.speakingScenario.id);
      done = best >= SPEAKING_PASS_THRESHOLD;
      detail = `Meilleur score : ${best}% (minimum ${SPEAKING_PASS_THRESHOLD}%)`;
    } else if (key === "composition") {
      const sub = await getSubmission(userId, ctx.composition.id);
      // Une composition corrigee (par le professeur OU validee par l'IA) debloque
      // toujours la suite : la decision du correcteur fait foi. Le score est indicatif.
      done = sub?.status === "corrected";
      detail = !sub || sub.status === "draft" ? "À rédiger" : sub.status === "submitted" ? "En attente de correction" : `Corrigée — ${sub.score ?? "—"}/100`;
    } else if (QUIZ_CONFIG[key]) {
      detail = row?.best_score != null ? `Meilleur score : ${row.best_score}% (minimum ${QUIZ_CONFIG[key].pass}%)` : `Minimum ${QUIZ_CONFIG[key].pass}%`;
    }
    tasks.push({ key, title: TASK_TITLES[key], done, detail });
  }
  return tasks;
}

// GET /api/students/me/today
export async function getToday(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;
  const ok = await requireActiveAccess(req, res, user);
  if (!ok) return;

  const ctx = await loadContext(user.id);
  if (!ctx) return sendJson(res, 404, { error: "Profil élève introuvable." });
  if (!ctx.week) return sendJson(res, 404, { error: "Contenu introuvable pour ce jour." });

  const { day, weekNumber, week, dayType } = ctx;
  const keys = taskKeysFor(dayType, ctx);
  await ensureOpened(user.id, day, keys);

  const base = {
    day,
    totalDays: TOTAL_DAYS,
    daysPerWeek: DAYS_PER_WEEK,
    dayInWeek: dayType,
    dayType,
    dayTypeLabel: DAY_TYPE_LABELS[dayType],
    week: { number: week.number, title: week.title, grammar_title: week.grammar_title },
  };
  const tasks = await evaluateTasks(user.id, ctx);
  const payload = { ...base, tasks, dayComplete: tasks.every((t) => t.done) };

  // Quiz du jour (le cas echeant) : questions SANS les bonnes reponses
  const quizKey = keys.find((k) => QUIZ_CONFIG[k]);
  if (quizKey) {
    const row = (await getTaskRows(user.id, day))[quizKey];
    const questions = await buildQuiz(quizKey, { week: weekNumber, day, studentId: user.id, attempts: row?.attempts || 0 });
    if (!questions.length && !row?.done) {
      // Pas de contenu pour ce quiz (ne devrait pas arriver) : on ne bloque jamais l'eleve.
      await markDone(user.id, day, quizKey, 100);
      payload.tasks = await evaluateTasks(user.id, ctx);
      payload.dayComplete = payload.tasks.every((t) => t.done);
    }
    payload.quiz = {
      task: quizKey,
      title: TASK_TITLES[quizKey],
      done: Boolean(row?.done),
      questions: row?.done ? [] : stripAnswers(questions),
      passThreshold: QUIZ_CONFIG[quizKey].pass,
      bestScore: row?.best_score ?? null,
      attempts: row?.attempts || 0,
    };
  }

  if (dayType === 1) {
    payload.grammarHtml = week.grammar_html;
    payload.speakingTask = week.speaking_task;
  } else if (dayType === 2) {
    payload.vocabulary = (await db.execute({ sql: "SELECT * FROM vocabulary_words WHERE week_id = ?", args: [week.id] })).rows;
    payload.images = fixRows(req, (await db.execute({ sql: "SELECT * FROM media_images WHERE week_number <= ? ORDER BY week_number DESC LIMIT 12", args: [weekNumber] })).rows, "image_url");
  } else if (dayType === 4) {
    payload.speakingTask = week.speaking_task;
    payload.keyPhrases = KEY_PHRASES[weekNumber] || [];
    payload.speakingScenario = ctx.speakingScenario;
    payload.bestSpeakingScore = ctx.speakingScenario ? await bestSpeakingScore(user.id, ctx.speakingScenario.id) : null;
    payload.speakingPassThreshold = SPEAKING_PASS_THRESHOLD;
  } else if (dayType === 5) {
    if (ctx.composition) {
      payload.composition = ctx.composition;
      payload.submission = await getSubmission(user.id, ctx.composition.id);
    } else {
      const wp = WRITING_PROMPTS[weekNumber] || { prompt: `Write a few sentences about: ${week.title}.`, minWords: 40 };
      const row = (await getTaskRows(user.id, day)).writing;
      payload.writing = { prompt: wp.prompt, minWords: wp.minWords, body: row?.body || "" };
    }
  } else if (dayType === 7) {
    const scoreRows = (await db.execute({
      sql: `SELECT day, task_key, best_score FROM day_tasks WHERE student_id = ? AND day BETWEEN ? AND ? AND best_score IS NOT NULL`,
      args: [user.id, (weekNumber - 1) * DAYS_PER_WEEK + 1, weekNumber * DAYS_PER_WEEK],
    })).rows;
    payload.weekSummary = { grammarTitle: week.grammar_title, scores: scoreRows.filter((r) => r.task_key !== "weekly_test").map((r) => ({ task: TASK_TITLES[r.task_key], score: r.best_score })) };
  }

  sendJson(res, 200, payload);
}

async function markDone(userId, day, key, score, body) {
  await db.execute({
    sql: `INSERT INTO day_tasks (student_id, day, task_key, done, best_score, attempts, body, opened_at, updated_at)
          VALUES (?, ?, ?, 1, ?, 0, ?, datetime('now'), datetime('now'))
          ON CONFLICT(student_id, day, task_key) DO UPDATE SET
            done = 1,
            best_score = CASE WHEN excluded.best_score IS NULL THEN day_tasks.best_score
                              WHEN day_tasks.best_score IS NULL OR excluded.best_score > day_tasks.best_score THEN excluded.best_score
                              ELSE day_tasks.best_score END,
            body = COALESCE(excluded.body, day_tasks.body),
            updated_at = datetime('now')`,
    args: [userId, day, key, score ?? null, body ?? null],
  });
}

// POST /api/students/me/today/task  { task: "lesson_read" | "words_seen" | "phrases" }
export async function confirmTask(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;
  const ok = await requireActiveAccess(req, res, user);
  if (!ok) return;

  const body = await readJsonBody(req);
  const task = String(body.task || "");
  if (!CONFIRM_TASKS.has(task)) return sendJson(res, 400, { error: "Tâche invalide." });

  const ctx = await loadContext(user.id);
  if (!ctx?.week) return sendJson(res, 404, { error: "Contenu introuvable." });
  if (!taskKeysFor(ctx.dayType, ctx).includes(task)) return sendJson(res, 400, { error: "Cette tâche ne fait pas partie du jour en cours." });

  await ensureOpened(user.id, ctx.day, [task]);
  const row = (await getTaskRows(user.id, ctx.day))[task];
  if (!row.done) {
    const opened = new Date(`${row.opened_at}Z`).getTime();
    const waited = (Date.now() - opened) / 1000;
    if (Number.isFinite(waited) && waited < MIN_READ_SECONDS) {
      const left = Math.ceil(MIN_READ_SECONDS - waited);
      return sendJson(res, 429, { error: `Prends encore ${left} seconde(s) pour lire avant de valider.`, retryAfter: left });
    }
    await markDone(user.id, ctx.day, task, null);
  }
  sendJson(res, 200, { ok: true });
}

// POST /api/students/me/today/submit-quiz  { answers: [{questionId, selectedIndex}] }
// (ancien nom conserve : /submit-exercises, utilise par les files hors-ligne deja en attente)
export async function submitQuiz(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;
  const ok = await requireActiveAccess(req, res, user);
  if (!ok) return;

  const ctx = await loadContext(user.id);
  if (!ctx?.week) return sendJson(res, 404, { error: "Contenu introuvable." });
  const quizKey = taskKeysFor(ctx.dayType, ctx).find((k) => QUIZ_CONFIG[k]);
  if (!quizKey) return sendJson(res, 400, { error: "Pas de quiz aujourd'hui." });

  await ensureOpened(user.id, ctx.day, [quizKey]);
  const row = (await getTaskRows(user.id, ctx.day))[quizKey];
  if (row.done) return sendJson(res, 200, { scorePct: row.best_score ?? 100, results: [], passed: true, passThreshold: QUIZ_CONFIG[quizKey].pass, alreadyDone: true });

  const body = await readJsonBody(req);
  const attempts = row.attempts || 0;
  const questions = await buildQuiz(quizKey, { week: ctx.weekNumber, day: ctx.day, studentId: user.id, attempts });
  const { scorePct, results } = gradeQuiz(questions, body.answers);
  const pass = QUIZ_CONFIG[quizKey].pass;
  const passed = scorePct >= pass;

  if (passed) {
    await markDone(user.id, ctx.day, quizKey, scorePct);
    if (quizKey === "exercises") {
      // Garde la table historique a jour (resume de semaine, anciens ecrans)
      await db.execute({
        sql: `INSERT INTO exercise_scores (id, student_id, week_number, score_pct, updated_at)
              VALUES (?, ?, ?, ?, datetime('now'))
              ON CONFLICT(student_id, week_number) DO UPDATE SET score_pct = excluded.score_pct, updated_at = datetime('now')`,
        args: [`xsc_${user.id}_${ctx.weekNumber}`, user.id, ctx.weekNumber, scorePct],
      });
    }
    await recordActivity(user.id);
  } else {
    await db.execute({
      sql: `UPDATE day_tasks SET attempts = attempts + 1, best_score = CASE WHEN best_score IS NULL OR ? > best_score THEN ? ELSE best_score END, updated_at = datetime('now')
            WHERE student_id = ? AND day = ? AND task_key = ?`,
      args: [scorePct, scorePct, user.id, ctx.day, quizKey],
    });
  }
  sendJson(res, 200, { scorePct, results, passed, passThreshold: pass, task: quizKey });
}

// POST /api/students/me/today/submit-writing  { text, submit }  (jour Writing sans composition)
export async function submitWriting(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;
  const ok = await requireActiveAccess(req, res, user);
  if (!ok) return;

  const ctx = await loadContext(user.id);
  if (!ctx?.week) return sendJson(res, 404, { error: "Contenu introuvable." });
  if (!taskKeysFor(ctx.dayType, ctx).includes("writing")) return sendJson(res, 400, { error: "Pas d'écriture courte aujourd'hui." });

  const body = await readJsonBody(req);
  const text = String(body.text || "").slice(0, 4000);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const minWords = (WRITING_PROMPTS[ctx.weekNumber] || { minWords: 40 }).minWords;

  await ensureOpened(user.id, ctx.day, ["writing"]);
  if (!body.submit) {
    await db.execute({ sql: "UPDATE day_tasks SET body = ?, updated_at = datetime('now') WHERE student_id = ? AND day = ? AND task_key = 'writing'", args: [text, user.id, ctx.day] });
    return sendJson(res, 200, { ok: true, saved: true, words: words.length });
  }
  const distinct = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z']/g, ""))).size;
  if (words.length < minWords) return sendJson(res, 400, { error: `Écris au moins ${minWords} mots (tu en as ${words.length}).` });
  if (distinct < Math.ceil(minWords / 3)) return sendJson(res, 400, { error: "Ton texte répète trop les mêmes mots : écris des phrases variées." });

  await markDone(user.id, ctx.day, "writing", null, text);
  await recordActivity(user.id);
  sendJson(res, 200, { ok: true, done: true, words: words.length });
}

// Compat : ancien nom de route
export const submitTodayExercises = submitQuiz;

// POST /api/students/me/advance-day — verifie que TOUTES les taches du jour sont
// faites, puis passe au jour suivant (jusqu'a 252).
export async function advanceDay(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;
  const access = await requireActiveAccess(req, res, user);
  if (!access) return;

  const ctx = await loadContext(user.id);
  if (!ctx?.week) return sendJson(res, 404, { error: "Profil élève introuvable." });

  const tasks = await evaluateTasks(user.id, ctx);
  const missing = tasks.filter((t) => !t.done).map((t) => {
    if (t.key === "composition") return `Ta composition doit d'abord être corrigée (${t.detail}).`;
    if (t.key === "speaking_lab") return `Termine le Speaking Lab (${t.detail}).`;
    return `À faire : ${t.title}${t.detail && QUIZ_CONFIG[t.key] ? ` — ${t.detail}` : ""}.`;
  });
  if (missing.length) return sendJson(res, 403, { error: "Termine toutes les tâches du jour pour continuer.", reasons: missing });

  const currentDay = ctx.day;
  const finishedWeek = ctx.dayType === DAYS_PER_WEEK;
  const nextDay = Math.min(TOTAL_DAYS, currentDay + 1);
  const nextWeek = dayToWeek(nextDay);
  const nextMonth = weekToMonth(nextWeek);
  // Au dernier jour du programme, "terminer" porte la progression a 100 %
  const pct = currentDay >= TOTAL_DAYS ? 100 : overallPct(nextDay);

  await db.execute({
    sql: "UPDATE student_profiles SET current_day = ?, current_week = ?, current_month = ?, overall_pct = ? WHERE user_id = ?",
    args: [nextDay, nextWeek, nextMonth, pct, user.id],
  });
  await recordActivity(user.id);

  if (finishedWeek) {
    const payload = { title: "English Academy - Progression", body: `${user.name} termine la semaine ${ctx.weekNumber}. 🎉`, url: "/admin/students.html" };
    sendPushToRole("admin", payload, "system").catch(() => {});
    sendPushToRole("superadmin", payload, "system").catch(() => {});
  }

  sendJson(res, 200, { day: nextDay, week: nextWeek, month: nextMonth, weekCompleted: finishedWeek ? ctx.weekNumber : null, courseComplete: currentDay >= TOTAL_DAYS });
}
