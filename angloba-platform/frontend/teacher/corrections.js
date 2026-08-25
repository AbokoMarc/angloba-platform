// frontend/teacher/corrections.js

let pendingList = [];
let selectedId = null;

(async () => {
  const ctx = await renderShell({ roles: ["teacher", "superadmin"], activeKey: "corrections", title: "Corrections", subtitle: "Pending compositions to correct" });
  if (!ctx) return;

  try {
    const { pending } = await api.get("/compositions/pending");
    pendingList = pending;
    if (pending.length) selectedId = pending[0].id;
    render();
  } catch (err) {
    document.getElementById("corrections-root").innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();

function render() {
  const root = document.getElementById("corrections-root");
  if (!pendingList.length) {
    root.innerHTML = `<div class="card empty-state">Aucune copie en attente de correction. 🎉</div>`;
    return;
  }
  const selected = pendingList.find((p) => p.id === selectedId);

  root.innerHTML = `
    <div style="display:grid;grid-template-columns:220px 1fr;gap:14px;">
      <div class="card" style="padding:10px;">
        <p style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:8px;">PENDING (${pendingList.length})</p>
        <div class="stack" style="gap:6px;">
          ${pendingList.map((p) => `
            <button class="pending-item" data-id="${p.id}" style="text-align:left;padding:10px;border-radius:10px;background:${p.id === selectedId ? "var(--primary)" : "var(--row)"};color:${p.id === selectedId ? "#fff" : "var(--text)"};">
              <p style="font-size:12.5px;font-weight:600;">${p.student_name}</p>
              <p style="font-size:11px;opacity:.7;">Composition #${p.number}</p>
            </button>`).join("")}
        </div>
      </div>
      <div class="stack" id="detail-panel"></div>
    </div>
  `;

  document.querySelectorAll(".pending-item").forEach((btn) => {
    btn.addEventListener("click", () => { selectedId = btn.dataset.id; render(); });
  });

  if (selected) renderDetail(selected);
}

function renderDetail(sub) {
  const panel = document.getElementById("detail-panel");
  panel.innerHTML = `
    <div class="card">
      <p style="font-size:10.5px;font-weight:700;color:var(--text-muted);">COMPOSITION #${sub.number} · ${sub.title.toUpperCase()}</p>
      <p style="font-weight:600;font-size:15px;margin-top:2px;">${sub.student_name}</p>
      <p style="font-size:11px;color:var(--text-muted);margin-bottom:10px;">${sub.word_count} words</p>
      <div style="font-size:13px;line-height:1.6;">${escapeHtml(sub.body)}</div>
      <button class="btn btn-outline btn-sm" id="ai-assist-btn" style="margin-top:12px;">✨ AI pre-correction (draft help)</button>
      <div id="ai-assist-result"></div>
    </div>
    <div class="card">
      <p style="font-weight:600;font-size:13.5px;margin-bottom:8px;">Teacher Feedback</p>
      <textarea id="feedback-text" placeholder="Write your feedback here..."></textarea>
      <div class="row-between" style="margin-top:10px;">
        <div class="row"><label style="margin:0;">Score:</label><input type="number" id="score-input" min="0" max="100" style="width:80px;" /> / 100</div>
        <button class="btn btn-primary btn-sm" id="send-correction-btn">Send Correction</button>
      </div>
    </div>
  `;

  document.getElementById("ai-assist-btn").addEventListener("click", async (e) => {
    e.target.disabled = true;
    e.target.innerHTML = `<span class="spinner"></span> Analyzing...`;
    try {
      const { assist } = await api.post(`/compositions/submissions/${sub.id}/ai-assist`, {});
      document.getElementById("ai-assist-result").innerHTML = `
        <div class="card" style="background:color-mix(in srgb, var(--accent) 10%, white);margin-top:10px;font-size:12.5px;">
          <p><b>Suggested score:</b> ${assist.suggestedScore}/100</p>
          <p style="margin-top:6px;"><b>Strengths:</b> ${assist.strengths}</p>
          <p style="margin-top:6px;"><b>To improve:</b> ${assist.improvements}</p>
          ${assist.annotatedIssues?.length ? `<div style="margin-top:8px;">${assist.annotatedIssues.map((i) => `<p style="margin-top:3px;"><s style="color:var(--danger);">${escapeHtml(i.original)}</s> → <b style="color:var(--success);">${escapeHtml(i.suggestion)}</b> <span class="badge badge-muted">${i.type}</span></p>`).join("")}</div>` : ""}
          <p style="margin-top:8px;font-style:italic;color:var(--text-muted);">Ceci est une aide — la décision finale te revient.</p>
        </div>`;
      document.getElementById("score-input").value = assist.suggestedScore;
    } catch (err) {
      document.getElementById("ai-assist-result").innerHTML = `<p style="color:var(--danger);font-size:12px;margin-top:8px;">${err.message}</p>`;
    }
    e.target.disabled = false;
    e.target.textContent = "✨ AI pre-correction (draft help)";
  });

  document.getElementById("send-correction-btn").addEventListener("click", async (e) => {
    const score = Number(document.getElementById("score-input").value);
    const feedback = document.getElementById("feedback-text").value;
    if (!feedback.trim()) return alert("Ajoute un feedback avant d'envoyer.");
    e.target.disabled = true;
    e.target.textContent = "Sending...";
    await api.patch(`/compositions/submissions/${sub.id}/correct`, { score, feedback });
    pendingList = pendingList.filter((p) => p.id !== sub.id);
    selectedId = pendingList[0]?.id || null;
    render();
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
