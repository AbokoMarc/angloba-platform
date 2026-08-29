// frontend/student/subscribe.js

let pollTimer = null;

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "dashboard", title: "Subscription", subtitle: "Ton abonnement English Academy" });
  if (!ctx) return;

  try {
    const { subscription, payments, plan } = await api.get("/payments/me");
    render(subscription, payments, plan);
  } catch (err) {
    document.getElementById("subscribe-root").innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();

function render(subscription, payments, plan) {
  const root = document.getElementById("subscribe-root");
  const isActive = subscription.subscription_status === "active" && subscription.subscription_expires_at && new Date(subscription.subscription_expires_at + "Z") > new Date();
  const isTrial = subscription.subscription_status === "trial";
  const trialDaysLeft = isTrial && subscription.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at + "Z") - new Date()) / 86400000))
    : 0;

  root.innerHTML = `
    <div class="card" style="background:var(--primary);color:#fff;text-align:center;">
      ${isActive ? `
        <p style="font-size:30px;">✅</p>
        <p style="font-weight:600;font-size:16px;">Abonnement actif</p>
        <p style="color:rgba(255,255,255,.6);font-size:12.5px;margin-top:4px;">Valide jusqu'au ${formatDate(subscription.subscription_expires_at)}</p>
      ` : isTrial && trialDaysLeft > 0 ? `
        <p style="font-size:30px;">🎁</p>
        <p style="font-weight:600;font-size:16px;">Essai gratuit</p>
        <p style="color:rgba(255,255,255,.6);font-size:12.5px;margin-top:4px;">${trialDaysLeft} jour(s) restant(s)</p>
      ` : `
        <p style="font-size:30px;">🔒</p>
        <p style="font-weight:600;font-size:16px;">Accès expiré</p>
        <p style="color:rgba(255,255,255,.6);font-size:12.5px;margin-top:4px;">Abonne-toi pour continuer ton programme</p>
      `}
    </div>

    <div class="card">
      <p style="font-weight:600;font-size:15px;margin-bottom:4px;">Abonnement mensuel</p>
      <p style="font-size:28px;font-weight:800;color:var(--primary);margin-bottom:2px;">${plan.price.toLocaleString()} ${plan.currency}<span style="font-size:13px;font-weight:500;color:var(--text-muted);"> / mois</span></p>
      <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:14px;">Accès complet : cours, exercices, Speaking Lab avec IA, corrections.</p>

      <div class="row" style="gap:8px;margin-bottom:12px;">
        <span class="badge badge-accent">🟠 Orange Money</span>
        <span class="badge badge-accent">🟡 MTN Mobile Money</span>
      </div>

      <label>Ton numéro Mobile Money</label>
      <input type="tel" id="phone-input" placeholder="6XXXXXXXX ou 2XXXXXXXX" style="margin-bottom:10px;" />
      <button class="btn btn-primary btn-block" id="pay-btn">${isActive ? "Renouveler maintenant" : "Recevoir la demande de paiement"}</button>
      <p id="pay-status" style="font-size:12px;text-align:center;margin-top:8px;"></p>
    </div>

    ${payments.length ? `
    <div class="card">
      <p style="font-weight:600;font-size:14px;margin-bottom:10px;">Historique</p>
      <div class="stack" style="gap:6px;">
        ${payments.map((p) => `
          <div class="row-between" style="font-size:12.5px;">
            <span>${formatDate(p.created_at)}</span>
            <span class="badge ${p.status === "success" ? "badge-success" : p.status === "failed" ? "badge-muted" : "badge-accent"}">${p.status}</span>
          </div>`).join("")}
      </div>
    </div>` : ""}
  `;

  document.getElementById("pay-btn").addEventListener("click", async (e) => {
    const phoneInput = document.getElementById("phone-input");
    let phone = phoneInput.value.replace(/\s/g, "");
    if (/^[62]\d{8}$/.test(phone)) phone = "237" + phone; // ajoute l'indicatif si oublie

    const statusEl = document.getElementById("pay-status");
    if (!/^237[62]\d{8}$/.test(phone)) {
      statusEl.textContent = "⚠️ Numéro invalide (format attendu : 6XXXXXXXX pour MTN, 2XXXXXXXX pour Orange).";
      statusEl.style.color = "var(--danger)";
      return;
    }

    e.target.disabled = true;
    e.target.innerHTML = `<span class="spinner"></span> Envoi de la demande...`;
    statusEl.textContent = "";

    try {
      const { transactionId } = await api.post("/payments/initiate", { phone });
      e.target.innerHTML = `<span class="spinner"></span> Confirme sur ton téléphone...`;
      statusEl.style.color = "var(--text-muted)";
      statusEl.textContent = "Un code de confirmation a été envoyé sur ton téléphone. Compose ton code secret Mobile Money pour valider.";
      pollPaymentStatus(transactionId, e.target, statusEl);
    } catch (err) {
      statusEl.textContent = `⚠️ ${err.message}`;
      statusEl.style.color = "var(--danger)";
      e.target.disabled = false;
      e.target.textContent = isActive ? "Renouveler maintenant" : "Recevoir la demande de paiement";
    }
  });
}

function pollPaymentStatus(transactionId, button, statusEl) {
  let attempts = 0;
  const MAX_ATTEMPTS = 30; // ~2 minutes a 4s d'intervalle

  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    attempts++;
    try {
      const { status } = await api.get(`/payments/status/${transactionId}`);
      if (status === "success") {
        clearInterval(pollTimer);
        statusEl.style.color = "var(--success)";
        statusEl.textContent = "✅ Paiement confirmé ! Ton abonnement est actif.";
        button.textContent = "Payé !";
        setTimeout(() => window.location.reload(), 1500);
      } else if (status === "failed") {
        clearInterval(pollTimer);
        statusEl.style.color = "var(--danger)";
        statusEl.textContent = "Le paiement a échoué ou a été annulé. Réessaie.";
        button.disabled = false;
        button.textContent = "Recevoir la demande de paiement";
      } else if (attempts >= MAX_ATTEMPTS) {
        clearInterval(pollTimer);
        statusEl.style.color = "var(--text-muted)";
        statusEl.textContent = "Toujours en attente — recharge cette page dans un instant si tu as déjà confirmé sur ton téléphone.";
        button.disabled = false;
        button.textContent = "Recevoir la demande de paiement";
      }
    } catch { /* on retente au prochain tick */ }
  }, 4000);
}

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str + "Z");
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
