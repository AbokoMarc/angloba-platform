// backend/src/controllers/students.controller.js
//
// Regle centrale demandee : un PROF ne voit que SES eleves assignes.
// Le SUPERADMIN (= prof titulaire) voit TOUS les eleves de tous les profs.
// Un ADMIN classique voit tous les eleves seulement s'il a la permission
// can_manage_students (accordee par le super admin).

import { db } from "../db/client.js";
import { requireRole, requirePermission } from "../middleware/auth.js";
import { sendJson, readJsonBody } from "../utils/http.js";
import { recordActivity } from "../utils/activity.js";
import { sendPushToRole } from "../services/webpush.service.js";

const EXERCISE_PASS_THRESHOLD = Number(process.env.EXERCISE_PASS_THRESHOLD || 60);
const COMPOSITION_PASS_THRESHOLD = Number(process.env.COMPOSITION_PASS_THRESHOLD || 50);
const SPEAKING_PASS_THRESHOLD = Number(process.env.SPEAKING_PASS_THRESHOLD || 70);

const STUDENT_SELECT = `
  SELECT u.id, u.name, u.email, u.status,
         sp.teacher_id, sp.course_name, sp.current_month, sp.current_week, sp.overall_pct,
         sp.subscription_status, sp.trial_ends_at, sp.subscription_expires_at,
         t.name as teacher_name
  FROM users u
  JOIN student_profiles sp ON sp.user_id = u.id
  LEFT JOIN users t ON t.id = sp.teacher_id
  WHERE u.role = 'student'
`;

// GET /api/students
// - teacher : seulement ses eleves
// - superadmin : tous
// - admin : tous SI can_manage_students, sinon 403
export async function listStudents(req, res) {
  const user = requireRole(req, res, "teacher", "admin", "superadmin");
  if (!user) return;

  if (user.role === "admin") {
    const ok = await requirePermission(req, res, user, "can_manage_students");
    if (!ok) return;
  }

  let result;
  if (user.role === "teacher") {
    result = await db.execute({
      sql: STUDENT_SELECT + " AND sp.teacher_id = ?",
      args: [user.id],
    });
  } else {
    result = await db.execute({ sql: STUDENT_SELECT, args: [] });
  }
  sendJson(res, 200, { students: result.rows });
}

// PATCH /api/students/:id  — reassigner prof/cours, activer/desactiver.
// Reserve a superadmin, ou admin avec can_manage_students.
export async function updateStudent(req, res, params) {
  const user = requireRole(req, res, "admin", "superadmin");
  if (!user) return;
  if (user.role === "admin") {
    const ok = await requirePermission(req, res, user, "can_manage_students");
    if (!ok) return;
  }

  const studentId = params.id;
  const body = await readJsonBody(req);
  const fields = [];
  const args = [];

  if (body.teacherId !== undefined) { fields.push("teacher_id = ?"); args.push(body.teacherId || null); }
  if (body.courseName !== undefined) { fields.push("course_name = ?"); args.push(body.courseName); }
  if (body.currentMonth !== undefined) { fields.push("current_month = ?"); args.push(body.currentMonth); }
  if (body.currentWeek !== undefined) { fields.push("current_week = ?"); args.push(body.currentWeek); }

  // L'admin peut debloquer manuellement l'abonnement d'un eleve (ex: paiement
  // recu hors plateforme, geste commercial...) — sans passer par NotchPay.
  if (body.grantSubscriptionDays !== undefined) {
    const days = Number(body.grantSubscriptionDays);
    const current = (await db.execute({ sql: "SELECT subscription_expires_at FROM student_profiles WHERE user_id = ?", args: [studentId] })).rows[0];
    const base = current?.subscription_expires_at && new Date(current.subscription_expires_at + "Z") > new Date()
      ? new Date(current.subscription_expires_at + "Z")
      : new Date();
    base.setDate(base.getDate() + days);
    fields.push("subscription_status = 'active'");
    fields.push("subscription_expires_at = ?");
    args.push(base.toISOString().slice(0, 19).replace("T", " "));
  }

  if (fields.length) {
    args.push(studentId);
    await db.execute({ sql: `UPDATE student_profiles SET ${fields.join(", ")} WHERE user_id = ?`, args });
  }
  if (body.status !== undefined) {
    await db.execute({ sql: "UPDATE users SET status = ? WHERE id = ?", args: [body.status, studentId] });
  }

  sendJson(res, 200, { ok: true });
}

// GET /api/students/me/dashboard — vue eleve de son propre etat (prof, semaine, progres)
export async function myDashboard(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;

  const result = await db.execute({
    sql: `SELECT sp.*, w.title as week_title, w.number as week_number, m.title as month_title, m.number as month_number
          FROM student_profiles sp
          LEFT JOIN weeks w ON w.number = sp.current_week
          LEFT JOIN months m ON m.number = sp.current_month
          WHERE sp.user_id = ?`,
    args: [user.id],
  });
  sendJson(res, 200, { profile: result.rows[0] || null });
}

// GET /api/students/leaderboard — classement des eleves (desactivable par
// l'admin dans Appearance). Trie par semaine actuelle puis score global —
// avance dans le programme compte plus qu'un bon score sur peu de contenu.
export async function leaderboard(req, res) {
  const user = requireRole(req, res, "student", "teacher", "admin", "superadmin");
  if (!user) return;

  const settings = (await db.execute({ sql: "SELECT show_leaderboard FROM appearance_settings WHERE id = 1", args: [] })).rows[0];
  if (settings && settings.show_leaderboard === 0 && user.role === "student") {
    return sendJson(res, 200, { enabled: false, entries: [] });
  }

  const rows = (await db.execute({
    sql: `SELECT u.id, u.name, sp.current_week, sp.current_month, sp.overall_pct, sp.streak_days
          FROM student_profiles sp JOIN users u ON u.id = sp.user_id
          WHERE u.status = 'active'
          ORDER BY sp.current_week DESC, sp.overall_pct DESC
          LIMIT 50`,
    args: [],
  })).rows;

  sendJson(res, 200, { enabled: true, entries: rows, meId: user.role === "student" ? user.id : null });
}

// POST /api/students/me/advance-week — l'eleve marque sa semaine actuelle
// comme terminee et passe a la suivante.
//
// CONDITIONS DE DEBLOCAGE (demande explicite : validation par prof OU IA) :
//  1) Si la semaine a des exercices, il faut un score >= EXERCISE_PASS_THRESHOLD
//     (voir /courses/weeks/:number/submit-exercises)
//  2) Si une composition est prevue a cette semaine, elle doit etre
//     'corrected' avec un score >= COMPOSITION_PASS_THRESHOLD — correction
//     venant soit du professeur, soit de l'IA quand elle juge la copie
//     suffisamment bonne (voir /compositions/submissions/:id/ai-review)
//
// Auto-limite : ne peut jamais depasser la semaine 36, et le mois se
// recalcule automatiquement a partir du numero de semaine.
export async function advanceMyWeek(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;

  const profile = (await db.execute({
    sql: "SELECT current_week FROM student_profiles WHERE user_id = ?",
    args: [user.id],
  })).rows[0];
  if (!profile) return sendJson(res, 404, { error: "Profil eleve introuvable." });

  const currentWeek = profile.current_week;
  const missing = [];

  // Condition 1 : exercices
  const weekRow = (await db.execute({ sql: "SELECT id FROM weeks WHERE number = ?", args: [currentWeek] })).rows[0];
  const exerciseCount = weekRow
    ? (await db.execute({ sql: "SELECT COUNT(*) as n FROM exercises WHERE week_id = ?", args: [weekRow.id] })).rows[0].n
    : 0;

  if (exerciseCount > 0) {
    const scoreRow = (await db.execute({
      sql: "SELECT score_pct FROM exercise_scores WHERE student_id = ? AND week_number = ?",
      args: [user.id, currentWeek],
    })).rows[0];
    if (!scoreRow || scoreRow.score_pct < EXERCISE_PASS_THRESHOLD) {
      missing.push(`Termine les exercices de la semaine (score minimum ${EXERCISE_PASS_THRESHOLD}%, ton meilleur score actuel : ${scoreRow ? scoreRow.score_pct : 0}%).`);
    }
  }

  // Condition 2 : composition due a cette semaine
  const composition = weekRow
    ? (await db.execute({ sql: "SELECT id, title FROM compositions WHERE week_id = ?", args: [weekRow.id] })).rows[0]
    : null;
  if (composition) {
    const submission = (await db.execute({
      sql: "SELECT status, score FROM composition_submissions WHERE composition_id = ? AND student_id = ?",
      args: [composition.id, user.id],
    })).rows[0];
    const ok = submission && submission.status === "corrected" && submission.score >= COMPOSITION_PASS_THRESHOLD;
    if (!ok) {
      missing.push(`Ta composition "${composition.title}" doit d'abord etre validee (score minimum ${COMPOSITION_PASS_THRESHOLD}/100) par ton professeur ou par l'IA.`);
    }
  }

  // Condition 3 : scenario de Speaking Lab rattache a cette semaine — un
  // score >= SPEAKING_PASS_THRESHOLD suffit (delibbrement pas plus exigeant,
  // pour ne pas bloquer l'eleve indefiniment sur la prononciation).
  const speakingScenario = (await db.execute({ sql: "SELECT id, title FROM speaking_scenarios WHERE week_number = ?", args: [currentWeek] })).rows[0];
  if (speakingScenario) {
    const bestSession = (await db.execute({
      sql: "SELECT scores_json FROM speaking_sessions WHERE student_id = ? AND scenario_id = ? ORDER BY created_at DESC",
      args: [user.id, speakingScenario.id],
    })).rows;
    const passed = bestSession.some((s) => {
      try { return JSON.parse(s.scores_json).overall >= SPEAKING_PASS_THRESHOLD; } catch { return false; }
    });
    if (!passed) {
      missing.push(`Termine le Speaking Lab "${speakingScenario.title}" avec un score d'au moins ${SPEAKING_PASS_THRESHOLD}%.`);
    }
  }

  if (missing.length) {
    return sendJson(res, 403, { error: "Conditions non remplies pour avancer.", reasons: missing });
  }

  const nextWeekNumber = Math.min(currentWeek + 1, 36);

  const nextWeekRow = (await db.execute({
    sql: "SELECT month_id FROM weeks WHERE number = ?",
    args: [nextWeekNumber],
  })).rows[0];
  const monthRow = nextWeekRow
    ? (await db.execute({ sql: "SELECT number FROM months WHERE id = ?", args: [nextWeekRow.month_id] })).rows[0]
    : null;

  await db.execute({
    sql: "UPDATE student_profiles SET current_week = ?, current_month = ? WHERE user_id = ?",
    args: [nextWeekNumber, monthRow ? monthRow.number : profile.current_month, user.id],
  });

  await recordActivity(user.id);

  sendPushToRole("admin", { title: "English Academy - Progression", body: `${user.name} passe à la semaine ${nextWeekNumber}. 🎉`, url: "/admin/students.html" }, "system").catch(() => {});
  sendPushToRole("superadmin", { title: "English Academy - Progression", body: `${user.name} passe à la semaine ${nextWeekNumber}. 🎉`, url: "/admin/students.html" }, "system").catch(() => {});

  sendJson(res, 200, { currentWeek: nextWeekNumber, currentMonth: monthRow ? monthRow.number : null });
}
