// frontend/student/journey.js

const DAY_TYPE_LABELS = { 1: "Grammar", 2: "Vocabulary", 3: "Exercises", 4: "Practice", 5: "Review" };

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "journey", title: "My Journey", subtitle: "9-month English programme" });
  if (!ctx) return;

  const root = document.getElementById("journey-root");

  try {
    const [{ months }, { profile }] = await Promise.all([
      api.get("/courses/months"),
      api.get("/students/me/dashboard"),
    ]);

    const currentDay = profile?.current_day || 1;

    root.innerHTML = `
      <div class="card">
        <div class="row-between" style="margin-bottom:4px;">
          <p style="font-weight:600;font-size:13.5px;">Overall Progress</p>
          <span style="font-size:12px;color:var(--accent);font-weight:600;">Day ${currentDay} / 180</span>
        </div>
        <div class="progress-bar"><span style="width:${(currentDay / 180) * 100}%;"></span></div>
      </div>
    ` + months.map((m) => {
      const weeksWithDays = m.weeks.map((w) => ({ ...w, days: [1, 2, 3, 4, 5].map((t) => (w.number - 1) * 5 + t) }));
      const monthDone = weeksWithDays.every((w) => w.days[4] < currentDay);
      return `
      <div class="card">
        <div class="row-between" style="margin-bottom:10px;">
          <div class="row">
            <div style="width:26px;height:26px;border-radius:999px;background:${monthDone ? "var(--success-bg)" : "color-mix(in srgb, var(--accent) 20%, white)"};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${monthDone ? "var(--success)" : "var(--accent)"};">
              ${monthDone ? icon("check") : m.number}
            </div>
            <div>
              <p style="font-size:10px;color:var(--text-muted);font-weight:700;letter-spacing:.05em;">MONTH ${m.number}</p>
              <p style="font-weight:600;">${m.title}</p>
            </div>
          </div>
        </div>
        ${weeksWithDays.map((w) => `
          <div style="margin-bottom:10px;">
            <p style="font-size:11.5px;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Week ${w.number} — ${w.title}</p>
            <div class="grid grid-3" style="gap:6px;">
              ${w.days.map((dayNum, idx) => {
                const dayType = idx + 1;
                const isCurrent = dayNum === currentDay;
                const isDone = dayNum < currentDay;
                const isLocked = dayNum > currentDay;
                return `
                <a href="${isCurrent ? "/student/lesson.html" : "#"}" class="card" style="padding:8px;text-align:center;background:${isCurrent ? "color-mix(in srgb, var(--accent) 12%, white)" : "var(--row)"};border:${isCurrent ? "1.5px solid var(--accent)" : "1.5px solid transparent"};${isLocked ? "opacity:.5;pointer-events:none;" : ""}">
                  <div style="display:flex;justify-content:center;margin-bottom:2px;">${isDone ? icon("check") : isLocked ? icon("lock") : icon("play")}</div>
                  <span style="font-size:10px;">Day ${dayNum}<br/><span style="color:var(--text-muted);">${DAY_TYPE_LABELS[dayType]}</span></span>
                </a>`;
              }).join("")}
            </div>
          </div>
        `).join("")}
      </div>`;
    }).join("");
  } catch (err) {
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();
