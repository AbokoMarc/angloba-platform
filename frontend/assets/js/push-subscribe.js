// frontend/assets/js/push-subscribe.js
//
// Notifications push (Web Push) — pilotees par un BOUTON (Paramètres > Notifications).
//  - Aucune demande de permission automatique au chargement : les navigateurs
//    (surtout Safari/iPhone) EXIGENT un geste de l'utilisateur pour la demander.
//  - Si la permission est déjà accordée, on resynchronise l'abonnement en silence.
//  - iPhone/iPad : les notifications ne marchent que si le site est ajouté à
//    l'écran d'accueil (iOS 16.4 minimum) — on le détecte et on guide l'utilisateur.

const Push = (() => {
  const ua = navigator.userAgent;
  const isIos = (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) && !window.MSStream;
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const isAndroid = /Android/i.test(ua);

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
  }

  const supported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

  async function currentSubscription() {
    if (!("serviceWorker" in navigator)) return null;
    try {
      const reg = await navigator.serviceWorker.ready;
      return await reg.pushManager.getSubscription();
    } catch { return null; }
  }

  // Etat lisible par l'interface :
  //  unsupported | needs-install | denied | off | on
  async function status() {
    if (isIos && !isStandalone) return { state: "needs-install", isIos, isAndroid };
    if (!supported()) return { state: "unsupported", isIos, isAndroid };
    if (Notification.permission === "denied") return { state: "denied", isIos, isAndroid };
    const sub = await currentSubscription();
    if (Notification.permission === "granted" && sub) return { state: "on", isIos, isAndroid, endpoint: sub.endpoint };
    return { state: "off", isIos, isAndroid };
  }

  // A appeler DANS un clic (geste utilisateur). Lève une Error au message clair.
  async function enable() {
    const st = await status();
    if (st.state === "needs-install") throw new Error("Sur iPhone, ajoute d'abord le site à l'écran d'accueil.");
    if (st.state === "unsupported") throw new Error("Ton navigateur ne supporte pas les notifications.");
    if (st.state === "denied") throw new Error("Les notifications sont bloquées pour ce site dans les réglages de ton téléphone.");

    const { publicKey } = await api.get("/push/vapid-public-key");
    if (!publicKey) throw new Error("Les notifications ne sont pas encore configurées sur le serveur.");

    // IMPORTANT : requestPermission d'abord, directement dans le geste (aucun await avant sur Safari)
    const permission = await Notification.requestPermission();
    if (permission !== "granted") throw new Error("Permission refusée. Tu peux la réactiver dans les réglages du téléphone.");

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
    }
    await api.post("/push/subscribe", { subscription: sub.toJSON() });
    return sub;
  }

  async function disable() {
    const sub = await currentSubscription();
    if (sub) {
      try { await api.post("/push/unsubscribe", { endpoint: sub.endpoint }); } catch {}
      await sub.unsubscribe().catch(() => {});
    }
  }

  async function sendTest() {
    return api.post("/push/test", {});
  }

  // Resynchronisation silencieuse (jamais de popup de permission ici)
  async function silentSync() {
    try {
      if (!supported() || !Auth.isLoggedIn() || Notification.permission !== "granted") return;
      const sub = await currentSubscription();
      if (sub) await api.post("/push/subscribe", { subscription: sub.toJSON() });
    } catch {}
  }

  return { status, enable, disable, sendTest, silentSync, isIos, isStandalone, isAndroid };
})();

// Compat : ancien nom utilisé par certaines pages
async function ensurePushSubscription() { return Push.silentSync(); }

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.ready.then(() => Push.silentSync()).catch(() => {});
}

/* ------------------------------------------------------------------
 * Fenêtre "Notifications" (utilisable depuis n'importe quelle page).
 * onChange(state) est appelé quand l'état change (pour rafraîchir la ligne des Paramètres).
 * ------------------------------------------------------------------ */
async function openNotificationsSheet(onChange) {
  document.getElementById("notif-sheet")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "notif-sheet";
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:100;display:flex;align-items:flex-end;justify-content:center;";
  overlay.innerHTML = `<div id="notif-card" style="background:#fff;width:100%;max-width:520px;border-radius:22px 22px 0 0;padding:14px 18px 26px;max-height:88vh;overflow-y:auto;font-family:inherit;">
    <div style="width:38px;height:4px;background:#ddd;border-radius:99px;margin:4px auto 12px;"></div>
    <div id="notif-body" style="text-align:center;padding:20px 0;"><span class="spinner"></span></div>
  </div>`;
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);

  const body = overlay.querySelector("#notif-body");
  const step = (n, html) => `<li style="display:flex;gap:10px;align-items:flex-start;margin:10px 0;"><span style="flex:none;width:24px;height:24px;border-radius:50%;background:#ff7a00;color:#fff;font-weight:800;font-size:13px;display:grid;place-items:center;">${n}</span><span>${html}</span></li>`;
  const btn = (id, label, kind = "cta") => `<button id="${id}" class="btn ${kind === "cta" ? "btn-cta" : "btn-outline"} btn-block" style="margin-top:10px;">${label}</button>`;
  const msg = (text, color = "var(--text-muted)") => `<p id="notif-msg" style="font-size:13.5px;font-weight:700;color:${color};margin-top:12px;min-height:18px;">${text || ""}</p>`;
  const title = (emoji, text) => `<p style="font-size:40px;">${emoji}</p><h3 style="font-size:20px;font-weight:800;color:var(--brand);margin:6px 0 8px;">${text}</h3>`;

  async function draw() {
    const st = await Push.status();
    onChange?.(st.state);

    if (st.state === "needs-install") {
      body.innerHTML = `${title("📲", "Installe l'app sur ton iPhone")}
        <p style="font-size:14px;color:var(--text-muted);font-weight:600;">Apple n'autorise les notifications que pour les sites ajoutés à l'écran d'accueil (iOS 16.4 ou plus récent).</p>
        <ol style="list-style:none;padding:0;margin:12px 0;text-align:left;font-size:14.5px;font-weight:600;color:var(--text);">
          ${step(1, "Ouvre ce site dans <b>Safari</b> (pas dans Chrome ni dans WhatsApp).")}
          ${step(2, "Appuie sur le bouton <b>Partager</b> (le carré avec une flèche ⬆︎, en bas de l'écran).")}
          ${step(3, "Choisis <b>« Sur l'écran d'accueil »</b>, puis <b>Ajouter</b>.")}
          ${step(4, "<b>Ferme Safari</b> et ouvre l'app depuis la nouvelle icône sur ton écran d'accueil.")}
          ${step(5, "Va dans <b>Plus → Paramètres → Notifications</b> et appuie sur <b>Activer</b>.")}
        </ol>
        ${btn("notif-close", "J'ai compris", "outline")}`;
    } else if (st.state === "unsupported") {
      body.innerHTML = `${title("😕", "Non disponible ici")}
        <p style="font-size:14px;color:var(--text-muted);font-weight:600;">Ce navigateur ne supporte pas les notifications. Essaie avec <b>Chrome</b> (Android / ordinateur) ou <b>Safari</b> (iPhone, après l'ajout à l'écran d'accueil).</p>
        ${btn("notif-close", "Fermer", "outline")}`;
    } else if (st.state === "denied") {
      body.innerHTML = `${title("🔕", "Notifications bloquées")}
        <p style="font-size:14px;color:var(--text-muted);font-weight:600;">Tu as refusé les notifications pour ce site. Pour les réactiver :</p>
        <ol style="list-style:none;padding:0;margin:12px 0;text-align:left;font-size:14.5px;font-weight:600;">
          ${st.isIos
            ? `${step(1, "Ouvre <b>Réglages</b> de l'iPhone → <b>Notifications</b>.")}${step(2, "Trouve l'app dans la liste et mets <b>Autoriser les notifications</b>.")}${step(3, "Reviens ici et appuie sur <b>Activer</b>.")}`
            : `${step(1, "Appuie sur le <b>cadenas</b> (ou ⋮) à côté de l'adresse du site.")}${step(2, "Ouvre <b>Autorisations</b> → <b>Notifications</b> → <b>Autoriser</b>.")}${step(3, "Recharge la page puis appuie sur <b>Activer</b>.")}`}
        </ol>
        ${btn("notif-close", "Fermer", "outline")}`;
    } else if (st.state === "on") {
      body.innerHTML = `${title("🔔", "Notifications activées")}
        <p style="font-size:14px;color:var(--text-muted);font-weight:600;">Tu recevras tes rappels, les corrections et les messages de ton professeur sur cet appareil.</p>
        ${btn("notif-test", "Envoyer une notification test")}
        ${btn("notif-off", "Désactiver sur cet appareil", "outline")}
        ${msg("")}`;
    } else {
      body.innerHTML = `${title("🔔", "Activer les notifications")}
        <p style="font-size:14px;color:var(--text-muted);font-weight:600;">Reçois un rappel pour ne pas perdre ta série, et sois prévenu quand ta composition est corrigée.</p>
        ${btn("notif-on", "Activer les notifications")}
        ${msg("")}`;
    }

    body.querySelector("#notif-close")?.addEventListener("click", () => overlay.remove());
    const setMsg = (t, c) => { const m = body.querySelector("#notif-msg"); if (m) { m.textContent = t; m.style.color = c || "var(--text-muted)"; } };

    body.querySelector("#notif-on")?.addEventListener("click", async (e) => {
      e.currentTarget.disabled = true;
      setMsg("Activation…");
      try {
        await Push.enable();
        try { await Push.sendTest(); } catch {}
        await draw();
      } catch (err) {
        e.currentTarget.disabled = false;
        setMsg(err.message || "Impossible d'activer les notifications.", "var(--danger)");
        if (/refus|bloqu/i.test(err.message || "")) setTimeout(draw, 1200);
      }
    });
    body.querySelector("#notif-test")?.addEventListener("click", async (e) => {
      e.currentTarget.disabled = true;
      setMsg("Envoi…");
      try { await Push.sendTest(); setMsg("✅ Notification envoyée — regarde ton écran !", "#14663F"); }
      catch (err) { setMsg(err.message || "Échec de l'envoi.", "var(--danger)"); }
      e.currentTarget.disabled = false;
    });
    body.querySelector("#notif-off")?.addEventListener("click", async () => { await Push.disable(); await draw(); });
  }
  draw();
}
