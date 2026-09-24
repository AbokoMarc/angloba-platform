// backend/src/controllers/days.controller.js
//
// Coeur du parcours JOURNALIER (Day 1, Day 2... Day 180). Chaque semaine se
// deroule sur 5 jours (voir day-mapping.js) :
//   1 Grammar · 2 Vocabulary · 3 Exercises (20 questions, notees) ·
//   4 Practice (composition/speaking si rattaches a la semaine) · 5 Review
//
// Un seul point d'entree pour l'eleve : GET /today renvoie exactement ce
// qu'il doit voir aujourd'hui, deja resolu (plus besoin de jongler avec les
// numeros de semaine cote frontend).

import { db } from "../db/client.js";
import { requireRole } from "../middleware/auth.js";
import { requireActiveAccess } from "../middleware/subscription.js";
import { sendJson, readJsonBody } from "../utils/http.js";
import { recordActivity } from "../utils/activity.js";
import { sendPushToRole, sendPushToUser } from "../services/webpush.service.js";
import { generateQuestionSet, gradeAnswers } from "../utils/daily-exercises.js";
import { dayToWeek, dayTypeOf, weekToMonth, DAY_TYPE_LABELS, TOTAL_DAYS } from "../utils/day-mapping.js";

const EXERCISE_PASS_THRESHOLD = Number(process.env.EXERCISE_PASS_THRESHOLD || 60);
const COMPOSITION_PASS_THRESHOLD = Number(process.env.COMPOSITION_PASS_THRESHOLD || 50);
const SPEAKING_PASS_THRESHOLD = Number(process.env.SPEAKING_PASS_THRESHOLD || 70);

// GET /api/students/me/today — tout le contenu du jour courant, deja resolu.
export async function getToday(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;
  const ok = await requireActiveAccess(req, res, user);
  if (!ok) return;

  const profile = (await db.execute({ sql: "SELECT current_day FROM student_profiles WHERE user_id = ?", args: [user.id] })).rows[0];
  const currentDay = profile?.current_day || 1;
  const weekNumber = dayToWeek(currentDay);
  const dayType = dayTypeOf(currentDay);

  const week = (await db.execute({ sql: "SELECT * FROM weeks WHERE number = ?", args: [weekNumber] })).rows[0];
  if (!week) return sendJson(res, 404, { error: "Contenu introuvable pour ce jour." });

  const base = {
    day: currentDay,
    totalDays: TOTAL_DAYS,
    dayType,
    dayTypeLabel: DAY_TYPE_LABELS[dayType],
    week: { number: week.number, title: week.title, grammar_title: week.grammar_title },
  };

  if (dayType === 1) {
    return sendJson(res, 200, { ...base, grammarHtml: week.grammar_html, speakingTask: week.speaking_task });
  }

  if (dayType === 2) {
    const vocabulary = (await db.execute({ sql: "SELECT * FROM vocabulary_words WHERE week_id = ?", args: [week.id] })).rows;
    const images = (await db.execute({ sql: "SELECT * FROM media_images WHERE week_number <= ? ORDER BY week_number ASC", args: [weekNumber] })).rows;
    return sendJson(res, 200, { ...base, vocabulary, images });
  }

  if (dayType === 3) {
    const existingScore = (await db.execute({ sql: "SELECT score_pct FROM exercise_scores WHERE student_id = ? AND week_number = ?", args: [user.id, weekNumber] })).rows[0];
    const questions = await generateQuestionSet(weekNumber, `${user.id}-week${weekNumber}-exercises`);
    return sendJson(res, 200, { ...base, questions, bestScore: existingScore?.score_pct ?? null, passThreshold: EXERCISE_PASS_THRESHOLD });
  }

  if (dayType === 4) {
    const composition = (await db.execute({ sql: "SELECT * FROM compositions WHERE week_id = ?", args: [week.id] })).rows[0] || null;
    let submission = null;
    if (composition) {
      submission = (await db.execute({ sql: "SELECT * FROM composition_submissions WHERE composition_id = ? AND student_id = ?", args: [composition.id, user.id] })).rows[0] || null;
    }
    const speakingScenario = (await db.execute({ sql: "SELECT * FROM speaking_scenarios WHERE week_number = ?", args: [weekNumber] })).rows[0] || null;
    let bestSpeakingScore = null;
    if (speakingScenario) {
      const sessions = (await db.execute({ sql: "SELECT scores_json FROM speaking_sessions WHERE student_id = ? AND scenario_id = ?", args: [user.id, speakingScenario.id] })).rows;
      bestSpeakingScore = sessions.reduce((max, s) => {
        try { return Math.max(max, JSON.parse(s.scores_json).overall || 0); } catch { return max; }
      }, 0);
    }
    return sendJson(res, 200, {
      ...base, composition, submission, speakingScenario,
      bestSpeakingScore, speakingPassThreshold: SPEAKING_PASS_THRESHOLD, compositionPassThreshold: COMPOSITION_PASS_THRESHOLD,
    });
  }

  // dayType === 5 : Review
  const exoScore = (await db.execute({ sql: "SELECT score_pct FROM exercise_scores WHERE student_id = ? AND week_number = ?", args: [user.id, weekNumber] })).rows[0];
  return sendJson(res, 200, { ...base, weekSummary: { grammarTitle: week.grammar_title, exerciseScore: exoScore?.score_pct ?? null } });
}

// POST /api/students/me/today/submit-exercises — pour le jour type "Exercises"
export async function submitTodayExercises(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;

  const profile = (await db.execute({ sql: "SELECT current_day FROM student_profiles WHERE user_id = ?", args: [user.id] })).rows[0];
  const weekNumber = dayToWeek(profile?.current_day || 1);

  const body = await readJsonBody(req);
  const { scorePct, results } = await gradeAnswers(body.answers || []);

  await db.execute({
    sql: `INSERT INTO exercise_scores (id, student_id, week_number, score_pct, updated_at)
          VALUES (?, ?, ?, ?, datetime('now'))
          ON CONFLICT(student_id, week_number) DO UPDATE SET score_pct = excluded.score_pct, updated_at = datetime('now')`,
    args: [`xsc_${user.id}_${weekNumber}`, user.id, weekNumber, scorePct],
  });

  sendJson(res, 200, { scorePct, results, passed: scorePct >= EXERCISE_PASS_THRESHOLD, passThreshold: EXERCISE_PASS_THRESHOLD });
}

// POST /api/students/me/advance-day — verifie les conditions du jour COURANT
// puis avance a Day+1 (jusqu'a 180 max). Recalcule aussi current_week /
// current_month (gardes en synchro pour le classement et les outils admin
// existants qui raisonnent encore en semaines).
export async function advanceDay(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;

  const profile = (await db.execute({ sql: "SELECT current_day FROM student_profiles WHERE user_id = ?", args: [user.id] })).rows[0];
  if (!profile) return sendJson(res, 404, { error: "Profil eleve introuvable." });

  const currentDay = profile.current_day;
  const weekNumber = dayToWeek(currentDay);
  const dayType = dayTypeOf(currentDay);
  const missing = [];

  if (dayType === 3) {
    const scoreRow = (await db.execute({ sql: "SELECT score_pct FROM exercise_scores WHERE student_id = ? AND week_number = ?", args: [user.id, weekNumber] })).rows[0];
    if (!scoreRow || scoreRow.score_pct < EXERCISE_PASS_THRESHOLD) {
      missing.push(`Termine les 20 exercices du jour (score minimum ${EXERCISE_PASS_THRESHOLD}%, ton meilleur score actuel : ${scoreRow ? scoreRow.score_pct : 0}%).`);
    }
  }

  if (dayType === 4) {
    const week = (await db.execute({ sql: "SELECT id FROM weeks WHERE number = ?", args: [weekNumber] })).rows[0];
    const composition = week ? (await db.execute({ sql: "SELECT id, title FROM compositions WHERE week_id = ?", args: [week.id] })).rows[0] : null;
    if (composition) {
      const submission = (await db.execute({ sql: "SELECT status, score FROM composition_submissions WHERE composition_id = ? AND student_id = ?", args: [composition.id, user.id] })).rows[0];
      const ok = submission && submission.status === "corrected" && submission.score >= COMPOSITION_PASS_THRESHOLD;
      if (!ok) missing.push(`Ta composition "${composition.title}" doit d'abord etre validee (score minimum ${COMPOSITION_PASS_THRESHOLD}/100) par ton professeur ou par l'IA.`);
    }
    const speakingScenario = (await db.execute({ sql: "SELECT id, title FROM speaking_scenarios WHERE week_number = ?", args: [weekNumber] })).rows[0];
    if (speakingScenario) {
      const sessions = (await db.execute({ sql: "SELECT scores_json FROM speaking_sessions WHERE student_id = ? AND scenario_id = ?", args: [user.id, speakingScenario.id] })).rows;
      const passed = sessions.some((s) => { try { return JSON.parse(s.scores_json).overall >= SPEAKING_PASS_THRESHOLD; } catch { return false; } });
      if (!passed) missing.push(`Termine le Speaking Lab "${speakingScenario.title}" avec un score d'au moins ${SPEAKING_PASS_THRESHOLD}%.`);
    }
  }

  if (missing.length) {
    return sendJson(res, 403, { error: "Conditions non remplies pour avancer.", reasons: missing });
  }

  const nextDay = Math.min(TOTAL_DAYS, currentDay + 1);
  const nextWeek = dayToWeek(nextDay);
  const nextMonth = weekToMonth(nextWeek);

  await db.execute({
    sql: "UPDATE student_profiles SET current_day = ?, current_week = ?, current_month = ? WHERE user_id = ?",
    args: [nextDay, nextWeek, nextMonth, user.id],
  });
  await recordActivity(user.id);

  const finishedWeek = dayTypeOf(currentDay) === 5;
  if (finishedWeek) {
    sendPushToRole("admin", { title: "English Academy - Progression", body: `${user.name} termine la semaine ${weekNumber}. 🎉`, url: "/admin/students.html" }, "system").catch(() => {});
    sendPushToRole("superadmin", { title: "English Academy - Progression", body: `${user.name} termine la semaine ${weekNumber}. 🎉`, url: "/admin/students.html" }, "system").catch(() => {});
  }

  sendJson(res, 200, { day: nextDay, week: nextWeek, month: nextMonth });
}
