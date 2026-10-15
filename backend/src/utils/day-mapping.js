// backend/src/utils/day-mapping.js
//
// Le programme se vit JOUR PAR JOUR (Day 1 ... Day 252). UNE SEMAINE = 7 JOURS
// COMPLETS : l'eleve ne passe au jour suivant que s'il a fait TOUTES les taches
// du jour, et la semaine n'est "terminee" qu'apres le 7e jour (test hebdomadaire).
//
//   Jour 1 : Grammar        (lecon + mini-quiz de 5 questions)
//   Jour 2 : Vocabulary     (mots + images + quiz de vocabulaire)
//   Jour 3 : Exercises      (20 questions notees)
//   Jour 4 : Speaking       (phrases a repeter + Speaking Lab si la semaine en a un)
//   Jour 5 : Writing        (composition de la semaine, sinon ecriture courte)
//   Jour 6 : Review         (revision : 20 questions melangees des semaines passees)
//   Jour 7 : Weekly Test    (test final de la semaine, cloture la semaine)

export const DAYS_PER_WEEK = 7;
export const TOTAL_WEEKS = 36;
export const TOTAL_DAYS = TOTAL_WEEKS * DAYS_PER_WEEK; // 252

export const DAY_TYPE_LABELS = {
  1: "Grammar",
  2: "Vocabulary",
  3: "Exercises",
  4: "Speaking",
  5: "Writing",
  6: "Review",
  7: "Weekly Test",
};

export function dayToWeek(dayNumber) {
  return Math.min(TOTAL_WEEKS, Math.ceil(dayNumber / DAYS_PER_WEEK));
}

export function dayTypeOf(dayNumber) {
  const clamped = Math.max(1, Math.min(TOTAL_DAYS, dayNumber));
  return ((clamped - 1) % DAYS_PER_WEEK) + 1;
}

export function weekToMonth(weekNumber) {
  return Math.min(9, Math.ceil(weekNumber / 4));
}

export function firstDayOfWeek(weekNumber) {
  return (weekNumber - 1) * DAYS_PER_WEEK + 1;
}

export function overallPct(currentDay) {
  return Math.round((Math.max(0, currentDay - 1) / TOTAL_DAYS) * 100);
}

// Ancien parcours (5 jours/semaine) -> nouveau (7 jours/semaine).
// Grammar, Vocab, Exercises gardent leur place ; l'ancien "Practice" devient
// Speaking (jour 4) ; l'ancien "Review" devient Review (jour 6).
const OLD_TO_NEW_POSITION = [1, 2, 3, 4, 6];
export function migrateOldDay(oldDay) {
  const week = Math.min(TOTAL_WEEKS, Math.ceil(oldDay / 5));
  const pos = ((oldDay - 1) % 5) + 1;
  return (week - 1) * DAYS_PER_WEEK + OLD_TO_NEW_POSITION[pos - 1];
}
