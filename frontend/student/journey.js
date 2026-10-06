// frontend/student/journey.js

const DAY_TYPE_LABELS = { 1: "Grammar", 2: "Vocabulary", 3: "Exercises", 4: "Practice", 5: "Review" };

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "journey", title: "My Journey" });
  if (!ctx) return;

  const root = document.getElementById("journey-root");

  try {
    const [{ months }, { profile }] = await Promise.all([
      api.get("/courses/months"),
      api.get("/students/me/dashboard"),
    ]);

    const currentDay = profile?.current_day || 1;
    const streak = profile?.streak_days || 0;
    const pct = Math.round((currentDay / 180) * 100);
    const currentMonthNum = profile?.current_month || 1;

    const header = `
      <div class="card">
        <span class="pill pill-orange">9-Month Programme</span>
        <div class="row-between" style="margin:12px 0 8px;">
          <p style="font-weight:800;font-size:19px;color:var(--brand);">Overall Progress</p>
          <p style="font-weight:800;font-size:15px;color:var(--brand);">Day ${currentDay}/180 · ${pct}%</p>
        </div>
        <div class="progress-bar"><span style="width:${Math.max(pct, 2)}%;"></span></div>
        <p style="font-size:13px;color:var(--text-muted);font-weight:600;margin-top:10px;">
          ${streak > 0 ? `You are on track! Keep the streak going <span style="color:var(--orange);">${icon("flame")}</span> ${streak} day streak` : "Start today and build your streak!"}
        </p>
      </div>`;

    const monthsHtml = months.map((m) => {
      const weeks = m.weeks.map((w) => ({ ...w, days: [1, 2, 3, 4, 5].map((t) => (w.number - 1) * 5 + t) }));
      const isCurrentMonth = m.number === currentMonthNum || weeks.some((w) => w.days.includes(currentDay));
      const monthDone = weeks.every((w) => w.days[4] < currentDay);

      const weeksHtml = weeks.map((w) => {
        const doneCount = w.days.filter((d) => d < currentDay).length;
        const hasCurrent = w.days.includes(currentDay);
        const allLocked = w.days[0] > currentDay;
        const status = doneCount === 5 ? `<span class="st done">Completed · 5/5</span>`
          : hasCurrent ? `<span class="st now">In Progress · ${doneCount + 1}/5</span>`
          : `<span class="st lock">${icon("lock")} Locked</span>`;
        const headIcon = doneCount === 5
          ? `<span style="color:var(--green-2);display:flex;">${icon("check")}</span>`
          : hasCurrent ? `<span style="color:var(--orange-2);display:flex;">${icon("bolt")}</span>`
          : `<span style="color:#9A927F;display:flex;">${icon("lock")}</span>`;

        const wkHead = `<div class="tl-week">${headIcon}<span style="min-width:0;">Week ${w.number} · ${esc(w.title)}</span>${status}</div>`;
        const open = doneCount !== 5;
        return `
          <details class="wk" ${open ? "open" : ""}><summary style="list-style:none;cursor:pointer;">${wkHead}</summary>
          <div class="tl ${allLocked ? "locked" : ""}">
            ${w.days.map((dayNum, idx) => {
              const t = idx + 1;
              const cur = dayNum === currentDay;
              const done = dayNum < currentDay;
              const locked = dayNum > currentDay;
              const cls = cur ? "current" : done ? (t === 5 ? "done star" : "done") : "locked";
              const dot = cur ? icon("edit") : done ? (t === 5 ? icon("star") : icon("check")) : icon("lock");
              const tag = cur ? "Current · Now" : done ? (t === 5 ? "Completed · Star" : "Completed") : "Locked";
              const inner = `
                <span class="dot">${dot}</span>
                <span>Day ${dayNum} · ${DAY_TYPE_LABELS[t]}</span>
                <span class="tag">${tag}</span>`;
              return cur
                ? `<a href="/student/lesson.html" class="tl-day ${cls}">${inner}</a>`
                : `<div class="tl-day ${cls}">${inner}</div>`;
            }).join("")}
          </div></details>`;
      }).join("");

      return `
        <details class="card month" ${isCurrentMonth ? "open" : ""}>
          <summary>
            <span class="row" style="gap:10px;">
              <span class="month-chip" style="margin:0;font-size:15px;padding:7px 14px;">${monthDone ? icon("check") : icon("book")} Month ${m.number} · ${esc(m.title)}</span>
            </span>
            <span class="chev">${icon("chevronRight")}</span>
          </summary>
          ${weeksHtml}
        </details>`;
    }).join("");

    root.innerHTML = header + monthsHtml;

    // Amene directement le jour courant dans la vue
    document.querySelector(".tl-day.current")?.scrollIntoView({ block: "center" });
  } catch (err) {
    root.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
  }
})();
