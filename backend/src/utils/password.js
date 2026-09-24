// backend/src/utils/password.js
// Hachage de mot de passe avec scrypt (module natif Node "crypto")
// -> aucune dependance externe (bcrypt) requise.

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(plain) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(plain, hash, salt) {
  const attempt = scryptSync(plain, salt, 64);
  const stored = Buffer.from(hash, "hex");
  if (attempt.length !== stored.length) return false;
  return timingSafeEqual(attempt, stored);
}
