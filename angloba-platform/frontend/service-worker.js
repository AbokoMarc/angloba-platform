// frontend/service-worker.js
//
// Service worker minimal : met en cache les fichiers statiques (CSS/JS/HTML
// de l'app shell) pour un chargement instantane une fois installee, et pour
// satisfaire les criteres d'installation des navigateurs (manifest + SW
// avec un handler "fetch"). Les appels a l'API restent toujours en reseau
// direct (jamais mis en cache) puisque les donnees changent en permanence.

const CACHE_NAME = "angloba-shell-v1";
const APP_SHELL = [
  "/index.html",
  "/connexion.html",
  "/inscription.html",
  "/assets/css/base.css",
  "/assets/js/api.js",
  "/assets/js/shell.js",
  "/assets/js/icons.js",
  "/config.js",
  "/manifest.json",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Jamais de cache pour les appels API — toujours des donnees fraiches.
  if (url.pathname.startsWith("/api/") || event.request.method !== "GET") {
    return;
  }

  // Fichiers statiques de l'app : cache d'abord, reseau en secours (et mise
  // a jour silencieuse du cache pour la prochaine fois).
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
