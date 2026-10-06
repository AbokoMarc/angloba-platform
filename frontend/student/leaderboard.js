// frontend/student/leaderboard.js

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "leaderboard", title: "Leaderboard" });
  if (!ctx) return;

  const root = document.getElementById("leaderboard-root");
  try {
    const { enabled, entries, meId } = await api.get("/students/leaderboard");

    if (!enabled) {
      root.innerHTML = `<div class="card empty-state">Le classement a été désactivé par l'administration.</div>`;
      return;
    }

    root.innerHTML = `
      <div class="stack" style="gap:8px;">
        ${entries.map((e, i) => `
          <div class="card row-between" style="${e.id === meId ? `border:2px solid var(--orange-2);background:var(--orange-soft);` : ""}">
            <div class="row" style="gap:12px;">
              <span style="font-weight:800;font-size:16px;width:28px;text-align:center;color:${i === 0 ? "#D4A017" : i === 1 ? "#999" : i === 2 ? "#CD7F32" : "var(--text-muted)"};">${i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}</span>
              <div>
                <p style="font-weight:800;font-size:16px;color:var(--brand);">${esc(e.name)}${e.id === meId ? " (toi)" : ""}</p>
                <p style="font-size:12.5px;font-weight:600;color:var(--text-muted);">Semaine ${e.current_week} · 🔥 ${e.streak_days}j</p>
              </div>
            </div>
            <span class="badge badge-accent">${e.overall_pct}%</span>
          </div>`).join("")}
      </div>
      ${!entries.some((e) => e.id === meId) ? `<p class="empty-state">Fais ta première activité pour apparaître dans le classement !</p>` : ""}
    `;
  } catch (err) {
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();
