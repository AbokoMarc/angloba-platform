// frontend/assets/js/paywall.js
//
// Utilise sur les pages elève dont le contenu est verrouille par
// l'abonnement (Current Lesson, Speaking Lab, Vocabulary, Compositions).
// Si l'API renvoie 402 (essai/abonnement expire), on redirige proprement
// vers la page d'abonnement au lieu d'afficher une erreur brute.
function handlePaywallError(err) {
  if (err && err.status === 402) {
    window.location.href = "/student/subscribe.html";
    return true;
  }
  return false;
}
