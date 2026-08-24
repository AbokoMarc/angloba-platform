// backend/src/controllers/teachers.controller.js
//
// Creation/gestion des PROFESSEURS. Jamais d'auto-inscription : seuls
// superadmin, ou un admin avec can_manage_teachers, peuvent creer un prof.

import { db } from "../db/client.js";
import { hashPassword } from "../utils/password.js";
import { newId } from "../utils/ids.js";
import { requireRole, requirePermission } from "../middleware/auth.js";
import { sendJson, readJsonBody } from "../utils/http.js";

const TEACHER_SELECT = `
  SELECT u.id, u.name, u.email, u.status, tp.subject,
    (SELECT COUNT(*) FROM student_profiles sp WHERE sp.teacher_id = u.id) as student_count
  FROM users u JOIN teacher_profiles tp ON tp.user_id = u.id
  WHERE u.role IN ('teacher','superadmin')
`;

// GET /api/teachers — visible par teacher (liste simple, pour "assigner a"),
// admin et superadmin.
export async function listTeachers(req, res) {
  const user = requireRole(req, res, "teacher", "admin", "superadmin");
  if (!user) return;
  const result = await db.execute({ sql: TEACHER_SELECT, args: [] });
  sendJson(res, 200, { teachers: result.rows });
}

// POST /api/teachers — creation. superadmin toujours ok, admin si permission.
export async function createTeacher(req, res) {
  const user = requireRole(req, res, "admin", "superadmin");
  if (!user) return;
  if (user.role === "admin") {
    const ok = await requirePermission(req, res, user, "can_manage_teachers");
    if (!ok) return;
  }

  const body = await readJsonBody(req);
  const { name, email, subject } = body;
  if (!name || !email) return sendJson(res, 400, { error: "Nom et email requis." });

  const existing = await db.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [email.toLowerCase().trim()] });
  if (existing.rows.length) return sendJson(res, 409, { error: "Email deja utilise." });

  // Mot de passe temporaire genere (a communiquer au prof) — pattern identique a Clo-Clo pour les livreurs.
  const tempPassword = Math.random().toString(36).slice(-8);
  const { hash, salt } = hashPassword(tempPassword);
  const id = newId("usr");

  await db.execute({
    sql: `INSERT INTO users (id, role, name, email, password_hash, password_salt, status)
          VALUES (?, 'teacher', ?, ?, ?, ?, 'active')`,
    args: [id, name.trim(), email.toLowerCase().trim(), hash, salt],
  });
  await db.execute({
    sql: "INSERT INTO teacher_profiles (user_id, subject) VALUES (?, ?)",
    args: [id, subject || "English"],
  });

  sendJson(res, 201, {
    teacher: { id, name, email, subject: subject || "English" },
    temporaryPassword: tempPassword, // affiche UNE SEULE FOIS au createur, comme Clo-Clo
  });
}

// PATCH /api/teachers/:id — enable/disable (jamais de suppression brute).
export async function updateTeacherStatus(req, res, params) {
  const user = requireRole(req, res, "admin", "superadmin");
  if (!user) return;
  if (user.role === "admin") {
    const ok = await requirePermission(req, res, user, "can_manage_teachers");
    if (!ok) return;
  }

  const body = await readJsonBody(req);
  await db.execute({ sql: "UPDATE users SET status = ? WHERE id = ? AND role = 'teacher'", args: [body.status, params.id] });

  // Si desactive : les eleves repassent "non assigne" — a l'admin de les rediriger.
  if (body.status === "inactive") {
    await db.execute({ sql: "UPDATE student_profiles SET teacher_id = NULL WHERE teacher_id = ?", args: [params.id] });
  }
  sendJson(res, 200, { ok: true });
}
