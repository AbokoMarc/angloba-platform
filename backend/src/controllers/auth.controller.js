// backend/src/controllers/auth.controller.js
import { db } from "../db/client.js";
import { hashPasswordAsync, verifyPasswordAsync } from "../utils/password.js";
import { allow, clientIp } from "../utils/rate-limit.js";
import { signToken } from "../utils/jwt.js";
import { newId } from "../utils/ids.js";
import { sendJson, readJsonBody } from "../utils/http.js";
import { requireAuth } from "../middleware/auth.js";
import { sendPushToRole } from "../services/webpush.service.js";

// POST /api/auth/register  — INSCRIPTION LIBRE, reservee aux ELEVES.
// Les comptes professeur/admin ne peuvent JAMAIS s'auto-inscrire ici :
// ils sont crees uniquement par le super admin (ou un admin habilite).
export async function register(req, res) {
  // Anti-spam : 10 inscriptions / heure / adresse IP.
  if (!allow(`reg:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
    return sendJson(res, 429, { error: "Trop d'inscriptions depuis cette connexion. Reessaie dans une heure." });
  }

  const body = await readJsonBody(req);
  const { name, email, password } = body;

  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || !name.trim() || !email.trim() || !password) {
    return sendJson(res, 400, { error: "Nom, email et mot de passe requis." });
  }
  if (name.length > 100 || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return sendJson(res, 400, { error: "Adresse email invalide." });
  }
  if (password.length < 6) {
    return sendJson(res, 400, { error: "Le mot de passe doit faire au moins 6 caracteres." });
  }
  if (password.length > 200) {
    return sendJson(res, 400, { error: "Mot de passe trop long." });
  }

  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [email.toLowerCase().trim()],
  });
  if (existing.rows.length > 0) {
    return sendJson(res, 409, { error: "Un compte existe deja avec cet email." });
  }

  const { hash, salt } = await hashPasswordAsync(password);
  const id = newId("usr");

  await db.execute({
    sql: `INSERT INTO users (id, role, name, email, password_hash, password_salt, status)
          VALUES (?, 'student', ?, ?, ?, ?, 'active')`,
    args: [id, name.trim(), email.toLowerCase().trim(), hash, salt],
  });
  await db.execute({
    sql: `INSERT INTO student_profiles (user_id, teacher_id, current_month, current_week, subscription_status, trial_ends_at)
          VALUES (?, NULL, 1, 1, 'trial', datetime('now', '+7 days'))`,
    args: [id],
  });

  const token = signToken({ sub: id, role: "student", name: name.trim() });
  sendJson(res, 201, { token, user: { id, role: "student", name: name.trim(), email } });
}

// POST /api/auth/login — utilise par LES 4 ROLES (student/teacher/admin/superadmin).
// Le frontend redirige ensuite vers le bon espace selon `user.role`.
export async function login(req, res) {
  const body = await readJsonBody(req);
  const { email, password } = body;
  if (typeof email !== "string" || typeof password !== "string" || !email || !password || password.length > 200) {
    return sendJson(res, 400, { error: "Email et mot de passe requis." });
  }

  // Anti brute-force : 8 essais / 15 min par (IP + email), 40 / 15 min par IP.
  const ip = clientIp(req);
  const emailKey = email.toLowerCase().trim();
  if (!allow(`login:${ip}:${emailKey}`, 8, 15 * 60 * 1000) || !allow(`loginip:${ip}`, 40, 15 * 60 * 1000)) {
    return sendJson(res, 429, { error: "Trop de tentatives. Reessaie dans quelques minutes." });
  }

  const result = await db.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email.toLowerCase().trim()],
  });
  const user = result.rows[0];

  if (!user || !(await verifyPasswordAsync(password, user.password_hash, user.password_salt))) {
    return sendJson(res, 401, { error: "Email ou mot de passe incorrect." });
  }
  if (user.status !== "active") {
    return sendJson(res, 403, { error: "Ce compte a ete desactive. Contacte l'administration." });
  }

  const token = signToken({ sub: user.id, role: user.role, name: user.name });

  if (user.role === "student") {
    sendPushToRole("admin", { title: "English Academy - Connexion", body: `${user.name} vient de se connecter.`, url: "/admin/students.html" }, "system").catch(() => {});
    sendPushToRole("superadmin", { title: "English Academy - Connexion", body: `${user.name} vient de se connecter.`, url: "/admin/students.html" }, "system").catch(() => {});
  }

  sendJson(res, 200, {
    token,
    user: { id: user.id, role: user.role, name: user.name, email: user.email },
  });
}

// GET /api/auth/me — verifie le token et renvoie l'identite courante.
// Utilise par le frontend au chargement de chaque page protegee pour
// decider quelle sidebar/nav afficher (jamais deux roles sur un meme ecran).
export async function me(req, res) {
  const authUser = requireAuth(req, res);
  if (!authUser) return;

  const result = await db.execute({
    sql: "SELECT id, role, name, email, status FROM users WHERE id = ?",
    args: [authUser.id],
  });
  const user = result.rows[0];
  if (!user) return sendJson(res, 404, { error: "Utilisateur introuvable." });

  // Pour un compte 'admin' classique, on renvoie ses permissions afin que
  // le frontend puisse adapter la sidebar (masquer ce qu'il n'a pas le droit
  // de faire). Le superadmin n'a pas besoin de ce detail : il a tout.
  let permissions = null;
  if (user.role === "admin") {
    const perm = await db.execute({
      sql: "SELECT * FROM admin_permissions WHERE user_id = ?",
      args: [user.id],
    });
    permissions = perm.rows[0] || null;
  }

  sendJson(res, 200, { user: { ...user, permissions } });
}
