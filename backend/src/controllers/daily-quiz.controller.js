// backend/src/controllers/daily-quiz.controller.js
//
// Quiz "bonus" calendaire (un par jour civil, distinct du jour "Exercises"
// du parcours principal) — pratique supplementaire optionnelle.

import { db } from "../db/client.js";
import { requireRole } from "../middleware/auth.js";
import { requireActiveAccess } from "../middleware/subscription.js";
import { sendJson, readJsonBody } from "../utils/http.js";
import { newId } from "../utils/ids.js";
import { recordActivity } from "../utils/activity.js";
import { sendPushToRole } from "../services/webpush.service.js";
import { generateQuestionSet, gradeAnswers } from "../utils/daily-exercises.js";

export async function getDailyQuiz(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;
  const ok = await requireActiveAccess(req, res, user);
  if (!ok) return;

  const profile = (await db.execute({ sql: "SELECT current_week FROM student_profiles WHERE user_id = ?", args: [user.id] })).rows[0];
  const currentWeek = profile?.current_week || 1;
  const today = new Date().toISOString().slice(0, 10);

  const questions = await generateQuestionSet(currentWeek, `${user.id}-${today}`);

  const alreadyDone = (await db.execute({
    sql: "SELECT score_pct FROM daily_quiz_attempts WHERE student_id = ? AND quiz_date = ?",
    args: [user.id, today],
  })).rows[0];

  sendJson(res, 200, {
    quizDate: today,
    alreadyDone: alreadyDone ? alreadyDone.score_pct : null,
    questions,
  });
}

export async function submitDailyQuiz(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;

  const body = await readJsonBody(req);
  const answers = body.answers || [];
  if (!answers.length) return sendJson(res, 400, { error: "Aucune reponse fournie." });

  const { scorePct, results } = await gradeAnswers(answers);
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
