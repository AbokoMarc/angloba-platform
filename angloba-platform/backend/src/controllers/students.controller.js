// backend/src/controllers/students.controller.js
//
// Regle centrale demandee : un PROF ne voit que SES eleves assignes.
// Le SUPERADMIN (= prof titulaire) voit TOUS les eleves de tous les profs.
// Un ADMIN classique voit tous les eleves seulement s'il a la permission
// can_manage_students (accordee par le super admin).

import { db } from "../db/client.js";
import { requireRole, requirePermission } from "../middleware/auth.js";
import { sendJson, readJsonBody } from "../utils/http.js";

const STUDENT_SELECT = `
  SELECT u.id, u.name, u.email, u.status,
         sp.teacher_id, sp.course_name, sp.current_month, sp.current_week, sp.overall_pct,
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
