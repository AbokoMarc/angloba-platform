// frontend/assets/js/api.js
// Petit wrapper fetch() qui attache automatiquement le token JWT stocke
// en localStorage, et centralise la gestion des erreurs.

const AUTH_TOKEN_KEY = "angloba_token";
const AUTH_USER_KEY = "angloba_user";

const Auth = {
  getToken() { return localStorage.getItem(AUTH_TOKEN_KEY); },
  getUser() {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setSession(token, user) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },
  isLoggedIn() { return Boolean(this.getToken()); },
};

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

// Render (plan gratuit) endort le serveur apres 15 min d'inactivite : le premier
// appel apres un reveil peut mettre 30 a 60 s. Avant : 2 reessais sur 4,5 s au
// total -> "Impossible de contacter le serveur" bien avant la fin du reveil
// (et fetch() sans delai maximum pouvait aussi rester fige indefiniment sur
// une connexion mobile qui "accroche"). Maintenant : delai max par tentative +
// 6 reessais progressifs (~45 s) avec un bandeau pour que l'eleve comprenne.
const REQUEST_TIMEOUT_MS = 20000;
const RETRY_DELAYS_MS = [2000, 4000, 6000, 8000, 10000, 12000];

function slowBanner(show, text) {
  let el = document.getElementById("slow-net-banner");
  if (!show) { el?.remove(); return; }
  if (!el) {
    el = document.createElement("div");
    el.id = "slow-net-banner";
    el.setAttribute("role", "status");
    el.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:100;padding:10px 14px;background:#FFE6CC;color:#7A3A00;font:700 13.5px/1.3 -apple-system,Segoe UI,Roboto,sans-serif;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.15);";
    document.body?.appendChild(el);
  }
  el.textContent = text;
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function apiRequest(method, path, body, attempt = 0) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = Auth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const canRetry = attempt < RETRY_DELAYS_MS.length;
  const retry = async (why) => {
    slowBanner(true, `Connexion lente… nouvelle tentative (${attempt + 1}/${RETRY_DELAYS_MS.length})${why ? " — " + why : ""}`);
    await wait(RETRY_DELAYS_MS[attempt]);
    return apiRequest(method, path, body, attempt + 1);
  };

  let res;
  try {
    res = await fetchWithTimeout(`${window.APP_CONFIG.API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    const timedOut = networkErr?.name === "AbortError";
    // Un POST qui a depasse le delai a peut-etre DEJA ete traite par le serveur
    // (ex: avancer d'un jour) : on ne le rejoue pas a l'aveugle.
    if (canRetry && (method === "GET" || !timedOut)) return retry(timedOut ? "serveur lent" : "");
    slowBanner(false);
    const error = new Error(timedOut
      ? "La connexion est trop lente. Réessaie dans un instant (ou change de réseau Wi-Fi/mobile)."
      : "Impossible de contacter le serveur. Vérifie ta connexion et réessaie.");
    error.status = 0;
    throw error;
  }

  // 502/503/504 = le serveur redemarre (cold start) -> jamais traite, on peut rejouer.
  if ([502, 503, 504].includes(res.status) && canRetry) return retry("le serveur se réveille");

  slowBanner(false);

  let data = null;
  try { data = await res.json(); } catch { /* pas de corps JSON */ }

  if (res.status === 401) {
    // Session expiree ou invalide -> on nettoie et on renvoie vers la bonne page de connexion.
    Auth.clear();
  }

  if (!res.ok) {
    const error = new Error((data && data.error) || `Erreur ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

// Pre-chauffage : sur les pages publiques (accueil, connexion, inscription),
// on reveille le serveur PENDANT que l'eleve saisit ses identifiants, au lieu
// d'attendre le clic sur "Sign in".
(function warmUp() {
  try {
    if (Auth.isLoggedIn() || !window.APP_CONFIG?.API_BASE_URL) return;
    fetch(`${window.APP_CONFIG.API_BASE_URL}/health`, { cache: "no-store", mode: "cors" }).catch(() => {});
  } catch { /* sans importance */ }
})();

const api = {
  get: (path) => apiRequest("GET", path),
  post: (path, body) => apiRequest("POST", path, body),
  put: (path, body) => apiRequest("PUT", path, body),
  patch: (path, body) => apiRequest("PATCH", path, body),
};
