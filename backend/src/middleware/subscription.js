// backend/src/middleware/subscription.js
//
// Verifie qu'un ELEVE a encore acces au contenu payant : essai gratuit de
// 7 jours, ou abonnement actif (subscription_expires_at dans le futur).
// Renvoie 402 Payment Required si l'acces est expire — le frontend
// redirige alors vers la page d'abonnement.
//
// N'affecte JAMAIS les comptes teacher/admin/superadmin : seul un compte
// 'student' peut se voir bloquer ici.

import { db } from "../db/client.js";
import { sendJson } from "../utils/http.js";

export async function requireActiveAccess(req, res, user) {
  if (user.role !== "student") return true; // profs/admins jamais concernes

  const profile = (await db.execute({
    sql: "SELECT subscription_status, trial_ends_at, subscription_expires_at FROM student_profiles WHERE user_id = ?",
    args: [user.id],
  })).rows[0];

  if (!profile) {
    sendJson(res, 404, { error: "Profil eleve introuvable." });
    return false;
  }

  const now = new Date();

  if (profile.subscription_status === "active") {
    if (!profile.subscription_expires_at || new Date(profile.subscription_expires_at + "Z") > now) {
      return true;
    }
    // Abonnement expire -> on le repasse en "expired" pour que le dashboard l'affiche correctement.
    await db.execute({ sql: "UPDATE student_profiles SET subscription_status = 'expired' WHERE user_id = ?", args: [user.id] });
  } else if (profile.subscription_status === "trial") {
    if (!profile.trial_ends_at || new Date(profile.trial_ends_at + "Z") > now) {
      return true;
    }
    await db.execute({ sql: "UPDATE student_profiles SET subscription_status = 'expired' WHERE user_id = ?", args: [user.id] });
  }

  sendJson(res, 402, {
    error: "Ton essai gratuit ou ton abonnement est termine. Abonne-toi pour continuer.",
    code: "SUBSCRIPTION_REQUIRED",
  });
  return false;
}
