// frontend/student/progress.js

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "progress", title: "My Progress" });
  if (!ctx) return;
  const root = document.getElementById("progress-root");

  try {
    const [{ profile }, { sessions }] = await Promise.all([
      api.get("/students/me/dashboard"),
      api.get("/speaking/history"),
    ]);

    const overall = profile?.overall_pct || 0;
    const streak = profile?.streak_days || 0;
    const avg = averageScores(sessions);
    const week = weeklyActivity(sessions);
    const maxCount = Math.max(1, ...week.map((d) => d.count));
    const totalWeek = week.reduce((a, d) => a + d.count, 0);
    const nextGoal = Math.min(100, (Math.floor(overall / 10) + 1) * 10 + (overall % 10 === 0 ? 0 : 0));
    const R = 30, C = 2 * Math.PI * R;

    const skills = [["pronunciation", "Pronunciation", "mic"], ["fluency", "Fluency", "bolt"], ["grammar", "Grammar", "check"], ["vocabulary", "Vocabulary", "book"]];

    root.innerHTML = `
      <div class="stat-grid">
        <div class="card stat">
          <div class="ring"><svg viewBox="0 0 74 74"><circle cx="37" cy="37" r="${R}" fill="none" stroke="#F3E3CC" stroke-width="9"/><circle cx="37" cy="37" r="${R}" fill="none" stroke="var(--orange-2)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - Math.max(overall, 2) / 100)}"/></svg><span>${overall}%</span></div>
          <div><p class="lbl">Overall</p><p class="cap">${esc(studentLevel(profile))} · Keep going!</p></div>
        </div>
        <div class="card stat"><span class="s-ico">${icon("flame")}</span><div><p class="lbl">Streak</p><p class="big">${streak} day${streak === 1 ? "" : "s"}</p><p class="cap">Daily login streak</p></div></div>
        <div class="card stat"><span class="s-ico">${icon("chat")}</span><div><p class="lbl">Speaking sessions</p><p class="big">${sessions.length}</p><p class="cap">Practice sessions completed</p></div></div>
        <div class="card stat"><span class="s-ico">${icon("calendar")}</span><div><p class="lbl">Current week</p><p class="big">W${profile?.current_week || 1}</p><p class="cap">Week ${profile?.current_week || 1} of course</p></div></div>
      </div>

      <div class="card">
        <h3 style="font-size:18px;font-weight:800;color:var(--brand);margin-bottom:4px;">${icon("graduation")} Speaking Lab — Average Scores</h3>
        ${skills.map(([k, label, ic]) => {
          const v = avg[k];
          return `<div class="skill"><span class="s-ico">${icon(ic)}</span><span>${label}</span>
            <div class="progress-bar"><span style="width:${v === null ? 6 : Math.max(v, 6)}%;"></span></div>
            ${v === null ? `<span class="pv first">First try 🌱</span>` : `<span class="pv">${v}%</span>`}</div>`;
        }).join("")}
      </div>

      <div class="card">
        <h3 style="font-size:18px;font-weight:800;color:var(--brand);margin-bottom:10px;">${icon("clock")} Recent Speaking Sessions</h3>
        ${sessions.length ? `<div class="stack" style="gap:10px;">
          ${sessions.slice(0, 5).map((s) => `
            <div class="row-between">
              <span class="row" style="gap:12px;"><span class="avatar-emoji sm" style="border:0;">${esc(s.emoji)}</span>
                <span><b style="color:var(--brand);">${esc(s.title)}</b><br/><span style="font-size:12.5px;color:var(--text-muted);font-weight:600;">${formatShort(s.created_at)}</span></span></span>
              <span class="badge ${s.scores.overall >= 70 ? "badge-success" : "badge-accent"}">${s.scores.overall}%</span>
            </div>`).join("")}
        </div>` : `
        <div class="dash-empty"><p style="font-size:30px;">🎙️</p><b>No session yet</b>Start with a short conversation — it only takes 3 minutes.
          <p style="margin-top:12px;"><a href="/student/speaking-lab.html" class="btn btn-cta btn-sm">Try again ${icon("replay")}</a></p></div>`}
      </div>

      <div class="card">
        <div class="row-between"><h3 style="font-size:18px;font-weight:800;color:var(--brand);">${icon("chart")} Weekly Activity</h3>
          <span class="pill pill-orange">${totalWeek} session${totalWeek === 1 ? "" : "s"} this week</span></div>
        <div class="week-chart">
          ${week.map((d) => `<div class="col"><div class="bar ${d.count === maxCount && d.count > 0 ? "hi" : ""}" style="height:${d.count ? 14 + (d.count / maxCount) * 70 : 6}px;"></div>${d.label}</div>`).join("")}
        </div>
      </div>

      <div class="tip-banner">${icon("sparkle")}<span>${overall >= 100 ? "Incredible — you finished the programme! 🏆" : `You're on your way! Keep going to reach ${nextGoal === overall ? nextGoal + 10 : nextGoal}% overall 🔥`}</span></div>
    `;
  } catch (err) {
    root.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
  }
})();

function averageScores(sessions) {
  const keys = ["pronunciation", "fluency", "grammar", "vocabulary"];
  const result = {};
  for (const k of keys) {
    const vals = sessions.map((s) => s.scores?.[k]).filter((v) => typeof v === "number");
    result[k] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  }
  return result;
}

// Sessions Speaking des 7 derniers jours (Lun..Dim de la semaine en cours)
function weeklyActivity(sessions) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const days = labels.map((label) => ({ label, count: 0 }));
  for (const s of sessions) {
    const d = new Date((s.created_at || "").replace(" ", "T") + "Z");
    if (isNaN(d) || d < monday) continue;
    const idx = (d.getDay() + 6) % 7;
    days[idx].count += 1;
  }
  return days;
}

function formatShort(str) {
  const d = new Date((str || "").replace(" ", "T") + "Z");
  return isNaN(d) ? "" : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
