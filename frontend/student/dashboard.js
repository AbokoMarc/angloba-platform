// frontend/student/dashboard.js

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "dashboard", title: "Dashboard" });
  if (!ctx) return;

  const root = document.getElementById("dashboard-root");

  try {
    const { profile } = await api.get("/students/me/dashboard");
    const monthNum = profile?.current_month || 1;
    const weekNum = profile?.current_week || 1;
    const weekTitle = profile?.week_title || "Getting started";

    document.querySelector(".topbar .sub") ||
      (document.getElementById("shell-topbar").querySelector("div").innerHTML += `<p class="sub">Month ${monthNum} · Week ${weekNum} · ${weekTitle}</p>`);

    root.innerHTML = `
      ${renderSubscriptionBanner(profile)}
      <div class="card" style="background:var(--primary);color:#fff;">
        <p style="color:rgba(255,255,255,.6);font-size:13px;">Good to see you, ${ctx.user.name.split(" ")[0]} 👋</p>
        <h2 style="font-size:22px;color:#fff;margin-top:4px;">Your English Journey</h2>
        <p style="color:rgba(255,255,255,.5);font-size:12.5px;margin-top:4px;">Month ${monthNum} · Week ${weekNum} · ${weekTitle}</p>
        <div class="row" style="margin-top:14px;">
          <div class="progress-bar" style="background:rgba(255,255,255,.15);flex:1;"><span style="width:${profile?.overall_pct || 0}%;"></span></div>
          <span style="font-weight:700;color:var(--accent);font-size:13px;">${profile?.overall_pct || 0}%</span>
        </div>
        <div class="row" style="margin-top:14px;">
          <a href="/student/lesson.html" class="btn btn-accent">Continue Learning ${icon("arrowRight")}</a>
          <span style="font-size:12px;color:rgba(255,255,255,.6);">🔥 ${profile?.streak_days || 0} day streak</span>
        </div>
      </div>

      <a href="/student/daily-quiz.html" class="card row-between" style="background:var(--primary);color:#fff;">
        <div>
          <p style="font-weight:600;font-size:14px;">📝 Quiz du jour</p>
          <p style="font-size:11.5px;color:rgba(255,255,255,.6);">20 questions, difficulté adaptée à ton niveau</p>
        </div>
        ${icon("arrowRight")}
      </a>

      <div class="card">
        <p style="font-weight:600;font-size:14px;margin-bottom:10px;">Quick links</p>
        <div class="grid grid-3">
          <a href="/student/speaking-lab.html" class="card" style="background:var(--row);text-align:center;">
            ${icon("mic")}<p style="font-size:12.5px;font-weight:600;margin-top:6px;">Speaking Lab</p>
          </a>
          <a href="/student/vocabulary.html" class="card" style="background:var(--row);text-align:center;">
            ${icon("bookmark")}<p style="font-size:12.5px;font-weight:600;margin-top:6px;">Vocabulary</p>
          </a>
          <a href="/student/compositions.html" class="card" style="background:var(--row);text-align:center;">
            ${icon("file")}<p style="font-size:12.5px;font-weight:600;margin-top:6px;">Compositions</p>
          </a>
          <a href="/student/leaderboard.html" class="card" style="background:var(--row);text-align:center;">
            🏆<p style="font-size:12.5px;font-weight:600;margin-top:6px;">Leaderboard</p>
          </a>
        </div>
      </div>

      <div class="card">
        <div class="row-between" style="margin-bottom:10px;">
          <p style="font-weight:600;font-size:14px;">This week</p>
          <a href="/student/journey.html" style="font-size:12.5px;color:var(--accent);font-weight:600;">View journey →</a>
        </div>
        <p style="font-size:13px;color:var(--text-muted);">Head to <b>Current Lesson</b> to continue Week ${weekNum}, or try the <b>Speaking Lab</b> to practice this week's conversation live with an AI partner.</p>
      </div>
    `;
  } catch (err) {
    root.innerHTML = `<div class="empty-state">Impossible de charger ton tableau de bord. ${err.message}</div>`;
  }
})();

function renderSubscriptionBanner(profile) {
  if (!profile) return "";
  const status = profile.subscription_status;

  if (status === "active") {
    return `
      <a href="/student/subscribe.html" class="card row-between" style="background:var(--success-bg);color:var(--success);">
        <span style="font-size:12.5px;">✅ Abonnement actif jusqu'au ${formatDate(profile.subscription_expires_at)}</span>
        ${icon("arrowRight")}
      </a>`;
  }

  if (status === "trial") {
    const daysLeft = profile.trial_ends_at ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at + "Z") - new Date()) / 86400000)) : 0;
    return `
      <a href="/student/subscribe.html" class="card row-between" style="background:color-mix(in srgb, var(--accent) 15%, white);color:var(--primary);">
        <span style="font-size:12.5px;">🎁 Essai gratuit — ${daysLeft} jour(s) restant(s)</span>
        <span style="font-size:12px;font-weight:600;color:var(--accent);">S'abonner ${icon("arrowRight")}</span>
      </a>`;
  }

  return `
    <a href="/student/subscribe.html" class="card row-between" style="background:var(--danger-bg);color:var(--danger);">
      <span style="font-size:12.5px;">🔒 Ton accès a expiré — abonne-toi pour continuer</span>
      ${icon("arrowRight")}
    </a>`;
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str + "Z").toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
