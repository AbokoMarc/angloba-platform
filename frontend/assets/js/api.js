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

// Render (plan gratuit) endort le serveur apres 15 min d'inactivite : la
// toute premiere requete apres un reveil peut echouer ou prendre du temps
// pendant que le serveur redemarre (souvent percu comme une "erreur
// serveur" intermittente et impossible a reproduire). On reessaie
// automatiquement 2 fois avant d'abandonner, pour absorber ce cas sans que
// l'utilisateur ait besoin de recliquer lui-meme.
const RETRY_DELAYS_MS = [1500, 3000];

async function apiRequest(method, path, body, attempt = 0) {
  const headers = { "Content-Type": "application/json" };
  const token = Auth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${window.APP_CONFIG.API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    // fetch() a leve (serveur injoignable, DNS, coupure...) -> on reessaie
    // avant d'abandonner, plutot que d'afficher une erreur au premier coup.
    if (attempt < RETRY_DELAYS_MS.length) {
      await wait(RETRY_DELAYS_MS[attempt]);
      return apiRequest(method, path, body, attempt + 1);
    }
    const error = new Error("Impossible de contacter le serveur. Vérifie ta connexion et réessaie.");
    error.status = 0;
    throw error;
  }

  // 502/503/504 = le serveur redemarre (cold start) -> meme logique de reessai.
  if ([502, 503, 504].includes(res.status) && attempt < RETRY_DELAYS_MS.length) {
    await wait(RETRY_DELAYS_MS[attempt]);
    return apiRequest(method, path, body, attempt + 1);
  }

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

const api = {
  get: (path) => apiRequest("GET", path),
  post: (path, body) => apiRequest("POST", path, body),
  put: (path, body) => apiRequest("PUT", path, body),
  patch: (path, body) => apiRequest("PATCH", path, body),
};
