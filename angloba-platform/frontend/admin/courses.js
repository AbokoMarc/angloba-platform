// frontend/admin/courses.js

let monthsTree = [];
let selectedWeekNumber = 15;

(async () => {
  const ctx = await renderShell({ roles: ["admin", "superadmin"], activeKey: "courses", title: "Courses", subtitle: "Course Builder — edit the 9-month programme" });
  if (!ctx) return;

  try {
    const { months } = await api.get("/courses/months");
    monthsTree = months;
    renderPicker();
    loadWeek(selectedWeekNumber);
  } catch (err) {
    document.getElementById("week-picker").innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();

function renderPicker() {
  const picker = document.getElementById("week-picker");
  picker.innerHTML = monthsTree.map((m) => `
    <div style="margin-bottom:10px;">
      <p style="font-size:10.5px;font-weight:700;color:var(--text-muted);padding:4px 6px;">MONTH ${m.number} — ${m.title}</p>
      ${m.weeks.map((w) => `
        <button class="week-pick-btn" data-w="${w.number}" style="width:100%;text-align:left;padding:7px 10px;border-radius:8px;font-size:12.5px;background:${w.number === selectedWeekNumber ? "var(--primary)" : "transparent"};color:${w.number === selectedWeekNumber ? "#fff" : "var(--text)"};">
          W${w.number} — ${w.title}
        </button>`).join("")}
    </div>`).join("");

  picker.querySelectorAll(".week-pick-btn").forEach((btn) => {
    btn.addEventListener("click", () => { selectedWeekNumber = Number(btn.dataset.w); renderPicker(); loadWeek(selectedWeekNumber); });
  });
}

async function loadWeek(number) {
  const editor = document.getElementById("week-editor");
  editor.innerHTML = `<div class="empty-state"><span class="spinner"></span></div>`;
  try {
    const { week, vocabulary, exercises } = await api.get(`/courses/weeks/${number}`);
    renderEditor(week, vocabulary, exercises);
  } catch (err) {
    editor.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
}

function renderEditor(week, vocabulary, exercises) {
  const editor = document.getElementById("week-editor");
  editor.innerHTML = `
    <div class="card">
      <p style="font-weight:600;font-size:14px;margin-bottom:10px;">Week ${week.number} — Grammar & content</p>
      <div class="field"><label>Title</label><input type="text" id="w-title" value="${escapeAttr(week.title)}" /></div>
      <div class="field"><label>Grammar title</label><input type="text" id="w-grammar-title" value="${escapeAttr(week.grammar_title || "")}" /></div>
      <div class="field"><label>Speaking task</label><input type="text" id="w-speaking-task" value="${escapeAttr(week.speaking_task || "")}" /></div>
      <div class="field"><label>Grammar content (HTML)</label><textarea id="w-grammar-html" style="min-height:160px;">${escapeHtml(week.grammar_html || "")}</textarea></div>
      <button class="btn btn-primary btn-sm" id="save-week-btn">Save changes</button>
      <span id="save-status" style="font-size:12px;margin-left:8px;"></span>
    </div>

    <div class="card">
      <p style="font-weight:600;font-size:14px;margin-bottom:10px;">Vocabulary (${vocabulary.length})</p>
      <div class="stack" style="gap:6px;margin-bottom:12px;">
        ${vocabulary.map((v) => `<div class="row-between" style="font-size:12.5px;padding:6px 0;border-top:1px solid var(--border);"><span>${v.word} <span style="color:var(--text-muted);">(${v.fr || ""})</span></span>${v.gb_variant ? `<span class="badge badge-accent">GB/US</span>` : ""}</div>`).join("") || `<p class="empty-state">Aucun mot pour l'instant.</p>`}
      </div>
      <div class="grid grid-2">
        <input type="text" id="v-word" placeholder="Word" />
        <input type="text" id="v-fr" placeholder="French translation" />
        <input type="text" id="v-gb" placeholder="GB variant (optional)" />
        <input type="text" id="v-us" placeholder="US variant (optional)" />
      </div>
      <button class="btn btn-outline btn-sm" id="add-vocab-btn" style="margin-top:8px;">${icon("plus")} Add word</button>
    </div>

    <div class="card">
      <p style="font-weight:600;font-size:14px;margin-bottom:10px;">Exercises (${exercises.length})</p>
      <div class="stack" style="gap:6px;margin-bottom:12px;">
        ${exercises.map((e) => `<p style="font-size:12.5px;padding:6px 0;border-top:1px solid var(--border);">${e.question}</p>`).join("") || `<p class="empty-state">Aucun exercice pour l'instant.</p>`}
      </div>
      <div class="field"><label>Question</label><input type="text" id="e-question" placeholder="She ___ to the doctor yesterday." /></div>
      <div class="field"><label>Options (une par ligne, la première n'est pas forcément la bonne)</label><textarea id="e-options" placeholder="should go\nshould went\nwent\nshould to go" style="min-height:80px;"></textarea></div>
      <div class="field"><label>Index de la bonne réponse (0 = première ligne)</label><input type="number" id="e-correct" value="0" min="0" style="width:80px;" /></div>
      <button class="btn btn-outline btn-sm" id="add-exo-btn">${icon("plus")} Add exercise</button>
    </div>
  `;

  document.getElementById("save-week-btn").addEventListener("click", async () => {
    const status = document.getElementById("save-status");
    status.textContent = "Saving...";
    try {
      await api.put(`/courses/weeks/${week.number}`, {
        title: document.getElementById("w-title").value,
        grammarTitle: document.getElementById("w-grammar-title").value,
        speakingTask: document.getElementById("w-speaking-task").value,
        grammarHtml: document.getElementById("w-grammar-html").value,
      });
      status.textContent = "✅ Saved";
      renderPicker();
    } catch (err) {
      status.textContent = `⚠️ ${err.message}`;
    }
  });

  document.getElementById("add-vocab-btn").addEventListener("click", async () => {
    const word = document.getElementById("v-word").value.trim();
    const fr = document.getElementById("v-fr").value.trim();
    if (!word) return;
    await api.post(`/courses/weeks/${week.number}/vocabulary`, {
      word, fr,
      gbVariant: document.getElementById("v-gb").value.trim() || undefined,
      usVariant: document.getElementById("v-us").value.trim() || undefined,
    });
    loadWeek(week.number);
  });

  document.getElementById("add-exo-btn").addEventListener("click", async () => {
    const question = document.getElementById("e-question").value.trim();
    const options = document.getElementById("e-options").value.split("\n").map((s) => s.trim()).filter(Boolean);
    const correctIndex = Number(document.getElementById("e-correct").value);
    if (!question || options.length < 2) return alert("Ajoute une question et au moins 2 options.");
    await api.post(`/courses/weeks/${week.number}/exercises`, { question, options, correctIndex });
    loadWeek(week.number);
  });
}

function escapeAttr(str) { return String(str).replace(/"/g, "&quot;"); }
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
