// frontend/config.js
// ⚠️ Avant de deployer, remplacez API_BASE_URL par l'URL reelle de votre
// backend deploye (ex: https://angloba-backend.onrender.com/api).
window.APP_CONFIG = {
  API_BASE_URL: "https://angloba-platform.onrender.com/api",
};
if (window.APP_CONFIG.API_BASE_URL.includes("localhost") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
  console.warn(
    "[config.js] API_BASE_URL pointe encore vers localhost alors que le site n'est pas en local. " +
    "Pense a le remplacer par l'URL de ton backend deploye avant de partager le lien."
  );
}
