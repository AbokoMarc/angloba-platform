// backend/server.js — point d'entree. Serveur HTTP natif (module "http"),
// sans Express, dans le meme esprit que le backend Clo-Clo dont ce projet
// s'inspire pour son architecture.

import { loadEnv } from "./src/utils/env.js";
loadEnv(); // DOIT rester la toute premiere ligne executee

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { routes } from "./src/routes.js";
import { sendJson } from "./src/utils/http.js";
import { ensureSchemaAndSeed } from "./src/db/seed.js";
import { isAccountActive } from "./src/middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const MIME = { mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4", mp4: "video/mp4", webm: "video/webm", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" };

// Dossiers servis statiquement. Les fichiers "seed-*" sont livres avec le code
// (immuables) ; les uploads ont des noms uniques generes (jamais reecrits).
const STATIC_DIRS = {
  "/uploads/": { dir: path.join(__dirname, "uploads"), cache: "public, max-age=86400" },
  "/seed-audio/": { dir: path.join(__dirname, "seed-audio"), cache: "public, max-age=31536000, immutable" },
  "/seed-images/": { dir: path.join(__dirname, "seed-images"), cache: "public, max-age=31536000, immutable" },
};

// Sert un fichier de facon SURE :
//  - refuse tout ce qui sort du dossier (../) et tout ce qui n'est pas un fichier
//    (avant : GET /uploads/ -> EISDIR non gere -> le serveur ENTIER plantait),
//  - supporte les requetes Range (obligatoire pour lire l'audio sur iPhone/Safari),
//  - envoie des en-tetes de cache (les images/audios ne sont telecharges qu'une fois).
function serveStatic(req, res, { dir, cache }, rawName) {
  let name;
  try { name = decodeURIComponent(rawName); } catch { res.writeHead(400); return res.end(); }
  const root = path.resolve(dir);
  const filePath = path.resolve(root, name);
  if (!filePath.startsWith(root + path.sep)) { res.writeHead(404); return res.end(); }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); return res.end(); }

    const ext = path.extname(filePath).slice(1).toLowerCase();
    const headers = {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": cache,
      "Accept-Ranges": "bytes",
      "X-Content-Type-Options": "nosniff",
    };

    let start = 0, end = stat.size - 1, status = 200;
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
    if (range && (range[1] || range[2])) {
      if (range[1]) { start = Number(range[1]); if (range[2]) end = Math.min(Number(range[2]), end); }
      else { start = Math.max(0, stat.size - Number(range[2])); } // "-500" = les 500 derniers octets
      if (start > end || start >= stat.size) {
        res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
        return res.end();
      }
      status = 206;
      headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
    }
    headers["Content-Length"] = end - start + 1;

    res.writeHead(status, headers);
    if (req.method === "HEAD") return res.end();
    const stream = fs.createReadStream(filePath, { start, end });
    stream.on("error", () => res.destroy());
    stream.pipe(res);
  });
}

// Le serveur ECOUTE IMMEDIATEMENT (Render voit le port ouvert tout de suite, pas
// de 502 pendant le reveil) ; l'initialisation de la base se fait en arriere-plan
// et les routes API attendent qu'elle soit terminee.
let dbReady = false;
const ready = ensureSchemaAndSeed()
  .then(() => { dbReady = true; })
  .catch((err) => {
    console.error("Echec de l'initialisation de la base :", err);
    process.exit(1);
  });

const READY_WAIT_MS = 45_000;
function waitReady() {
  return Promise.race([ready, new Promise((resolve) => setTimeout(resolve, READY_WAIT_MS))]);
}

const server = http.createServer(async (req, res) => {
  // CORS — necessaire car le frontend statique (Vercel/Netlify) et l'API
  // (Render/Railway) vivent sur des domaines differents.
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // Le navigateur memorise la reponse "preflight" : sans ca, CHAQUE appel API
  // authentifie coute 2 allers-retours (OPTIONS puis la vraie requete) — tres
  // visible sur reseau mobile a forte latence.
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Vary", "Origin");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  if (req.method === "GET" || req.method === "HEAD") {
    for (const [prefix, cfg] of Object.entries(STATIC_DIRS)) {
      if (pathname.startsWith(prefix)) return serveStatic(req, res, cfg, pathname.slice(prefix.length));
    }
  }

  // Sante : repond TOUT DE SUITE, meme pendant le reveil/initialisation. Sert de
  // ping "keep-alive" (cron externe) et de pre-chauffage depuis la page d'accueil.
  if (pathname === "/api/health") {
    return sendJson(res, 200, { ok: true, ready: dbReady, time: new Date().toISOString() });
  }

  for (const [method, pattern, handler] of routes) {
    if (req.method !== method) continue;
    const match = pathname.match(pattern);
    if (!match) continue;
    try {
      if (!dbReady) {
        await waitReady();
        if (!dbReady) {
          res.setHeader("Retry-After", "5");
          return sendJson(res, 503, { error: "Le serveur demarre, reessaie dans quelques secondes." });
        }
      }
      if (!(await isAccountActive(req))) {
        return sendJson(res, 401, { error: "Compte desactive ou introuvable." });
      }
      await handler(req, res, match.groups || {});
    } catch (err) {
      if (err.status && err.status < 500) {
        if (!res.headersSent) sendJson(res, err.status, { error: err.message });
      } else {
        console.error(`[error] ${method} ${pathname}:`, err);
        if (!res.headersSent) sendJson(res, 500, { error: "Erreur serveur interne." });
      }
    }
    return;
  }

  sendJson(res, 404, { error: "Route introuvable." });
});

// Aucune erreur isolee ne doit faire tomber tout le serveur (= reveil de 30-60 s
// pour tous les eleves).
process.on("uncaughtException", (err) => console.error("[uncaughtException]", err));
process.on("unhandledRejection", (err) => console.error("[unhandledRejection]", err));

// Timeouts adaptes aux connexions mobiles lentes (valeurs par defaut Node : 5 s
// de keep-alive, 60 s de reception de headers).
server.keepAliveTimeout = 65_000;
server.headersTimeout = 70_000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n  English Academy API pret sur http://localhost:${PORT} (base en cours d'initialisation...)\n`);
});
