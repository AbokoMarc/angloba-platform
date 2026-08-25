// backend/src/controllers/appearance.controller.js
//
// Reglages d'apparence : nom de la plateforme, logo, couleurs, et la
// LISTE DES ONGLETS DE NAVIGATION eleve (labels + icones), modifiable
// par l'admin sans toucher au code — exactement la fonctionnalite
// demandee au tout debut du projet.

import { db } from "../db/client.js";
import { requireRole, requirePermission } from "../middleware/auth.js";
import { sendJson, readJsonBody } from "../utils/http.js";

// GET /api/appearance — PUBLIC (meme un visiteur non connecte doit voir
// le bon logo/nom sur la page de connexion)
export async function getAppearance(req, res) {
  const row = (await db.execute({ sql: "SELECT * FROM appearance_settings WHERE id = 1", args: [] })).rows[0];
  sendJson(res, 200, { appearance: { ...row, nav_items: JSON.parse(row.nav_items_json) } });
}

// PUT /api/appearance — admin/superadmin avec can_manage_appearance
export async function updateAppearance(req, res) {
  const user = requireRole(req, res, "admin", "superadmin");
  if (!user) return;
  if (user.role === "admin") {
    const ok = await requirePermission(req, res, user, "can_manage_appearance");
    if (!ok) return;
  }

  const body = await readJsonBody(req);
  const fields = [];
  const args = [];
  const map = {
    platformName: "platform_name",
    tagline: "tagline",
    logoGlyph: "logo_glyph",
    themePrimary: "theme_primary",
    themeAccent: "theme_accent",
  };
  for (const [key, col] of Object.entries(map)) {
    if (body[key] !== undefined) { fields.push(`${col} = ?`); args.push(body[key]); }
  }
  if (body.navItems !== undefined) { fields.push("nav_items_json = ?"); args.push(JSON.stringify(body.navItems)); }

  if (fields.length) {
    await db.execute({ sql: `UPDATE appearance_settings SET ${fields.join(", ")} WHERE id = 1`, args });
  }
  sendJson(res, 200, { ok: true });
}
