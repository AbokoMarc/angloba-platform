// backend/src/utils/http.js — petits helpers pour le serveur HTTP natif

import zlib from "node:zlib";

// JSON + compression gzip quand le client l'accepte et que la reponse depasse
// ~1 Ko : divise par 3-5 le volume transfere sur 3G/4G (MTN, Orange...).
export function sendJson(res, status, data) {
  const body = Buffer.from(JSON.stringify(data));
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };

  const acceptsGzip = /\bgzip\b/.test(res.req?.headers?.["accept-encoding"] || "");
  if (acceptsGzip && body.length > 1024) {
    const gz = zlib.gzipSync(body);
    res.writeHead(status, { ...headers, "Content-Encoding": "gzip", "Content-Length": gz.length, Vary: "Accept-Encoding" });
    return res.end(gz);
  }
  res.writeHead(status, { ...headers, "Content-Length": body.length });
  res.end(body);
}

const MAX_BODY_BYTES = 10 * 1024 * 1024; // 10 Mo (uploads audio en base64)

export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let size = 0;
    let tooBig = false;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) { tooBig = true; return; } // on vide sans accumuler
      raw += chunk;
    });
    req.on("end", () => {
      if (tooBig) return reject(httpError(413, "Requete trop volumineuse."));
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(httpError(400, "Corps JSON invalide."));
      }
    });
    req.on("error", reject);
  });
}

// Erreur portant un statut HTTP : server.js la transforme en reponse propre
// (400/413...) au lieu d'une 500 generique.
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
