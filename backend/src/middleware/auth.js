// backend/src/middleware/auth.js
//
// Verifie le JWT et attache req.user = { id, role, name }.
// Fournit aussi requireRole(...roles) et requirePermission(flag) pour
// les comptes 'admin' (le superadmin passe toujours, il a tous les droits).

import { verifyToken } from "../utils/jwt.js";
import { db } from "../db/client.js";
import { sendJson } from "../utils/http.js";

export function getUserFromRequest(req) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  return verifyToken(token); // { sub, role, name, iat, exp } ou null
}

// --- Statut du compte (actif / desactive) ---
// Le JWT dure 1 an : sans verification, un eleve/prof/admin DESACTIVE garderait
// son acces a l'API jusqu'a expiration du jeton. server.js appelle cette
// verification avant chaque handler (1 requete SQL par utilisateur et par minute).
const STATUS_TTL_MS = 60 * 1000;
const statusCache = new Map(); // userId -> { active, at }

export function invalidateUserStatus(userId) {
  if (userId) statusCache.delete(userId); else statusCache.clear();
}

// Retourne false si le jeton est valide MAIS le compte est desactive/supprime.
// Pas de jeton ou jeton invalide : true (les handlers renverront leur 401 habituel).
export async function isAccountActive(req) {
  const payload = getUserFromRequest(req);
  if (!payload) return true;
  const cached = statusCache.get(payload.sub);
  if (cached && Date.now() - cached.at < STATUS_TTL_MS) return cached.active;
  const row = (await db.execute({ sql: "SELECT status FROM users WHERE id = ?", args: [payload.sub] })).rows[0];
  const active = Boolean(row) && row.status === "active";
  statusCache.set(payload.sub, { active, at: Date.now() });
  return active;
}

// A utiliser au debut de chaque handler protege.
// Retourne l'utilisateur ou envoie une 401 et retourne null.
export function requireAuth(req, res) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    sendJson(res, 401, { error: "Non authentifie." });
    return null;
  }
  return { id: payload.sub, role: payload.role, name: payload.name };
}

export function requireRole(req, res, ...allowedRoles) {
  const user = requireAuth(req, res);
  if (!user) return null;
  if (!allowedRoles.includes(user.role)) {
    sendJson(res, 403, { error: "Acces refuse pour ce role." });
    return null;
  }
  return user;
}

// Pour les comptes 'admin' uniquement (pas superadmin) : verifie une
// permission precise dans admin_permissions. superadmin et teacher/student
// ne passent pas par ici — utiliser requireRole avant.
export async function requirePermission(req, res, user, flagColumn) {
  if (user.role === "superadmin") return true; // tout accorde
  if (user.role !== "admin") {
    sendJson(res, 403, { error: "Reserve aux administrateurs." });
    return false;
  }
  const result = await db.execute({
    sql: `SELECT ${flagColumn} as flag FROM admin_permissions WHERE user_id = ?`,
    args: [user.id],
  });
  const allowed = result.rows[0]?.flag === 1;
  if (!allowed) {
    sendJson(res, 403, { error: "Ton compte admin n'a pas cette permission." });
    return false;
  }
  return true;
}
