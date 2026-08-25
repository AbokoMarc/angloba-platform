// frontend/student/progress.js

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "progress", title: "My Progress", subtitle: "Detailed skills tracking" });
  if (!ctx) return;
  const root = document.getElementById("progress-root");

  try {
    const [{ profile }, { sessions }] = await Promise.all([
      api.get("/students/me/dashboard"),
      api.get("/speaking/history"),
    ]);

    const avgScores = averageScores(sessions);

    root.innerHTML = `
      <div class="grid grid-4">
        <div class="card"><p style="font-size:11px;color:var(--text-muted);">Overall</p><p style="font-size:20px;font-weight:700;color:var(--primary);">${profile?.overall_pct || 0}%</p></div>
        <div class="card"><p style="font-size:11px;color:var(--text-muted);">Streak</p><p style="font-size:20px;font-weight:700;color:var(--primary);">${profile?.streak_days || 0}d</p></div>
        <div class="card"><p style="font-size:11px;color:var(--text-muted);">Speaking sessions</p><p style="font-size:20px;font-weight:700;color:var(--primary);">${sessions.length}</p></div>
        <div class="card"><p style="font-size:11px;color:var(--text-muted);">Current week</p><p style="font-size:20px;font-weight:700;color:var(--primary);">W${profile?.current_week || 1}</p></div>
      </div>

      ${sessions.length ? `
      <div class="card">
        <p style="font-weight:600;font-size:14px;margin-bottom:12px;">Speaking Lab — average scores</p>
        ${["pronunciation", "fluency", "grammar", "vocabulary"].map((k) => `
          <div style="margin-bottom:10px;">
            <div class="row-between" style="font-size:12px;margin-bottom:4px;"><span>${k}</span><span style="font-weight:600;color:var(--accent);">${avgScores[k]}%</span></div>
            <div class="progress-bar"><span style="width:${avgScores[k]}%;"></span></div>
          </div>`).join("")}
      </div>

      <div class="card">
        <p style="font-weight:600;font-size:14px;margin-bottom:10px;">Recent Speaking sessions</p>
        <div class="stack" style="gap:8px;">
          ${sessions.slice(0, 8).map((s) => `
            <div class="row-between">
              <span style="font-size:13px;">${s.emoji} ${s.title}</span>
              <span class="badge ${s.scores.overall >= 70 ? "badge-success" : "badge-accent"}">${s.scores.overall}%</span>
            </div>`).join("")}
        </div>
      </div>` : `<div class="card empty-state">Fais ta première session dans le Speaking Lab pour voir ta progression ici.</div>`}
    `;
  } catch (err) {
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();

function averageScores(sessions) {
  const keys = ["pronunciation", "fluency", "grammar", "vocabulary"];
  const result = {};
  for (const k of keys) {
    const vals = sessions.map((s) => s.scores?.[k]).filter((v) => typeof v === "number");
    result[k] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }
  return result;
}
