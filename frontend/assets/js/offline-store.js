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
const DB_VERSION = 2;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("weeks")) db.createObjectStore("weeks", { keyPath: "number" });
      if (!db.objectStoreNames.contains("pendingSync")) db.createObjectStore("pendingSync", { keyPath: "id", autoIncrement: true });
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "key" });
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

// ---------- Compteur de badge (icône de l'app) ----------
// Partagé entre les pages ET le service worker (IndexedDB est accessible
// des deux cotes). Incremente a chaque notification recue, remis a zero
// des que l'utilisateur rouvre l'app.

async function incrementBadgeCount() {
  try {
    return await withStore("meta", "readwrite", (store) => {
      return new Promise((resolve) => {
        const getReq = store.get("badgeCount");
        getReq.onsuccess = () => {
          const next = (getReq.result?.value || 0) + 1;
          store.put({ key: "badgeCount", value: next });
          resolve(next);
        };
        getReq.onerror = () => resolve(1);
      });
    });
  } catch { return 1; }
}

async function resetBadgeCount() {
  try {
    await withStore("meta", "readwrite", (store) => store.put({ key: "badgeCount", value: 0 }));
  } catch { /* ignore */ }
}

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
