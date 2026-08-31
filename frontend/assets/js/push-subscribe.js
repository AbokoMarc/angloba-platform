// frontend/assets/js/push-subscribe.js
//
// A inclure sur les pages protegees (apres shell.js). Demande la permission
// de notification une seule fois par appareil, s'abonne au Web Push via le
// service worker, et enregistre l'abonnement cote serveur.

async function ensurePushSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  if (!Auth.isLoggedIn()) return;

  try {
    const { publicKey } = await api.get("/push/vapid-public-key");
    if (!publicKey) return; // VAPID pas encore configure cote serveur

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      if (Notification.permission === "denied") return;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    await api.post("/push/subscribe", { subscription: subscription.toJSON() });
  } catch (err) {
    console.warn("[push-subscribe] echec:", err.message);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

// Attend que le service worker soit pret puis tente l'abonnement — sans
// jamais bloquer le rendu de la page (best-effort, en arriere-plan).
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.ready.then(ensurePushSubscription).catch(() => {});
}
