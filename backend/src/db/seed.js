// backend/src/db/seed.js
//
// 1) Applique le schema (idempotent : CREATE TABLE IF NOT EXISTS)
// 2) Cree le compte SUPER ADMIN au tout premier demarrage, a partir des
//    variables d'environnement SUPERADMIN_* (jamais en dur dans le code).
//    Ce compte est superadmin ET a un profil professeur (il herite des
//    droits d'un prof sur SES propres eleves, en plus de tout controler).
// 3) Injecte le programme (9 mois / 36 semaines) + scenarios de speaking
//    + compositions, SEULEMENT si la base est vide (ne jamais ecraser
//    le travail de l'admin sur les redemarrages suivants).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./client.js";
import { hashPassword } from "../utils/password.js";
import { newId } from "../utils/ids.js";
import { MONTHS, WEEKS, GRAMMAR_HTML, VOCABULARY, EXERCISES, COMPOSITIONS, SPEAKING_SCENARIOS } from "./curriculum-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function ensureSchemaAndSeed() {
  await applySchema();
  await runMigrations();
  await seedAppearance();
  await seedSuperAdmin();
  await seedCurriculum();
  await seedMissingExercises();
  await seedSpeakingScenarios();
  await seedCompositions();
}

// Ajoute les colonnes/tables introduites APRES le premier lancement de la
// plateforme, sans jamais toucher aux donnees existantes. Chaque ALTER TABLE
// est tente individuellement : si la colonne existe deja (mise a jour reappliquee,
// ou base fraiche ou schema.sql l'a deja creee), l'erreur "duplicate column"
// est simplement ignoree.
async function runMigrations() {
  const alters = [
    "ALTER TABLE student_profiles ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'trial'",
    "ALTER TABLE student_profiles ADD COLUMN trial_ends_at TEXT",
    "ALTER TABLE student_profiles ADD COLUMN subscription_expires_at TEXT",
    "ALTER TABLE student_profiles ADD COLUMN last_active_at TEXT",
    "ALTER TABLE payments ADD COLUMN campay_reference TEXT",
    "ALTER TABLE payments ADD COLUMN provider_reference TEXT",
  ];
  for (const sql of alters) {
    try {
      await db.execute(sql);
    } catch (err) {
      if (!/duplicate column/i.test(err.message)) {
        console.warn(`[migrate] ${sql} -> ${err.message}`);
      }
    }
  }

  // Les eleves deja inscrits AVANT l'introduction de l'essai gratuit ne
  // doivent pas se retrouver bloques du jour au lendemain : on leur donne
  // un essai qui demarre "maintenant" s'ils n'en ont pas deja un.
  await db.execute(`
    UPDATE student_profiles
    SET trial_ends_at = datetime('now', '+7 days')
    WHERE trial_ends_at IS NULL
  `);
  console.log("[migrate] Migrations appliquees.");
}

async function applySchema() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const statements = sql.split(";").map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await db.execute(stmt);
  }
  console.log("[seed] Schema OK.");
}

async function seedAppearance() {
  const existing = await db.execute({ sql: "SELECT id FROM appearance_settings WHERE id = 1", args: [] });
  if (existing.rows.length) return;
  await db.execute({ sql: "INSERT INTO appearance_settings (id) VALUES (1)", args: [] });
  console.log("[seed] Reglages d'apparence par defaut crees.");
}

async function seedSuperAdmin() {
  const email = (process.env.SUPERADMIN_EMAIL || "").toLowerCase().trim();
  if (!email) {
    console.warn("[seed] SUPERADMIN_EMAIL absent du .env — aucun super admin cree. Ajoute-le puis redemarre.");
    return;
  }
  const existing = await db.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [email] });
  if (existing.rows.length) return; // deja cree lors d'un demarrage precedent

  const name = process.env.SUPERADMIN_NAME || "Super Admin";
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!password) {
    console.warn("[seed] SUPERADMIN_PASSWORD absent du .env — aucun super admin cree.");
    return;
  }

  const { hash, salt } = hashPassword(password);
  const id = newId("usr");
  await db.execute({
    sql: `INSERT INTO users (id, role, name, email, password_hash, password_salt, status)
          VALUES (?, 'superadmin', ?, ?, ?, ?, 'active')`,
    args: [id, name, email, hash, salt],
  });
  await db.execute({
    sql: "INSERT INTO teacher_profiles (user_id, subject) VALUES (?, 'English')",
    args: [id],
  });
  console.log(`[seed] Super admin cree : ${email} (aussi visible comme professeur titulaire).`);
}

async function seedCurriculum() {
  const existing = await db.execute({ sql: "SELECT id FROM months LIMIT 1", args: [] });
  if (existing.rows.length) return; // deja seede

  const monthIdByNumber = {};
  for (const m of MONTHS) {
    const result = await db.execute({
      sql: "INSERT INTO months (number, title, objective) VALUES (?, ?, ?) RETURNING id",
      args: [m.number, m.title, m.objective],
    });
    monthIdByNumber[m.number] = result.rows[0].id;
  }

  for (const w of WEEKS) {
    const grammarHtml = GRAMMAR_HTML[w.number] || `<p>Contenu a completer par l'admin pour la semaine ${w.number} (${w.title}).</p>`;
    const result = await db.execute({
      sql: `INSERT INTO weeks (month_id, number, title, grammar_title, grammar_html, speaking_task, is_test_week)
            VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      args: [monthIdByNumber[w.month], w.number, w.title, w.grammarTitle, grammarHtml, w.speakingTask, w.isTest ? 1 : 0],
    });
    const weekId = result.rows[0].id;

    for (const v of VOCABULARY[w.number] || []) {
      await db.execute({
        sql: `INSERT INTO vocabulary_words (id, week_id, word, word_type, fr, gb_variant, us_variant)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [newId("voc"), weekId, v.word, v.wordType, v.fr, v.gb || null, v.us || null],
      });
    }

    for (const ex of EXERCISES[w.number] || []) {
      await db.execute({
        sql: `INSERT INTO exercises (id, week_id, question, options_json, correct_index) VALUES (?, ?, ?, ?, ?)`,
        args: [newId("exo"), weekId, ex.question, JSON.stringify(ex.options), ex.correctIndex],
      });
    }
  }
  console.log(`[seed] Programme injecte : ${MONTHS.length} mois, ${WEEKS.length} semaines.`);
}

// Ajoute les exercices des semaines introduites APRES le seed initial, sans
// jamais toucher aux semaines qui en ont deja (evite les doublons a chaque
// redemarrage, et fonctionne aussi bien sur une base fraiche que sur Turso
// deja en production).
async function seedMissingExercises() {
  let added = 0;
  for (const [weekNumber, exerciseList] of Object.entries(EXERCISES)) {
    const week = (await db.execute({ sql: "SELECT id FROM weeks WHERE number = ?", args: [Number(weekNumber)] })).rows[0];
    if (!week) continue;

    const existing = await db.execute({ sql: "SELECT COUNT(*) as n FROM exercises WHERE week_id = ?", args: [week.id] });
    if (existing.rows[0].n > 0) continue; // deja des exercices pour cette semaine -> on ne touche pas

    for (const ex of exerciseList) {
      await db.execute({
        sql: `INSERT INTO exercises (id, week_id, question, options_json, correct_index) VALUES (?, ?, ?, ?, ?)`,
        args: [newId("exo"), week.id, ex.question, JSON.stringify(ex.options), ex.correctIndex],
      });
      added++;
    }
  }
  if (added) console.log(`[seed] ${added} nouveaux exercices ajoutes (semaines completees).`);
}

async function seedSpeakingScenarios() {
  const existing = await db.execute({ sql: "SELECT id FROM speaking_scenarios LIMIT 1", args: [] });
  if (existing.rows.length) return;
  for (const s of SPEAKING_SCENARIOS) {
    await db.execute({
      sql: `INSERT INTO speaking_scenarios (key, title, emoji, level, ai_persona, ai_opening, goal)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [s.key, s.title, s.emoji, s.level, s.aiPersona, s.aiOpening, s.goal],
    });
  }
  console.log(`[seed] ${SPEAKING_SCENARIOS.length} scenarios de Speaking Lab injectes.`);
}

async function seedCompositions() {
  const existing = await db.execute({ sql: "SELECT id FROM compositions LIMIT 1", args: [] });
  if (existing.rows.length) return;
  for (const c of COMPOSITIONS) {
    const week = await db.execute({ sql: "SELECT id FROM weeks WHERE number = ?", args: [c.week] });
    await db.execute({
      sql: `INSERT INTO compositions (number, week_id, title, prompt, min_words) VALUES (?, ?, ?, ?, ?)`,
      args: [c.number, week.rows[0]?.id || null, c.title, c.prompt, c.minWords],
    });
  }
  console.log(`[seed] ${COMPOSITIONS.length} compositions injectees.`);
}

// Permet aussi : `npm run seed` en standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const { loadEnv } = await import("../utils/env.js");
  loadEnv();
  ensureSchemaAndSeed().then(() => {
    console.log("Seed termine.");
    process.exit(0);
  });
}
