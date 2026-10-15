// backend/src/utils/day-quizzes.js
//
// Quiz des jours du parcours (semaines de 7 jours). Chaque quiz est genere de
// facon DETERMINISTE a partir d'une graine (eleve + jour + tache + numero
// d'essai) : le serveur peut donc le reconstruire a l'identique pour corriger,
// sans jamais envoyer la bonne reponse au client. Apres un echec, le numero
// d'essai change -> un NOUVEAU lot de questions (on ne peut plus "apprendre"
// les reponses de l'essai precedent en reessayant).

import { db } from "../db/client.js";

export const QUIZ_CONFIG = {
  grammar_quiz: { count: 5, pass: 60 },
  vocab_quiz: { count: 8, pass: 60 },
  exercises: { count: 20, pass: Number(process.env.EXERCISE_PASS_THRESHOLD || 60) },
  review: { count: 20, pass: 60 },
  weekly_test: { count: 20, pass: Number(process.env.WEEKLY_TEST_PASS_THRESHOLD || 70) },
};

function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return function () {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function exercisePool(minWeek, maxWeek) {
  return (await db.execute({
    sql: `SELECT e.id, e.question, e.options_json, e.correct_index, w.number AS week_number
          FROM exercises e JOIN weeks w ON w.id = e.week_id
          WHERE w.number BETWEEN ? AND ? ORDER BY e.id`,
    args: [minWeek, maxWeek],
  })).rows;
}

function pickWeighted(rows, weightOf, rand, count) {
  const weighted = [];
  for (const r of rows) for (let i = 0, n = weightOf(r); i < n; i++) weighted.push(r);
  const seen = new Set();
  const out = [];
  for (const r of shuffle(weighted, rand)) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
    if (out.length >= count) break;
  }
  return out;
}

async function buildVocabQuiz(week, seed, count) {
  const own = (await db.execute({
    sql: `SELECT v.id, v.word, v.fr FROM vocabulary_words v JOIN weeks w ON w.id = v.week_id
          WHERE w.number = ? AND v.fr IS NOT NULL AND v.fr <> '' ORDER BY v.id`,
    args: [week],
  })).rows;
  if (own.length < 3) return [];
  const others = (await db.execute({
    sql: `SELECT v.fr FROM vocabulary_words v JOIN weeks w ON w.id = v.week_id
          WHERE w.number <= ? AND v.fr IS NOT NULL AND v.fr <> '' ORDER BY v.id`,
    args: [Math.max(week, 4)],
  })).rows.map((r) => r.fr);

  const rand = seededRandom(seed);
  const chosen = shuffle(own, rand).slice(0, count);
  return chosen.map((w) => {
    const pool = shuffle([...new Set(others.filter((f) => f !== w.fr))], rand);
    const wrong = pool.slice(0, 2);
    // Pas assez de distracteurs (programme tout debut) : on complete avec les mots de la semaine
    for (const o of shuffle(own, rand)) { if (wrong.length >= 2) break; if (o.fr !== w.fr && !wrong.includes(o.fr)) wrong.push(o.fr); }
    const options = shuffle([w.fr, ...wrong], rand);
    return { id: `v:${w.id}`, question: `What does "${w.word}" mean in French?`, options, correctIndex: options.indexOf(w.fr) };
  });
}

/**
 * Construit le quiz (AVEC correctIndex : usage serveur uniquement).
 * @returns {Promise<Array<{id, question, options, correctIndex}>>}
 */
export async function buildQuiz(task, { week, day, studentId, attempts = 0 }) {
  const cfg = QUIZ_CONFIG[task];
  if (!cfg) return [];
  const seed = `${studentId}|d${day}|${task}|a${attempts}`;

  if (task === "vocab_quiz") return buildVocabQuiz(week, seed, cfg.count);

  const rand = seededRandom(seed);
  let rows;
  let weightOf = () => 1;
  if (task === "grammar_quiz") {
    rows = await exercisePool(week, week);
  } else if (task === "review") {
    rows = await exercisePool(1, Math.max(1, week - 1));
  } else if (task === "weekly_test") {
    rows = await exercisePool(1, week);
    weightOf = (r) => (r.week_number === week ? 4 : r.week_number >= week - 2 ? 2 : 1);
  } else {
    rows = await exercisePool(1, week); // exercises
    weightOf = (r) => (r.week_number >= week - 2 ? 2 : 1);
  }
  return pickWeighted(rows, weightOf, rand, cfg.count).map((r) => ({
    id: r.id, question: r.question, options: JSON.parse(r.options_json), correctIndex: r.correct_index,
  }));
}

export function stripAnswers(questions) {
  return questions.map(({ id, question, options }) => ({ id, question, options }));
}

export function gradeQuiz(questions, answers) {
  const sent = new Map((Array.isArray(answers) ? answers : []).map((a) => [a?.questionId, a?.selectedIndex]));
  const results = questions.map((q) => ({ questionId: q.id, correct: sent.get(q.id) === q.correctIndex }));
  const good = results.filter((r) => r.correct).length;
  return { scorePct: questions.length ? Math.round((good / questions.length) * 100) : 0, results };
}
