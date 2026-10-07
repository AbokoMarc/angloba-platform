// backend/src/utils/password.js
// Hachage de mot de passe avec scrypt (module natif Node "crypto")
// -> aucune dependance externe (bcrypt) requise.
//
// Versions ASYNC pour les routes HTTP : scryptSync bloque TOUTE la boucle
// d'evenements (sur Render gratuit, ~0,5 s par connexion pendant lesquelles
// plus aucune autre requete n'est servie). Les versions sync restent pour le seed.

import { randomBytes, scrypt, scryptSync, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export function hashPassword(plain) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return { hash, salt };
}

export async function hashPasswordAsync(plain) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(plain, salt, 64)).toString("hex");
  return { hash, salt };
}

export function verifyPassword(plain, hash, salt) {
  const attempt = scryptSync(plain, salt, 64);
  const stored = Buffer.from(hash, "hex");
  if (attempt.length !== stored.length) return false;
  return timingSafeEqual(attempt, stored);
}

export async function verifyPasswordAsync(plain, hash, salt) {
  const attempt = await scryptAsync(plain, salt, 64);
  const stored = Buffer.from(hash, "hex");
  if (attempt.length !== stored.length) return false;
  return timingSafeEqual(attempt, stored);
}

// Mot de passe temporaire (profs/admins) : aleatoire cryptographique, pas Math.random().
export function generateTempPassword() {
  return randomBytes(6).toString("base64url").slice(0, 10);
}
