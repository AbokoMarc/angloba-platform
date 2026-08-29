// backend/src/controllers/compositions.controller.js

import { db } from "../db/client.js";
import { requireRole } from "../middleware/auth.js";
import { requireActiveAccess } from "../middleware/subscription.js";
import { sendJson, readJsonBody } from "../utils/http.js";
import { newId } from "../utils/ids.js";
import { correctionAssist } from "../services/ai.service.js";

const AI_AUTO_PASS_THRESHOLD = Number(process.env.AI_AUTO_PASS_THRESHOLD || 65);

// GET /api/compositions — liste des sujets de composition (tous roles connectes)
export async function listCompositions(req, res) {
  const user = requireRole(req, res, "student", "teacher", "admin", "superadmin");
  if (!user) return;
  const rows = (await db.execute({ sql: "SELECT * FROM compositions ORDER BY number", args: [] })).rows;
  sendJson(res, 200, { compositions: rows });
}

// GET /api/compositions/me — mes copies (eleve)
export async function mySubmissions(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;
  const rows = (await db.execute({
    sql: `SELECT s.*, c.title, c.prompt, c.min_words, c.number
          FROM composition_submissions s JOIN compositions c ON c.id = s.composition_id
          WHERE s.student_id = ? ORDER BY c.number DESC`,
    args: [user.id],
  })).rows;
  sendJson(res, 200, { submissions: rows });
}

// POST /api/compositions/:id/submit — sauvegarder brouillon ou soumettre
export async function submitComposition(req, res, params) {
  const user = requireRole(req, res, "student");
  if (!user) return;
  const ok = await requireActiveAccess(req, res, user);
  if (!ok) return;
  const body = await readJsonBody(req);
  const wordCount = (body.text || "").trim().split(/\s+/).filter(Boolean).length;
  const status = body.submit ? "submitted" : "draft";

  const existing = await db.execute({
    sql: "SELECT id FROM composition_submissions WHERE composition_id = ? AND student_id = ?",
    args: [params.id, user.id],
  });

  if (existing.rows.length) {
    await db.execute({
      sql: `UPDATE composition_submissions SET body=?, word_count=?, status=?, submitted_at=CASE WHEN ? THEN datetime('now') ELSE submitted_at END
            WHERE composition_id=? AND student_id=?`,
      args: [body.text, wordCount, status, body.submit ? 1 : 0, params.id, user.id],
    });
  } else {
    const id = newId("sub");
    await db.execute({
      sql: `INSERT INTO composition_submissions (id, composition_id, student_id, body, word_count, status, submitted_at)
            VALUES (?, ?, ?, ?, ?, ?, ${body.submit ? "datetime('now')" : "NULL"})`,
      args: [id, params.id, user.id, body.text, wordCount, status],
    });
  }
  sendJson(res, 200, { ok: true });
}

// GET /api/compositions/pending — copies a corriger (prof: les siennes, admin/superadmin: toutes)
export async function pendingCorrections(req, res) {
  const user = requireRole(req, res, "teacher", "admin", "superadmin");
  if (!user) return;

  const base = `
    SELECT s.id, s.body, s.word_count, s.submitted_at, u.name as student_name, u.id as student_id,
           c.title, c.prompt, c.number
    FROM composition_submissions s
    JOIN users u ON u.id = s.student_id
    JOIN student_profiles sp ON sp.user_id = u.id
    JOIN compositions c ON c.id = s.composition_id
    WHERE s.status = 'submitted'`;

  const rows = user.role === "teacher"
    ? (await db.execute({ sql: base + " AND sp.teacher_id = ?", args: [user.id] })).rows
    : (await db.execute({ sql: base, args: [] })).rows;

  sendJson(res, 200, { pending: rows });
}

// POST /api/compositions/submissions/:id/ai-assist — pre-correction IA (aide, jamais definitive)
export async function aiAssistCorrection(req, res, params) {
  const user = requireRole(req, res, "teacher", "admin", "superadmin");
  if (!user) return;

  const sub = (await db.execute({
    sql: `SELECT s.body, c.prompt, c.min_words FROM composition_submissions s
          JOIN compositions c ON c.id = s.composition_id WHERE s.id = ?`,
    args: [params.id],
  })).rows[0];
  if (!sub) return sendJson(res, 404, { error: "Copie introuvable." });

  try {
    const assist = await correctionAssist({ prompt: sub.prompt, minWords: sub.min_words, studentText: sub.body });
    sendJson(res, 200, { assist });
  } catch (err) {
    sendJson(res, 503, { error: err.message });
  }
}

// PATCH /api/compositions/submissions/:id/correct — correction finale par le prof (toujours humaine)
export async function correctSubmission(req, res, params) {
  const user = requireRole(req, res, "teacher", "admin", "superadmin");
  if (!user) return;
  const body = await readJsonBody(req);
  await db.execute({
    sql: `UPDATE composition_submissions SET status='corrected', score=?, teacher_feedback=?, corrected_at=datetime('now'), corrected_by=?
          WHERE id=?`,
    args: [body.score, body.feedback, user.id, params.id],
  });
  sendJson(res, 200, { ok: true });
}

// POST /api/compositions/submissions/:id/ai-review — L'ELEVE demande une
// correction immediate par l'IA (au lieu d'attendre le prof). Si l'IA juge
// la copie suffisamment bonne (>= AI_AUTO_PASS_THRESHOLD), elle est
// automatiquement validee "corrected" — ce qui debloque la progression.
// Sinon, la copie reste 'submitted' en attente d'un vrai prof, mais
// l'eleve voit deja le retour de l'IA pour s'ameliorer avant de reessayer.
export async function studentAiReview(req, res, params) {
  const user = requireRole(req, res, "student");
  if (!user) return;

  const sub = (await db.execute({
    sql: `SELECT s.id, s.body, s.student_id, s.status, c.prompt, c.min_words
          FROM composition_submissions s JOIN compositions c ON c.id = s.composition_id
          WHERE s.id = ?`,
    args: [params.id],
  })).rows[0];

  if (!sub || sub.student_id !== user.id) return sendJson(res, 404, { error: "Copie introuvable." });
  if (sub.status !== "submitted") return sendJson(res, 400, { error: "Cette copie n'est pas en attente de correction." });

  try {
    const assist = await correctionAssist({ prompt: sub.prompt, minWords: sub.min_words, studentText: sub.body });
    const passed = assist.suggestedScore >= AI_AUTO_PASS_THRESHOLD;

    if (passed) {
      await db.execute({
        sql: `UPDATE composition_submissions SET status='corrected', score=?, teacher_feedback=?, corrected_at=datetime('now'), corrected_by=NULL
              WHERE id=?`,
        args: [assist.suggestedScore, `[Corrige automatiquement par l'IA] ${assist.strengths} ${assist.improvements}`, sub.id],
      });
    }

    sendJson(res, 200, { passed, threshold: AI_AUTO_PASS_THRESHOLD, assist });
  } catch (err) {
    sendJson(res, 503, { error: err.message });
  }
}
