// backend/src/utils/day-mapping.js
//
// Le programme est maintenant vecu JOUR PAR JOUR par l'eleve (Day 1, Day 2...
// Day 180), meme si le CONTENU pedagogique reste organise par semaine dans
// curriculum-data.js (grammaire, vocabulaire, exercices ecrits par semaine).
// Chaque semaine se deroule sur 5 jours, avec un type de journee different :
//
//   Day type 1 : Grammar      (apprendre la regle + phrases + audio)
//   Day type 2 : Vocabulary   (mots de la semaine + images)
//   Day type 3 : Exercises    (20 questions adaptatives, notees — condition
//                              de deblocage du jour suivant)
//   Day type 4 : Practice     (composition et/ou Speaking Lab si rattaches
//                              a cette semaine — condition de deblocage)
//   Day type 5 : Review       (recapitulatif, cloture la semaine)

export const DAYS_PER_WEEK = 5;
export const TOTAL_DAYS = 36 * DAYS_PER_WEEK; // 180

export const DAY_TYPE_LABELS = {
  1: "Grammar",
  2: "Vocabulary",
  3: "Exercises",
  4: "Practice",
  5: "Review",
};

export function dayToWeek(dayNumber) {
  return Math.min(36, Math.ceil(dayNumber / DAYS_PER_WEEK));
}

export function dayTypeOf(dayNumber) {
  const clamped = Math.max(1, Math.min(TOTAL_DAYS, dayNumber));
  return ((clamped - 1) % DAYS_PER_WEEK) + 1;
}

export function weekToMonth(weekNumber) {
  return Math.min(9, Math.ceil(weekNumber / 4));
}

// Premier jour d'une semaine donnee (utile pour les migrations/retrogradations)
export function firstDayOfWeek(weekNumber) {
  return (weekNumber - 1) * DAYS_PER_WEEK + 1;
}
