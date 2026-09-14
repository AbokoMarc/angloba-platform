// backend/src/utils/daily-exercises.js
//
// Genere un lot de N questions (par defaut 20) tirees de tout le contenu
// deja debloque (semaine 1 -> semaine courante), avec une ponderation qui
// privilegie les semaines recentes — la difficulte suit naturellement la
// progression de l'eleve. Le tirage est DETERMINISTE par seed (stable si
// l'eleve recharge la page avant d'avoir soumis).

import { db } from "../db/client.js";

export const QUESTIONS_PER_SET = 20;

function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return function () {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed(arr, rand) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * @param {number} currentWeek - semaine actuelle de l'eleve (borne superieure du pool)
 * @param {string} seedKey - cle stable (ex: `${studentId}-week${week}` pour un jour
 *                            "Exercises" qui ne doit pas remelanger tant que non soumis,
 *                            ou `${studentId}-${date}` pour le Quiz Quotidien calendaire)
 */
export async function generateQuestionSet(currentWeek, seedKey, count = QUESTIONS_PER_SET) {
  const pool = (await db.execute({
    sql: `SELECT e.id, e.question, e.options_json, w.number as week_number
          FROM exercises e JOIN weeks w ON w.id = e.week_id
          WHERE w.number <= ? ORDER BY w.number ASC`,
    args: [currentWeek],
  })).rows;

  if (!pool.length) return [];

  const weighted = [];
  for (const q of pool) {
    const weight = q.week_number >= currentWeek - 2 ? 2 : 1;
    for (let i = 0; i < weight; i++) weighted.push(q);
  }

  const rand = seededRandom(seedKey);
  const shuffled = shuffleWithSeed(weighted, rand);

  const seen = new Set();
  const unique = [];
  for (const q of shuffled) {
    if (!seen.has(q.id)) { seen.add(q.id); unique.push(q); }
  }
  while (unique.length < count && pool.length) {
    unique.push(pool[Math.floor(rand() * pool.length)]);
  }

  return unique.slice(0, count).map((q) => ({ id: q.id, question: q.question, options: JSON.parse(q.options_json), weekNumber: q.week_number }));
}

export async function gradeAnswers(answers) {
  const ids = answers.map((a) => a.questionId);
  if (!ids.length) return { scorePct: 0, results: [] };

  const placeholders = ids.map(() => "?").join(",");
  const questions = (await db.execute({
    sql: `SELECT id, correct_index FROM exercises WHERE id IN (${placeholders})`,
    args: ids,
  })).rows;
  const correctById = Object.fromEntries(questions.map((q) => [q.id, q.correct_index]));

  const results = answers.map((a) => ({ questionId: a.questionId, correct: correctById[a.questionId] === a.selectedIndex }));
  const scorePct = Math.round((results.filter((r) => r.correct).length / results.length) * 100);
  return { scorePct, results };
}
