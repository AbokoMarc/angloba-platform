// frontend/student/subscribe.js

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "dashboard", title: "Subscription", subtitle: "Ton abonnement English Academy" });
  if (!ctx) return;

  const root = document.getElementById("subscribe-root");
  const params = new URLSearchParams(window.location.search);

  try {
    const { subscription, payments, plan } = await api.get("/payments/me");
    render(subscription, payments, plan);

    // Retour depuis la page de paiement NotchPay : on force une verification.
    if (params.get("status") === "return" && params.get("ref")) {
      root.insertAdjacentHTML("afterbegin", `<div class="card" id="checking-banner" style="background:color-mix(in srgb, var(--accent) 15%, white);text-align:center;"><span class="spinner"></span> Vérification du paiement...</div>`);
      const check = await api.get(`/payments/status/${params.get("ref")}`);
      document.getElementById("checking-banner")?.remove();

      if (check.status === "success") {
        const fresh = await api.get("/payments/me");
        render(fresh.subscription, fresh.payments, fresh.plan);
        root.insertAdjacentHTML("afterbegin", `<div class="card" style="background:var(--success-bg);color:var(--success);text-align:center;">✅ Paiement confirmé ! Ton abonnement est actif.</div>`);
      } else if (check.status === "pending") {
        root.insertAdjacentHTML("afterbegin", `<div class="card" style="background:color-mix(in srgb, var(--accent) 15%, white);text-align:center;">⏳ Paiement en cours de traitement — recharge cette page dans une minute.</div>`);
      } else {
        root.insertAdjacentHTML("afterbegin", `<div class="card" style="background:var(--danger-bg);color:var(--danger);text-align:center;">Le paiement n'a pas abouti. Réessaie ci-dessous.</div>`);
      }
    }
  } catch (err) {
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
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
      <div class="row" style="gap:6px;margin-bottom:14px;flex-wrap:wrap;">
        <span class="badge badge-accent">🟠 Orange Money</span>
        <span class="badge badge-accent">🟡 MTN Mobile Money</span>
        <span class="badge badge-accent">💳 Visa / Mastercard</span>
      </div>
      <button class="btn btn-primary btn-block" id="pay-btn">${isActive ? "Renouveler maintenant" : "Payer et débloquer l'accès"}</button>
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
    e.target.disabled = true;
    e.target.innerHTML = `<span class="spinner"></span> Redirection...`;
    try {
      const { authorizationUrl } = await api.post("/payments/initiate", {});
      window.location.href = authorizationUrl;
    } catch (err) {
      document.getElementById("pay-status").textContent = `⚠️ ${err.message}`;
      e.target.disabled = false;
      e.target.textContent = "Payer et débloquer l'accès";
    }
  });
}

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str + "Z");
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
