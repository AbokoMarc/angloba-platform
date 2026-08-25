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

async function apiRequest(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = Auth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${window.APP_CONFIG.API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

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
