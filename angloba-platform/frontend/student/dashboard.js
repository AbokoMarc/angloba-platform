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
