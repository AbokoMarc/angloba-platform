// backend/src/utils/jwt.js
// Implementation minimale de JWT (HS256) avec le module natif "crypto".
// Evite la dependance a jsonwebtoken, dans le meme esprit "zero-dependance"
// que le reste du backend (seul @libsql/client est requis).

import { createHmac, timingSafeEqual } from "node:crypto";

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

// En production (Render pose RENDER=true, ou NODE_ENV=production), un JWT_SECRET
// absent fait ECHOUER le demarrage : sinon n'importe qui connaissant le secret
// par defaut (public dans le code) pourrait fabriquer un jeton superadmin.
const IS_PROD = process.env.NODE_ENV === "production" || Boolean(process.env.RENDER);
if (!process.env.JWT_SECRET) {
  if (IS_PROD) {
    console.error("[FATAL] JWT_SECRET absent en production. Definis-le dans les variables d'environnement (openssl rand -hex 32).");
    process.exit(1);
  }
  console.warn("[jwt] JWT_SECRET absent -> secret de dev (OK en local, JAMAIS en production).");
} else if (process.env.JWT_SECRET.length < 24) {
  console.warn(`[jwt] JWT_SECRET trop court (${process.env.JWT_SECRET.length} caracteres) : remplace-le par 'openssl rand -hex 32'.`);
}
const SECRET = () => process.env.JWT_SECRET || "dev-secret-change-me";
// Comme une vraie app mobile (WhatsApp, Instagram...) : la session reste
// valide tres longtemps, jusqu'a deconnexion manuelle — pas de "vous avez
// ete deconnecte" surprise apres quelques jours d'inactivite.
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 an

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

    const a = Buffer.from(expectedSig);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(base64urlDecode(payloadB64));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}
