// frontend/student/dashboard.js

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "dashboard", title: "Dashboard" });
  if (!ctx) return;

  const root = document.getElementById("dashboard-root");

  try {
    const { profile } = await api.get("/students/me/dashboard");
    const monthNum = profile?.current_month || 1;
    const weekNum = profile?.current_week || 1;
    const dayNum = profile?.current_day || 1;
    const weekTitle = profile?.week_title || "Getting started";
    const pct = Math.round((dayNum / 180) * 100);
    const streak = profile?.streak_days || 0;

    const topSub = document.querySelector("#shell-topbar > div");
    if (topSub && !topSub.querySelector(".sub")) {
      topSub.insertAdjacentHTML("beforeend", `<p class="sub">Day ${dayNum}/180 · Month ${monthNum} · Week ${weekNum}</p>`);
    }

    root.innerHTML = `
      ${renderSubscriptionBanner(profile)}

      <section class="hero">
        <h2>Good to see you, ${esc(ctx.user.name.split(" ")[0])}</h2>
        <p class="muted" style="margin-top:10px;font-weight:700;">Your English Journey</p>
        <p class="muted" style="margin-top:2px;">Day ${dayNum}/180 · Week ${weekNum} · ${esc(weekTitle)}</p>
        <div class="row" style="margin-top:12px;">
          <span class="accent-text" style="font-size:15px;">${pct}%</span>
          <div class="progress-bar on-dark" style="flex:1;"><span style="width:${Math.max(pct, 3)}%;"></span></div>
        </div>
        <div class="row" style="margin-top:16px;gap:10px;flex-wrap:wrap;">
          <a href="/student/lesson.html" class="btn btn-cta" style="flex:1 1 180px;font-size:17px;">Continue Day ${dayNum} ${icon("chevronRight")}</a>
          <span class="pill pill-orange" style="font-size:14px;padding:10px 14px;">${icon("flame")} ${streak} day streak</span>
        </div>
      </section>

      <a href="/student/daily-quiz.html" class="bar-link dark">
        <span>Bonus Quiz - 20 questions bonus</span>${icon("chevronRight")}
      </a>

      <h2 class="sec-title">Quick links</h2>
      <div class="tiles">
        <a href="/student/speaking-lab.html" class="tile"><span class="tile-ico o">${icon("mic")}</span>Speaking Lab</a>
        <a href="/student/vocabulary.html" class="tile"><span class="tile-ico g">${icon("bookmark")}</span>Vocabulary</a>
        <a href="/student/compositions.html" class="tile"><span class="tile-ico g">${icon("file")}</span>Compositions</a>
        <a href="/student/leaderboard.html" class="tile"><span class="tile-ico o">${icon("trophy")}</span>Leaderboard</a>
      </div>
    `;
  } catch (err) {
    root.innerHTML = `<div class="empty-state">Impossible de charger ton tableau de bord. ${esc(err.message)}</div>`;
  }
})();

function renderSubscriptionBanner(profile) {
  if (!profile) return "";
  const status = profile.subscription_status;

  if (status === "active") {
    return `
      <a href="/student/subscribe.html" class="bar-link soft">
        <span class="row" style="gap:12px;"><span style="width:34px;height:34px;border-radius:50%;background:var(--green-2);color:#fff;display:flex;align-items:center;justify-content:center;">${icon("check")}</span>
        <span>Abonnement actif jusqu'au<br/>${formatDate(profile.subscription_expires_at)}</span></span>
        ${icon("chevronRight")}
      </a>`;
  }

  if (status === "trial") {
    const daysLeft = profile.trial_ends_at ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at + "Z") - new Date()) / 86400000)) : 0;
    return `
      <a href="/student/subscribe.html" class="bar-link warn">
        <span>🎁 Essai gratuit — ${daysLeft} jour(s) restant(s)</span>
        <span style="font-size:13px;color:var(--orange);white-space:nowrap;">S'abonner ${icon("chevronRight")}</span>
      </a>`;
  }

  return `
    <a href="/student/subscribe.html" class="bar-link danger">
      <span>🔒 Ton accès a expiré — abonne-toi pour continuer</span>
      ${icon("chevronRight")}
    </a>`;
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str + "Z").toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}
