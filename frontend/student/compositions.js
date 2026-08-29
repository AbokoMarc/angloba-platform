// frontend/student/compositions.js

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "compositions", title: "Compositions", subtitle: "Submit and review your writing" });
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
      <p style="font-weight:600;font-size:14px;">Previous Compositions</p>
      <div class="stack" id="previous-list"></div>
    `;

    if (next) bindComposeForm(next);

    const list = document.getElementById("previous-list");
    if (!submissions.length) {
      list.innerHTML = `<div class="empty-state">Pas encore de composition soumise.</div>`;
    } else {
      list.innerHTML = submissions.map((s, i) => `
        <div class="card">
          <button class="row-between toggle-sub" data-i="${i}" style="width:100%;">
            <div style="text-align:left;">
              <p style="font-weight:600;font-size:13.5px;">Composition #${s.number} — ${s.title}</p>
              <p style="font-size:11.5px;color:var(--text-muted);">${s.status === "corrected" ? "Corrected" : "Submitted, awaiting correction"}</p>
            </div>
            <div class="row">
              ${s.score != null ? `<span class="badge ${s.score >= 70 ? "badge-success" : "badge-accent"}">${s.score}%</span>` : `<span class="badge badge-muted">Pending</span>`}
            </div>
          </button>
          <div class="sub-detail" data-i="${i}" style="display:none;margin-top:10px;">
            <div class="card" style="background:var(--row);font-size:12.5px;">${escapeHtml(s.body)}</div>
            ${s.teacher_feedback ? `<div class="card" style="background:color-mix(in srgb, var(--accent) 12%, white);font-size:12.5px;margin-top:8px;"><b>🎓 Teacher feedback:</b> ${escapeHtml(s.teacher_feedback)}</div>` : ""}
            ${s.status === "submitted" ? `
              <button class="btn btn-outline btn-sm" data-ai-review="${s.id}" style="margin-top:8px;">✨ Demander une correction IA immédiate</button>
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
              <div class="card" style="margin-top:8px;background:${passed ? "var(--success-bg)" : "color-mix(in srgb, var(--accent) 12%, white)"};font-size:12.5px;">
                <p style="font-weight:600;margin-bottom:4px;">${passed ? `✅ Validée par l'IA (score ${assist.suggestedScore}/100 — minimum ${threshold})` : `Pas encore assez (score IA indicatif : ${assist.suggestedScore}/100, minimum ${threshold}) — en attente du professeur ou d'une nouvelle tentative.`}</p>
                <p><b>Points forts :</b> ${escapeHtml(assist.strengths)}</p>
                <p style="margin-top:4px;"><b>À améliorer :</b> ${escapeHtml(assist.improvements)}</p>
              </div>
            `;
            if (passed) btn.remove(); else { btn.disabled = false; btn.textContent = "✨ Redemander une correction IA"; }
          } catch (err) {
            resultBox.innerHTML = `<p style="color:var(--danger);font-size:12px;margin-top:8px;">${err.message}</p>`;
            btn.disabled = false;
            btn.textContent = "✨ Demander une correction IA immédiate";
          }
        });
      });
    }
  } catch (err) {
    if (handlePaywallError(err)) return;
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();

function renderNextComposition(c) {
  return `
    <div class="card" style="border:1.5px solid var(--accent);">
      <span class="badge badge-accent">DUE</span>
      <p style="font-weight:700;font-size:15px;margin-top:8px;">Composition #${c.number} — ${c.title}</p>
      <p style="font-size:11.5px;color:var(--text-muted);margin-bottom:10px;">Minimum ${c.min_words} words</p>
      <div class="card" style="background:var(--row);font-size:12.5px;margin-bottom:10px;"><b>Instructions:</b> ${c.prompt}</div>
      <textarea id="comp-text" placeholder="Start writing your composition here..." style="min-height:160px;"></textarea>
      <div class="row-between" style="margin-top:8px;">
        <span id="word-count" style="font-size:12px;color:var(--text-muted);">0 / ${c.min_words} words</span>
        <div class="row">
          <button class="btn btn-outline btn-sm" id="save-draft">Save draft</button>
          <button class="btn btn-primary btn-sm" id="submit-comp">Submit composition</button>
        </div>
      </div>
    </div>
  `;
}

function bindComposeForm(composition) {
  const textarea = document.getElementById("comp-text");
  const wordCount = document.getElementById("word-count");
  textarea.addEventListener("input", () => {
    const n = textarea.value.trim() ? textarea.value.trim().split(/\s+/).length : 0;
    wordCount.textContent = `${n} / ${composition.min_words} words`;
  });

  document.getElementById("save-draft").addEventListener("click", async () => {
    await api.post(`/compositions/${composition.id}/submit`, { text: textarea.value, submit: false });
    wordCount.textContent += " · saved";
  });

  document.getElementById("submit-comp").addEventListener("click", async (e) => {
    e.target.disabled = true;
    e.target.textContent = "Submitting...";
    await api.post(`/compositions/${composition.id}/submit`, { text: textarea.value, submit: true });
    window.location.reload();
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
