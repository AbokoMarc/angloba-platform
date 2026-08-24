// backend/src/controllers/media.controller.js
//
// Upload audio (listening lab, prononciation vocabulaire, exemples de speaking).
// Autorise pour PROF et ADMIN (et superadmin) — demande explicite du cahier
// des charges : "l'admin ou le prof peuvent introduire les audios".
//
// MVP sans dependance : le fichier est envoye en base64 dans le JSON, decode
// et ecrit dans backend/uploads/, puis servi statiquement par server.js.
// ATTENTION : sur un disque ephemere (Render/Railway gratuit) ces fichiers
// sont perdus au redeploiement — voir le README pour brancher un stockage
// objet persistant (R2 / B2 / S3) en changeant UPLOAD_STRATEGY.

import { db } from "../db/client.js";
import { requireRole, requirePermission } from "../middleware/auth.js";
import { sendJson, readJsonBody } from "../utils/http.js";
import { newId } from "../utils/ids.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// POST /api/media/upload
// body: { title, category: 'listening'|'vocabulary'|'speaking_example',
//         weekNumber?, transcript?, fileBase64, fileExt }
export async function uploadAudio(req, res) {
  const user = requireRole(req, res, "teacher", "admin", "superadmin");
  if (!user) return;
  if (user.role === "admin") {
    const ok = await requirePermission(req, res, user, "can_manage_media");
    if (!ok) return;
  }

  const body = await readJsonBody(req);
  const { title, category, weekNumber, transcript, fileBase64, fileExt } = body;
  if (!title || !category || !fileBase64) {
    return sendJson(res, 400, { error: "title, category et fileBase64 sont requis." });
  }

  const filename = `${newId("aud")}.${fileExt || "mp3"}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(fileBase64, "base64"));

  const publicBase = process.env.PUBLIC_UPLOAD_BASE_URL || "http://localhost:4000/uploads";
  const url = `${publicBase}/${filename}`;

  let weekId = null;
  if (weekNumber) {
    const w = (await db.execute({ sql: "SELECT id FROM weeks WHERE number = ?", args: [weekNumber] })).rows[0];
    weekId = w ? w.id : null;
  }

  const id = newId("res");
  await db.execute({
    sql: `INSERT INTO audio_resources (id, title, category, week_id, url, transcript, uploaded_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, title, category, weekId, url, transcript || null, user.id],
  });

  sendJson(res, 201, { id, url });
}

// GET /api/media — liste (pour la page "media" du prof/admin)
export async function listAudio(req, res) {
  const user = requireRole(req, res, "teacher", "admin", "superadmin");
  if (!user) return;
  const rows = (await db.execute({
    sql: `SELECT ar.*, w.number as week_number, u.name as uploaded_by_name
          FROM audio_resources ar LEFT JOIN weeks w ON w.id = ar.week_id
          LEFT JOIN users u ON u.id = ar.uploaded_by ORDER BY ar.created_at DESC`,
    args: [],
  })).rows;
  sendJson(res, 200, { audios: rows });
}
