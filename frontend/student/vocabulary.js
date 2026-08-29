// frontend/student/vocabulary.js

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "vocabulary", title: "Vocabulary" });
  if (!ctx) return;
  const root = document.getElementById("vocab-root");

  try {
    const { profile } = await api.get("/students/me/dashboard");
    const weekNum = profile?.current_week || 1;
    const { week, vocabulary } = await api.get(`/courses/weeks/${weekNum}`);

    document.querySelector("#shell-topbar div").innerHTML += `<p class="sub">Words from Week ${week.number}</p>`;

    root.innerHTML = `
      <div class="row">${icon("search")}<input type="text" id="search-input" placeholder="Search words..." /></div>
      <div class="grid grid-2" id="vocab-grid"></div>
    `;

    const grid = document.getElementById("vocab-grid");
    function draw(filter = "") {
      const filtered = vocabulary.filter((v) => v.word.toLowerCase().includes(filter.toLowerCase()));
      grid.innerHTML = filtered.length ? filtered.map((v) => `
        <div class="card">
          <div class="row-between">
            <div class="row">
              <span style="font-weight:600;font-size:13.5px;">${v.word}</span>
              <span class="badge badge-muted">${v.word_type || ""}</span>
              <button class="speak-word" data-word="${v.word}" style="color:var(--text-muted);">${icon("volume")}</button>
            </div>
          </div>
          <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">FR ${v.fr || ""}</p>
          ${v.gb_variant ? `<div class="row" style="margin-top:8px;gap:4px;">
            <span class="badge" style="background:#DCE6FB;color:#3B6FE0;">GB ${v.gb_variant}</span>
            <span class="badge badge-accent">US ${v.us_variant}</span>
          </div>` : ""}
        </div>`).join("") : `<div class="empty-state">Aucun mot ne correspond.</div>`;

      grid.querySelectorAll(".speak-word").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (!("speechSynthesis" in window)) return;
          const u = new SpeechSynthesisUtterance(btn.dataset.word);
          u.lang = "en-US";
          window.speechSynthesis.speak(u);
        });
      });
    }
    draw();
    document.getElementById("search-input").addEventListener("input", (e) => draw(e.target.value));
  } catch (err) {
    if (handlePaywallError(err)) return;
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();
