// backend/src/utils/public-url.js
//
// Les seeds (images/audios de demo) ont ete enregistres en base avec
// "http://localhost:4000/..." quand PUBLIC_API_BASE_URL n'etait pas defini.
// En production (https), ces URLs sont cassees (image 404 / contenu mixte).
// On les reecrit a la volee a la sortie de l'API, sans toucher a la base :
// aucune migration de donnees necessaire, et ca marche pour les anciennes lignes.

export function publicBase(req) {
  if (process.env.PUBLIC_API_BASE_URL) return process.env.PUBLIC_API_BASE_URL.replace(/\/$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:4000";
  const isLocal = /^(localhost|127\.0\.0\.1)/.test(host);
  const proto = req.headers["x-forwarded-proto"]?.split(",")[0] || (isLocal ? "http" : "https");
  return `${proto}://${host}`;
}

const LOCAL_PREFIX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;

export function fixUrl(req, url) {
  if (!url || typeof url !== "string") return url;
  if (LOCAL_PREFIX.test(url)) return url.replace(LOCAL_PREFIX, publicBase(req));
  if (url.startsWith("/")) return publicBase(req) + url;
  return url;
}

export function fixRows(req, rows, ...fields) {
  return rows.map((r) => {
    const copy = { ...r };
    for (const f of fields) if (f in copy) copy[f] = fixUrl(req, copy[f]);
    return copy;
  });
}
