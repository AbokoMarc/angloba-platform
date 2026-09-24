// frontend/assets/js/pwa-register.js
//
// 1) Enregistre le service worker sur toutes les pages.
// 2) Systeme d'installation AUTOMATIQUE et PROACTIF : a chaque ouverture du
//    site, verifie si l'app est deja installee sur l'appareil ; si non,
//    propose l'installation via un bandeau (PC/Android via l'evenement
//    natif beforeinstallprompt, iOS via des instructions manuelles car
//    Apple ne permet pas de declencher l'installation par code).

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}

(function setupInstallPrompt() {
  const DISMISS_KEY = "angloba_install_dismissed_forever";
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  if (isStandalone) return; // deja installee -> jamais de bandeau
  if (localStorage.getItem(DISMISS_KEY) === "true") return; // l'utilisateur a explicitement refuse

  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isSafariOnIos = isIos && !/CriOS|FxiOS|EdgiOS/.test(ua);

  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showBanner({
      text: "Installe l'application sur cet appareil pour un accès plus rapide, hors ligne.",
      buttonLabel: "Installer",
      onAction: async () => {
        hideBanner();
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      },
    });
  });

  // iOS Safari ne supporte pas beforeinstallprompt : on propose des
  // instructions manuelles des le chargement de la page, sans attendre
  // d'evenement qui ne viendra jamais.
  if (isSafariOnIos) {
    showBanner({
      text: "Installe cette app : appuie sur Partager, puis \"Sur l'écran d'accueil\".",
      buttonLabel: "Compris",
      onAction: () => hideBanner(),
    });
  }

  function showBanner({ text, buttonLabel, onAction }) {
    if (document.getElementById("pwa-install-banner")) return;

    const banner = document.createElement("div");
    banner.id = "pwa-install-banner";
    banner.style.cssText = `
      position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 80;
      background: #0F2544; color: #fff; border-radius: 14px; padding: 14px 16px;
      display: flex; align-items: center; gap: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.25);
      font-family: -apple-system, sans-serif; animation: pwa-slide-up .3s ease;
    `;
    banner.innerHTML = `
      <style>@keyframes pwa-slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }</style>
      <span style="font-size:22px;flex-shrink:0;">📲</span>
      <span style="flex:1;font-size:13px;line-height:1.4;">${text}</span>
      <button id="pwa-install-action" style="background:#E8834A;color:#0F2544;border:none;border-radius:8px;padding:8px 14px;font-weight:600;font-size:13px;flex-shrink:0;">${buttonLabel}</button>
      <button id="pwa-install-dismiss" style="background:none;border:none;color:rgba(255,255,255,.5);font-size:18px;padding:0 4px;flex-shrink:0;">✕</button>
    `;
    document.body.appendChild(banner);

    document.getElementById("pwa-install-action").addEventListener("click", onAction);
    document.getElementById("pwa-install-dismiss").addEventListener("click", () => {
      localStorage.setItem(DISMISS_KEY, "true");
      hideBanner();
    });
  }

  function hideBanner() {
    document.getElementById("pwa-install-banner")?.remove();
  }
})();
