// frontend/student/lesson.js

let currentTab = "grammar";
let weekData = null;

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "lesson", title: "Current Lesson" });
  if (!ctx) return;

  const root = document.getElementById("lesson-root");

  try {
    const { profile } = await api.get("/students/me/dashboard");
    const weekNum = profile?.current_week || 1;
    const { week, vocabulary, exercises } = await api.get(`/courses/weeks/${weekNum}`);
    weekData = { week, vocabulary, exercises };

    document.querySelector("#shell-topbar div").innerHTML += `<p class="sub">Week ${week.number} · ${week.grammar_title || ""}</p>`;

    renderLesson();
  } catch (err) {
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();

function renderLesson() {
  const { week, vocabulary, exercises } = weekData;
  const root = document.getElementById("lesson-root");
  const tabs = [
    { key: "grammar", label: "Grammar" },
    { key: "vocabulary", label: "Vocabulary" },
    { key: "exercises", label: "Exercises" },
  ];

  root.innerHTML = `
    <div class="card" style="background:var(--primary);color:#fff;">
      <span class="badge" style="background:color-mix(in srgb, var(--accent) 30%, transparent);color:var(--accent);">Week ${week.number}</span>
      <h2 style="color:#fff;font-size:22px;margin-top:10px;">${week.title}</h2>
      <p style="color:rgba(255,255,255,.5);font-size:12.5px;margin-top:4px;">${week.grammar_title || ""}</p>
      <div class="row" style="margin-top:14px;flex-wrap:wrap;gap:6px;">
        ${tabs.map((t) => `
          <button data-tab="${t.key}" class="tab-btn btn btn-sm" style="background:${currentTab === t.key ? "#fff" : "rgba(255,255,255,.1)"};color:${currentTab === t.key ? "var(--primary)" : "rgba(255,255,255,.7)"};">
            ${t.label}
          </button>`).join("")}
      </div>
    </div>
    <div id="tab-content"></div>
  `;

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => { currentTab = btn.dataset.tab; renderLesson(); });
  });

  const tabContent = document.getElementById("tab-content");
  if (currentTab === "grammar") {
    tabContent.innerHTML = `
      <div class="card">${week.grammar_html || "<p>Contenu à venir.</p>"}</div>
      <div class="card" style="margin-top:12px;">
        <p style="font-weight:600;font-size:13.5px;margin-bottom:8px;">🎯 Speaking task for this week</p>
        <p style="font-size:13.5px;color:var(--text-muted);">${week.speaking_task || "—"}</p>
        <a href="/student/speaking-lab.html" class="btn btn-accent btn-sm" style="margin-top:10px;">Practice in Speaking Lab ${icon("arrowRight")}</a>
      </div>
    `;
  } else if (currentTab === "vocabulary") {
    tabContent.innerHTML = `
      <div class="grid grid-2">
        ${vocabulary.length ? vocabulary.map((v) => `
          <div class="card">
            <div class="row-between">
              <span style="font-weight:600;font-size:13.5px;">${v.word}</span>
              <span class="badge badge-muted">${v.word_type || ""}</span>
            </div>
            <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">FR ${v.fr || ""}</p>
            ${v.gb_variant ? `<div class="row" style="margin-top:8px;gap:4px;">
              <span class="badge" style="background:#DCE6FB;color:#3B6FE0;">GB ${v.gb_variant}</span>
              <span class="badge badge-accent">US ${v.us_variant}</span>
            </div>` : ""}
          </div>`).join("") : `<div class="empty-state">Pas encore de vocabulaire pour cette semaine.</div>`}
      </div>
    `;
  } else if (currentTab === "exercises") {
    tabContent.innerHTML = exercises.length ? exercises.map((ex, i) => `
      <div class="card" style="margin-bottom:10px;">
        <p style="font-size:13px;font-weight:600;margin-bottom:10px;">${i + 1}. ${ex.question}</p>
        <div class="stack" style="gap:6px;">
          ${ex.options.map((opt, oi) => `
            <button class="exo-option btn btn-outline" data-exo="${i}" data-idx="${oi}" data-correct="${ex.correct_index}" style="justify-content:flex-start;text-align:left;">
              <span style="color:var(--text-muted);margin-right:6px;">${String.fromCharCode(65 + oi)}.</span>${opt}
            </button>`).join("")}
        </div>
      </div>
    `).join("") : `<div class="empty-state">Pas encore d'exercices pour cette semaine.</div>`;

    document.querySelectorAll(".exo-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const correct = Number(btn.dataset.correct);
        const idx = Number(btn.dataset.idx);
        const group = document.querySelectorAll(`.exo-option[data-exo="${btn.dataset.exo}"]`);
        group.forEach((b) => (b.style.pointerEvents = "none"));
        if (idx === correct) {
          btn.style.background = "var(--success-bg)"; btn.style.borderColor = "var(--success)"; btn.style.color = "var(--success)";
        } else {
          btn.style.background = "var(--danger-bg)"; btn.style.borderColor = "var(--danger)"; btn.style.color = "var(--danger)";
          group[correct].style.background = "var(--success-bg)"; group[correct].style.borderColor = "var(--success)"; group[correct].style.color = "var(--success)";
        }
      });
    });
  }
}
