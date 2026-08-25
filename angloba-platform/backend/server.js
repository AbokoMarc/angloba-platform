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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "uploads");
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const MIME = { mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4" };

const server = http.createServer(async (req, res) => {
  // CORS — necessaire car le frontend statique (Vercel/Netlify) et l'API
  // (Render/Railway) vivent sur des domaines differents.
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Fichiers audio uploades, servis statiquement
  if (pathname.startsWith("/uploads/")) {
    const filename = pathname.replace("/uploads/", "");
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath) && filePath.startsWith(UPLOAD_DIR)) {
      const ext = filename.split(".").pop();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      return fs.createReadStream(filePath).pipe(res);
    }
    res.writeHead(404); return res.end();
  }

  if (pathname === "/api/health") {
    return sendJson(res, 200, { ok: true, time: new Date().toISOString() });
  }

  for (const [method, pattern, handler] of routes) {
    if (req.method !== method) continue;
    const match = pathname.match(pattern);
    if (!match) continue;
    try {
      await handler(req, res, match.groups || {});
    } catch (err) {
      console.error(`[error] ${method} ${pathname}:`, err);
      if (!res.headersSent) sendJson(res, 500, { error: "Erreur serveur interne." });
    }
    return;
  }

  sendJson(res, 404, { error: "Route introuvable." });
});

ensureSchemaAndSeed()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`\n  English Academy API pret sur http://localhost:${PORT}\n`);
    });
  })
  .catch((err) => {
    console.error("Echec de l'initialisation de la base :", err);
    process.exit(1);
  });
