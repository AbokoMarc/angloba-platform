// backend/src/db/client.js
//
// Client de base de données unique pour toute l'app.
// - En production : Turso (libSQL), une vraie base distante persistante.
// - En local, si TURSO_DATABASE_URL n'est pas défini : repli automatique
//   sur un fichier SQLite local (backend/data/angloba.sqlite).
//
// Ce fichier est le SEUL endroit de l'app qui parle directement de
// libSQL/Turso — tous les repositories passent par `db.execute(...)`.

import { createClient } from "@libsql/client";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DB_PATH = path.join(__dirname, "..", "..", "data", "angloba.sqlite");

const usingTurso = Boolean(process.env.TURSO_DATABASE_URL);

export const db = createClient(
  usingTurso
    ? {
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }
    : {
        url: `file:${LOCAL_DB_PATH}`,
      }
);

export function isUsingTurso() {
  return usingTurso;
}

if (!usingTurso) {
  console.log(
    `[db] TURSO_DATABASE_URL absent -> SQLite local : ${LOCAL_DB_PATH}\n` +
    `[db]  Attention: ce fichier est efface si vous redeployez sur un disque ephemere.\n` +
    `[db]  Configurez TURSO_DATABASE_URL + TURSO_AUTH_TOKEN pour la prod.`
  );
} else {
  console.log("[db] Connecte a Turso (libSQL distant, persistant).");
}
