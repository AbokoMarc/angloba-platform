// backend/src/utils/rate-limit.js
// Limiteur simple en memoire (fenetre glissante par cle). Suffisant pour une
// seule instance (Render gratuit). Protege login/inscription du brute force et
// du spam sans dependance externe.

const buckets = new Map();

export function clientIp(req) {
  const fwd = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return fwd || req.socket?.remoteAddress || "unknown";
}

// Retourne true si la requete est AUTORISEE, false si la limite est atteinte.
export function allow(key, max, windowMs) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

// Evite que la Map grossisse indefiniment.
setInterval(() => {
  const now = Date.now();
  for (const [k, hits] of buckets) {
    if (!hits.length || now - hits[hits.length - 1] > 60 * 60 * 1000) buckets.delete(k);
  }
}, 10 * 60 * 1000).unref();
