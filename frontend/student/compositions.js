// frontend/student/compositions.js

const STARTERS = ["My name is...", "I live in...", "I work as...", "My family has...", "In my free time I like..."];

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "compositions", title: "Compositions" });
  if (!ctx) return;
  const root = document.getElementById("comp-root");

  try {
    const [{ compositions }, { submissions }] = await Promise.all([
      api.get("/compositions"),
      api.get("/compositions/me"),
    ]);

    const submittedIds = new Set(submissions.map((s) => s.composition_id));
    const next = compositions.find((c) => !submittedIds.has(c.id));

    root.innerHTML = `
      ${next ? renderNextComposition(next) : `<div class="card empty-state">🎉 Toutes les compositions disponibles ont été soumises !</div>`}
      <h2 class="sec-title">Previous Compositions</h2>
      <div class="stack" id="previous-list"></div>
    `;

    if (next) bindComposeForm(next);

    const list = document.getElementById("previous-list");
    if (!submissions.length) {
      list.innerHTML = `<div class="dash-empty"><p style="font-size:34px;">📝</p><b>No previous compositions yet</b>Your finished compositions will appear here for review.</div>`;
    } else {
      list.innerHTML = submissions.map((s, i) => `
        <div class="card">
          <button class="row-between toggle-sub" data-i="${i}" style="width:100%;">
            <div style="text-align:left;">
              <p style="font-weight:800;font-size:16px;color:var(--brand);">Composition #${s.number} — ${esc(s.title)}</p>
              <p style="font-size:13px;color:var(--text-muted);font-weight:600;">${s.status === "corrected" ? "Corrected" : "Submitted, awaiting correction"}</p>
            </div>
            <div class="row">
              ${s.score != null ? `<span class="badge ${s.score >= 70 ? "badge-success" : "badge-accent"}">${s.score}%</span>` : `<span class="badge badge-muted">Pending</span>`}
            </div>
          </button>
          <div class="sub-detail" data-i="${i}" style="display:none;margin-top:12px;">
            <div class="example" style="font-style:normal;">${esc(s.body)}</div>
            ${s.teacher_feedback ? `<div class="tip-banner" style="margin-top:10px;font-weight:600;">${icon("edit")}<span><b>Teacher feedback:</b> ${esc(s.teacher_feedback)}</span></div>` : ""}
            ${s.status === "submitted" ? `
              <button class="btn btn-outline btn-sm" data-ai-review="${s.id}" style="margin-top:10px;">${icon("sparkle")} Demander une correction IA immédiate</button>
              <div id="ai-review-result-${s.id}"></div>
            ` : ""}
          </div>
        </div>
      `).join("");

      list.querySelectorAll(".toggle-sub").forEach((btn) => {
        btn.addEventListener("click", () => {
          const detail = list.querySelector(`.sub-detail[data-i="${btn.dataset.i}"]`);
          detail.style.display = detail.style.display === "none" ? "block" : "none";
        });
      });

      list.querySelectorAll("[data-ai-review]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const subId = btn.dataset.aiReview;
          btn.disabled = true;
          btn.innerHTML = `<span class="spinner"></span> Analyse en cours...`;
          const resultBox = document.getElementById(`ai-review-result-${subId}`);
          try {
            const { passed, threshold, assist } = await api.post(`/compositions/submissions/${subId}/ai-review`, {});
            resultBox.innerHTML = `
              <div class="card flat" style="margin-top:10px;background:${passed ? "var(--green-soft)" : "var(--orange-soft)"};font-size:14px;">
                <p style="font-weight:800;margin-bottom:6px;">${passed ? `✅ Validée par l'IA (score ${assist.suggestedScore}/100 — minimum ${threshold})` : `Pas encore assez (score IA indicatif : ${assist.suggestedScore}/100, minimum ${threshold}) — en attente du professeur ou d'une nouvelle tentative.`}</p>
                <p><b>Points forts :</b> ${escapeHtml(assist.strengths)}</p>
                <p style="margin-top:4px;"><b>À améliorer :</b> ${escapeHtml(assist.improvements)}</p>
              </div>
            `;
            if (passed) btn.remove(); else { btn.disabled = false; btn.innerHTML = `${icon("sparkle")} Redemander une correction IA`; }
          } catch (err) {
            resultBox.innerHTML = `<p style="color:var(--danger);font-size:13px;margin-top:8px;">${escapeHtml(err.message)}</p>`;
            btn.disabled = false;
            btn.innerHTML = `${icon("sparkle")} Demander une correction IA immédiate`;
          }
        });
      });
    }
  } catch (err) {
    if (handlePaywallError(err)) return;
    root.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
  }
})();

function renderNextComposition(c) {
  return `
    <div class="comp-head">
      <div class="row" style="gap:10px;flex-wrap:wrap;">
        <h2>Composition #${c.number} — ${esc(c.title)}</h2>
        <span class="pill" style="background:var(--orange);color:#fff;">${icon("clock")} DUE</span>
      </div>
    </div>
    <div class="instr"><b>Instruction</b>${esc(c.prompt)}</div>

    <div class="card">
      <h3 style="font-size:19px;font-weight:800;color:var(--brand);margin-bottom:10px;">Your composition</h3>
      <div class="chips scroll" style="margin-bottom:10px;">
        ${STARTERS.map((t) => `<button type="button" class="chip starter" data-text="${esc(t)}">${icon("plus")} ${esc(t)}</button>`).join("")}
      </div>
      <textarea id="comp-text" class="comp-ta" placeholder="Start writing about yourself here..."></textarea>
      <div class="wc" style="margin-top:12px;"><span id="word-count">0/${c.min_words} words</span><div class="progress-bar"><span id="word-bar" style="width:0%;"></span></div><span id="word-pct">0%</span></div>
      <p id="save-note" style="font-size:12.5px;color:#14663F;font-weight:700;min-height:18px;margin-top:6px;"></p>
    </div>

    <div class="card tips">
      <h3 style="font-size:18px;font-weight:800;color:var(--brand);">${icon("bulb")} Tips</h3>
      <ul>
        <li>${icon("check")} Write 2–3 sentences for each prompt</li>
        <li>${icon("check")} Use simple words to describe your routine</li>
        <li>${icon("check")} You can edit before submitting</li>
      </ul>
      <p style="font-weight:800;color:var(--brand);margin:14px 0 8px;">Example</p>
      <div class="example">My name is Alex. I live in Spain. I work as a designer. My family has four people. In my free time I like painting and hiking.</div>
    </div>

    <div class="nav-row sticky-cta">
      <button class="btn btn-primary" id="save-draft">${icon("file")} Save draft</button>
      <button class="btn btn-cta" id="submit-comp">${icon("send")} Submit</button>
    </div>
  `;
}

function bindComposeForm(composition) {
  const textarea = document.getElementById("comp-text");
  const wordCount = document.getElementById("word-count");
  const bar = document.getElementById("word-bar");
  const pctEl = document.getElementById("word-pct");
  const note = document.getElementById("save-note");

  function update() {
    const n = textarea.value.trim() ? textarea.value.trim().split(/\s+/).length : 0;
    const pct = Math.min(100, Math.round((n / composition.min_words) * 100));
    wordCount.textContent = `${n}/${composition.min_words} words`;
    bar.style.width = `${pct}%`;
    pctEl.textContent = `${pct}%`;
  }
  textarea.addEventListener("input", update);

  document.querySelectorAll(".starter").forEach((chip) => chip.addEventListener("click", () => {
    const sep = textarea.value && !/\s$/.test(textarea.value) ? " " : "";
    textarea.value += sep + chip.dataset.text.replace("...", " ");
    textarea.focus();
    update();
  }));

  document.getElementById("save-draft").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      await api.post(`/compositions/${composition.id}/submit`, { text: textarea.value, submit: false });
      note.textContent = "✓ Draft saved";
    } catch (err) { note.style.color = "var(--danger)"; note.textContent = err.message; }
    btn.disabled = false;
  });

  document.getElementById("submit-comp").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Submitting...`;
    try {
      await api.post(`/compositions/${composition.id}/submit`, { text: textarea.value, submit: true });
      window.location.reload();
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = `${icon("send")} Submit`;
      note.style.color = "var(--danger)";
      note.textContent = err.message;
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}
