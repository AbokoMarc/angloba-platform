// frontend/assets/js/offline-sync.js
//
// Rejoue automatiquement les actions mises en file (offline-store.js) des
// que la connexion revient. Affiche aussi un petit badge "Hors-ligne" /
// "Synchronisation..." dans le topbar (id="offline-indicator", injecte par
// shell.js).
//
// Utilisation typique dans une page (ex: lesson.js) :
//   if (!navigator.onLine) {
//     await queuePendingAction({ url: `/courses/weeks/${n}/submit-exercises`, method: "POST", body: {...}, description: "Exercices semaine X" });
//     // -> afficher immediatement un etat "en attente de sync" a l'ecran
//   } else {
//     await api.post(...) // chemin normal
//   }

let syncing = false;

async function trySyncPending() {
  if (syncing || !navigator.onLine) return;
  syncing = true;

  try {
    const pending = await getPendingActions();
    for (const action of pending) {
      try {
        await api[action.method.toLowerCase()](action.url, action.body);
        await removePendingAction(action.id);
      } catch (err) {
        // Si le serveur refuse vraiment (ex: 400/403), on abandonne cette
        // action plutot que de la retenter a l'infini ; les erreurs reseau
        // (pas de statut) restent en file pour la prochaine tentative.
        if (err.status) await removePendingAction(action.id);
        console.warn("[offline-sync] echec de synchronisation:", action.description, err.message);
      }
    }
    updateOfflineIndicator();
  } finally {
    syncing = false;
  }
}

function updateOfflineIndicator() {
  const el = document.getElementById("offline-indicator");
  if (!el) return;
  if (!navigator.onLine) {
    el.style.display = "flex";
    el.textContent = "📴 Mode hors-ligne";
  } else {
    getPendingActions().then((pending) => {
      if (pending.length) {
        el.style.display = "flex";
        el.textContent = "🔄 Synchronisation...";
      } else {
        el.style.display = "none";
      }
    });
  }
}

window.addEventListener("online", trySyncPending);
window.addEventListener("offline", updateOfflineIndicator);
document.addEventListener("DOMContentLoaded", () => {
  updateOfflineIndicator();
  if (navigator.onLine) trySyncPending();
});

// Le topbar (et donc #offline-indicator) est injecte de façon asynchrone par
// shell.js — un petit intervalle garantit que le badge apparait des qu'il
// existe, et sert aussi de heartbeat de synchronisation en arriere-plan.
setInterval(updateOfflineIndicator, 5000);
