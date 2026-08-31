// backend/src/utils/activity.js
//
// Appelee a chaque action significative d'un eleve (exercice soumis, tour de
// Speaking Lab, composition soumise, semaine avancee...). Met a jour
// last_active_at ET le streak, avec la logique classique "façon Duolingo" :
//   - deja actif aujourd'hui -> rien ne change
//   - actif hier -> streak + 1
//   - inactif depuis 2+ jours -> streak repart a 1

import { db } from "../db/client.js";

export async function recordActivity(studentId) {
  const row = (await db.execute({
    sql: "SELECT last_active_at, streak_days FROM student_profiles WHERE user_id = ?",
    args: [studentId],
  })).rows[0];
  if (!row) return;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const lastActive = row.last_active_at ? new Date(row.last_active_at + "Z") : null;
  const lastActiveDay = lastActive ? lastActive.toISOString().slice(0, 10) : null;

  let newStreak = row.streak_days || 0;

  if (lastActiveDay !== today) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    newStreak = lastActiveDay === yesterdayStr ? newStreak + 1 : 1;
  }

  await db.execute({
    sql: "UPDATE student_profiles SET last_active_at = datetime('now'), streak_days = ? WHERE user_id = ?",
    args: [newStreak, studentId],
  });
}
