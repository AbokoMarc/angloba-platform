// backend/src/db/content/index.js
//
// Contenu pedagogique COMPLEMENTAIRE (semaines 1 a 36) : grammaire manquante,
// vocabulaire, exercices, phrases a repeter (jour Speaking) et sujets d'ecriture
// courte (jour Writing). Fusionne les 5 fichiers part-*.js et normalise :
//  - questions en double dans une meme semaine -> rendues uniques ;
//  - position de la bonne reponse repartie equitablement (0/1/2) pour qu'on
//    ne puisse pas "deviner" en cliquant toujours la meme case.
// Ce contenu s'ajoute a curriculum-data.js sans jamais ecraser le travail de l'admin
// (voir seedContentUpgrade dans seed.js).

import * as A from "./part-A.js";
import * as B from "./part-B.js";
import * as C from "./part-C.js";
import * as D from "./part-D.js";
import * as E from "./part-E.js";

const PARTS = [A, B, C, D, E];

function merge(name, concat = false) {
  const out = {};
  for (const p of PARTS) {
    for (const [week, value] of Object.entries(p[name] || {})) {
      out[week] = concat ? [...(out[week] || []), ...value] : value;
    }
  }
  return out;
}

function normalizeExercises(list) {
  const counts = new Map();
  for (const q of list) counts.set(q.question, (counts.get(q.question) || 0) + 1);
  const used = new Set();
  return list.map((q, i) => {
    let question = q.question;
    if (counts.get(question) > 1) question = `${question} (${q.options.join(" / ")})`;
    // repartition de la bonne reponse : cible = i % 3 (rotation des options)
    const target = i % 3;
    const shift = (target - q.correctIndex + 3) % 3;
    const options = q.options.map((_, k) => q.options[(k - shift + 3) % 3]);
    const correctIndex = (q.correctIndex + shift) % 3;
    if (used.has(question)) question = `${question} #${i + 1}`;
    used.add(question);
    return { question, options, correctIndex };
  });
}

export const GRAMMAR_HTML = merge("GRAMMAR_HTML");
export const VOCABULARY = merge("VOCABULARY", true);
export const KEY_PHRASES = merge("KEY_PHRASES");
export const WRITING_PROMPTS = merge("WRITING_PROMPTS");
const rawExercises = merge("EXERCISES", true);
export const EXERCISES = Object.fromEntries(Object.entries(rawExercises).map(([w, l]) => [w, normalizeExercises(l)]));
