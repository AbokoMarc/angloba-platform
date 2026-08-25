// frontend/assets/js/pwa-register.js
// Enregistre le service worker sur toutes les pages — condition nécessaire
// pour que Chrome/Edge proposent le bouton "Installer" sur PC et Android.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}
