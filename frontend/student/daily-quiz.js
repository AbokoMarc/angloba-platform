// frontend/student/daily-quiz.js

let questions = [];
let selections = {};
let currentIndex = 0;

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "dashboard", title: "Daily Quiz", subtitle: "20 questions — la difficulté suit ta progression" });
  if (!ctx) return;

  const root = document.getElementById("quiz-root");
  try {
    const data = await api.get("/daily-quiz");
    questions = data.questions;

    if (data.alreadyDone !== null && data.alreadyDone !== undefined) {
      root.innerHTML = `
        <div class="card" style="text-align:center;background:var(--success-bg);color:var(--success);">
          <p style="font-size:30px;">✅</p>
          <p style="font-weight:600;font-size:16px;">Quiz du jour déjà fait !</p>
          <p style="font-size:13px;margin-top:4px;">Score : ${data.alreadyDone}%</p>
          <p style="font-size:12px;color:var(--text-muted);margin-top:8px;">Reviens demain pour un nouveau quiz.</p>
        </div>
      `;
      return;
    }

    if (!questions.length) {
      root.innerHTML = `<div class="empty-state">Pas encore assez de contenu pour générer ton quiz — reviens un peu plus tard.</div>`;
      return;
    }

    renderQuestion();
  } catch (err) {
    if (handlePaywallError(err)) return;
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();

function renderQuestion() {
  const root = document.getElementById("quiz-root");
  const q = questions[currentIndex];
  const answered = selections[q.id] !== undefined;

  root.innerHTML = `
    <div class="row-between">
      <span style="font-size:12px;color:var(--text-muted);">Question ${currentIndex + 1} / ${questions.length}</span>
      <span class="badge badge-accent">Week ${q.weekNumber}</span>
    </div>
    <div class="progress-bar"><span style="width:${((currentIndex + 1) / questions.length) * 100}%;"></span></div>

    <div class="card">
      <p style="font-size:15px;font-weight:600;margin-bottom:14px;">${q.question}</p>
      <div class="stack" style="gap:8px;">
        ${q.options.map((opt, i) => `
          <button class="quiz-option btn btn-outline" data-idx="${i}" style="justify-content:flex-start;text-align:left;${selections[q.id] === i ? "background:var(--row);border-color:var(--primary);color:var(--primary);" : ""}">
            <span style="color:var(--text-muted);margin-right:6px;">${String.fromCharCode(65 + i)}.</span>${opt}
          </button>`).join("")}
      </div>
    </div>

    <div class="row-between">
      <button class="btn btn-outline" id="prev-btn" ${currentIndex === 0 ? "disabled" : ""}>← Précédent</button>
      ${currentIndex === questions.length - 1
        ? `<button class="btn btn-primary" id="submit-quiz-btn" ${answered ? "" : "disabled"}>Terminer le quiz</button>`
        : `<button class="btn btn-primary" id="next-btn" ${answered ? "" : "disabled"}>Suivant →</button>`}
    </div>
  `;

  document.querySelectorAll(".quiz-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      selections[q.id] = Number(btn.dataset.idx);
      renderQuestion();
    });
  });
  document.getElementById("prev-btn")?.addEventListener("click", () => { currentIndex--; renderQuestion(); });
  document.getElementById("next-btn")?.addEventListener("click", () => { currentIndex++; renderQuestion(); });
  document.getElementById("submit-quiz-btn")?.addEventListener("click", submitQuiz);
}

async function submitQuiz() {
  const btn = document.getElementById("submit-quiz-btn");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Correction...`;

  const answers = questions.map((q) => ({ questionId: q.id, selectedIndex: selections[q.id] }));

  try {
    const { scorePct } = await api.post("/daily-quiz/submit", { answers });
    const root = document.getElementById("quiz-root");
    root.innerHTML = `
      <div class="card" style="text-align:center;background:${scorePct >= 60 ? "var(--success-bg)" : "color-mix(in srgb, var(--accent) 15%, white)"};color:${scorePct >= 60 ? "var(--success)" : "var(--primary)"};">
        <p style="font-size:34px;">${scorePct >= 80 ? "🏆" : scorePct >= 60 ? "🎉" : "💪"}</p>
        <p style="font-size:26px;font-weight:800;">${scorePct}%</p>
        <p style="font-size:13px;margin-top:6px;">${questions.length} questions terminées aujourd'hui.</p>
      </div>
      <a href="/student/dashboard.html" class="btn btn-outline btn-block">Retour au dashboard</a>
    `;
  } catch (err) {
    if (handlePaywallError(err)) return;
    btn.disabled = false;
    btn.textContent = "Terminer le quiz";
    alert(err.message);
  }
}
