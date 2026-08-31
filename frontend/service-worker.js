// frontend/service-worker.js
//
// Service worker minimal : met en cache les fichiers statiques (CSS/JS/HTML
// de l'app shell) pour un chargement instantane une fois installee, et pour
// satisfaire les criteres d'installation des navigateurs (manifest + SW
// avec un handler "fetch"). Les appels a l'API restent toujours en reseau
// direct (jamais mis en cache) puisque les donnees changent en permanence.

const CACHE_NAME = "angloba-shell-v3";
const APP_SHELL = [
  "/index.html",
  "/connexion.html",
  "/inscription.html",
  "/connexion-staff.html",
  "/offline.html",
  "/assets/css/base.css",
  "/assets/js/api.js",
  "/assets/js/shell.js",
  "/assets/js/icons.js",
  "/config.js",
  "/manifest.json",
  "/manifest-staff.json",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/assets/icons/icon-staff-192.png",
  "/assets/icons/icon-staff-512.png",
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
        .catch(() => {
          // Page jamais visitee/cachee ET hors-ligne : fallback pour que
          // l'app ne reste jamais bloquee sur un ecran blanc/logo qui tourne.
          if (event.request.mode === "navigate") return caches.match("/offline.html");
          return cached;
        });
      return cached || networkFetch;
    })
  );
});

// --- Notifications Push ---
// Reception d'une notif push (envoyee par le backend via web-push).
self.addEventListener("push", (event) => {
  let data = { title: "English Academy", body: "Tu as une nouvelle notification.", url: "/" };
  try { data = { ...data, ...event.data.json() }; } catch { /* payload non-JSON, on garde les valeurs par defaut */ }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/assets/icons/icon-192.png",
      badge: "/assets/icons/icon-192.png",
      vibrate: [100, 50, 100],
      data: { url: data.url || "/" },
    }).then(() => {
      if ("setAppBadge" in self.navigator) self.navigator.setAppBadge(1).catch(() => {});
    })
  );
});

// Clic sur la notification : ouvre (ou reactive) l'onglet cible.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      if ("clearAppBadge" in self.navigator) await self.navigator.clearAppBadge().catch(() => {});

      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = allClients.find((c) => c.url.includes(targetUrl));
      if (existing) return existing.focus();

      return self.clients.openWindow(targetUrl);
    })()
  );
});
