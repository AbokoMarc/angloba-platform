// frontend/assets/js/offline-store.js
//
// Wrapper minimal autour d'IndexedDB (aucune dependance externe type "idb" —
// meme esprit "zero dependance" que le reste du frontend). Deux "stores" :
//   - "weeks"       : cache des semaines deja consultees (grammaire, vocab,
//                     exercices) pour un affichage INSTANTANE meme hors-ligne.
//   - "pendingSync" : actions faites hors-ligne (ex: exercices soumis) qui
//                     attendent d'etre rejouees vers le serveur des que la
//                     connexion revient.

const DB_NAME = "angloba-offline";
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("weeks")) db.createObjectStore("weeks", { keyPath: "number" });
      if (!db.objectStoreNames.contains("pendingSync")) db.createObjectStore("pendingSync", { keyPath: "id", autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore(storeName, mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = fn(store);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
}

// ---------- Cache des semaines (App Shell "contenu") ----------

async function cacheWeekData(weekNumber, data) {
  try {
    await withStore("weeks", "readwrite", (store) => store.put({ number: weekNumber, data, cachedAt: Date.now() }));
  } catch (err) { console.warn("[offline-store] cacheWeekData a echoue:", err); }
}

function getCachedWeekData(weekNumber) {
  return new Promise((resolve) => {
    openDb().then((db) => {
      const tx = db.transaction("weeks", "readonly");
      const req = tx.objectStore("weeks").get(weekNumber);
      req.onsuccess = () => resolve(req.result?.data || null);
      req.onerror = () => resolve(null);
    }).catch(() => resolve(null));
  });
}

// ---------- File d'attente de synchronisation ----------

async function queuePendingAction(action) {
  // action: { url, method, body, description }
  try {
    await withStore("pendingSync", "readwrite", (store) => store.add({ ...action, queuedAt: Date.now() }));
  } catch (err) { console.warn("[offline-store] queuePendingAction a echoue:", err); }
}

function getPendingActions() {
  return new Promise((resolve) => {
    openDb().then((db) => {
      const tx = db.transaction("pendingSync", "readonly");
      const req = tx.objectStore("pendingSync").getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    }).catch(() => resolve([]));
  });
}

async function removePendingAction(id) {
  try {
    await withStore("pendingSync", "readwrite", (store) => store.delete(id));
  } catch (err) { console.warn("[offline-store] removePendingAction a echoue:", err); }
}
