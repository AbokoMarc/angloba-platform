// backend/src/controllers/admins.controller.js
//
// Gestion des comptes ADMIN par le SUPER ADMIN uniquement.
// Le super admin peut nommer des admins et leur accorder des droits
// precis (gerer les profs, les eleves, les cours, l'apparence, les medias).
// AUCUN admin classique ne peut modifier ces droits (meme pas les siens),
// ni creer/gerer d'autres admins : can_manage_admins n'est jamais
// accordable — c'est le seul privilege strictement reserve au super admin.

import { db } from "../db/client.js";
import { hashPassword } from "../utils/password.js";
import { newId } from "../utils/ids.js";
import { requireRole } from "../middleware/auth.js";
import { sendJson, readJsonBody } from "../utils/http.js";

const PERMISSION_FIELDS = [
  "can_manage_teachers",
  "can_manage_students",
  "can_manage_courses",
  "can_manage_appearance",
  "can_manage_media",
];

// GET /api/admins — reserve au super admin
export async function listAdmins(req, res) {
  const user = requireRole(req, res, "superadmin");
  if (!user) return;

  const result = await db.execute({
    sql: `SELECT u.id, u.name, u.email, u.status, ap.*
          FROM users u JOIN admin_permissions ap ON ap.user_id = u.id
          WHERE u.role = 'admin'`,
    args: [],
  });
  sendJson(res, 200, { admins: result.rows });
}

// POST /api/admins — creer un nouvel admin avec des droits choisis a la creation
export async function createAdmin(req, res) {
  const user = requireRole(req, res, "superadmin");
  if (!user) return;

  const body = await readJsonBody(req);
  const { name, email, permissions = {} } = body;
  if (!name || !email) return sendJson(res, 400, { error: "Nom et email requis." });

  const existing = await db.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [email.toLowerCase().trim()] });
  if (existing.rows.length) return sendJson(res, 409, { error: "Email deja utilise." });

  const tempPassword = Math.random().toString(36).slice(-8);
  const { hash, salt } = hashPassword(tempPassword);
  const id = newId("usr");

  await db.execute({
    sql: `INSERT INTO users (id, role, name, email, password_hash, password_salt, status)
          VALUES (?, 'admin', ?, ?, ?, ?, 'active')`,
    args: [id, name.trim(), email.toLowerCase().trim(), hash, salt],
  });

  const values = PERMISSION_FIELDS.map((f) => (permissions[f] ? 1 : 0));
  await db.execute({
    sql: `INSERT INTO admin_permissions (user_id, ${PERMISSION_FIELDS.join(", ")})
          VALUES (?, ${PERMISSION_FIELDS.map(() => "?").join(", ")})`,
    args: [id, ...values],
  });

  sendJson(res, 201, { admin: { id, name, email }, temporaryPassword: tempPassword });
}

// PATCH /api/admins/:id/permissions — le super admin ajuste les droits a tout moment
export async function updateAdminPermissions(req, res, params) {
  const user = requireRole(req, res, "superadmin");
  if (!user) return;

  const body = await readJsonBody(req);
  const sets = [];
  const args = [];
  for (const field of PERMISSION_FIELDS) {
    if (body[field] !== undefined) {
      sets.push(`${field} = ?`);
      args.push(body[field] ? 1 : 0);
    }
  }
  if (!sets.length) return sendJson(res, 400, { error: "Aucune permission fournie." });

  args.push(params.id);
  await db.execute({ sql: `UPDATE admin_permissions SET ${sets.join(", ")} WHERE user_id = ?`, args });
  sendJson(res, 200, { ok: true });
}

// PATCH /api/admins/:id/status — activer/desactiver un admin
export async function updateAdminStatus(req, res, params) {
  const user = requireRole(req, res, "superadmin");
  if (!user) return;
  const body = await readJsonBody(req);
  await db.execute({ sql: "UPDATE users SET status = ? WHERE id = ? AND role = 'admin'", args: [body.status, params.id] });
  sendJson(res, 200, { ok: true });
}
