// frontend/student/journey.js

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "journey", title: "My Journey", subtitle: "9-month English programme" });
  if (!ctx) return;

  const root = document.getElementById("journey-root");

  try {
    const [{ months }, { profile }] = await Promise.all([
      api.get("/courses/months"),
      api.get("/students/me/dashboard"),
    ]);

    const currentWeek = profile?.current_week || 1;

    root.innerHTML = months.map((m) => {
      const doneCount = m.weeks.filter((w) => w.number < currentWeek).length;
      return `
      <div class="card">
        <div class="row-between" style="margin-bottom:10px;">
          <div class="row">
            <div style="width:26px;height:26px;border-radius:999px;background:${doneCount === m.weeks.length ? "var(--success-bg)" : "color-mix(in srgb, var(--accent) 20%, white)"};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${doneCount === m.weeks.length ? "var(--success)" : "var(--accent)"};">
              ${doneCount === m.weeks.length ? icon("check") : m.number}
            </div>
            <div>
              <p style="font-size:10px;color:var(--text-muted);font-weight:700;letter-spacing:.05em;">MONTH ${m.number}</p>
              <p style="font-weight:600;">${m.title}</p>
            </div>
          </div>
          <span style="font-size:11px;color:var(--text-muted);">${doneCount}/${m.weeks.length} weeks</span>
        </div>
        <div class="grid grid-2">
          ${m.weeks.map((w) => {
            const isCurrent = w.number === currentWeek;
            const isDone = w.number < currentWeek;
            const isLocked = w.number > currentWeek;
            return `
            <a href="${isCurrent ? "/student/lesson.html" : "#"}" class="card" style="background:${isCurrent ? "color-mix(in srgb, var(--accent) 12%, white)" : "var(--row)"};border:${isCurrent ? "1.5px solid var(--accent)" : "1.5px solid transparent"};display:flex;align-items:center;gap:8px;padding:10px 12px;${isLocked ? "opacity:.6;pointer-events:none;" : ""}">
              ${isDone ? icon("check") : isLocked ? icon("lock") : icon("play")}
              <span style="font-size:12.5px;">Week ${w.number} <span style="color:var(--text-muted);">— ${w.title}</span></span>
            </a>`;
          }).join("")}
        </div>
      </div>`;
    }).join("");
  } catch (err) {
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();
