// backend/src/utils/jwt.js
// Implementation minimale de JWT (HS256) avec le module natif "crypto".
// Evite la dependance a jsonwebtoken, dans le meme esprit "zero-dependance"
// que le reste du backend (seul @libsql/client est requis).

import { createHmac } from "node:crypto";

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString("utf8");
}

const SECRET = () => process.env.JWT_SECRET || "dev-secret-change-me";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 jours

export function signToken(payload, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + ttlSeconds };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(fullPayload));
  const signature = createHmac("sha256", SECRET())
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${headerB64}.${payloadB64}.${signature}`;
}

export function verifyToken(token) {
  try {
    const [headerB64, payloadB64, signature] = token.split(".");
    if (!headerB64 || !payloadB64 || !signature) return null;

    const expectedSig = createHmac("sha256", SECRET())
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (expectedSig !== signature) return null;

    const payload = JSON.parse(base64urlDecode(payloadB64));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}
