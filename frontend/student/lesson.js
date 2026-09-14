// frontend/student/lesson.js — devenu la vue "Today" du parcours journalier.

let today = null;

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "lesson", title: "Today" });
  if (!ctx) return;

  const root = document.getElementById("lesson-root");
  try {
    today = await api.get("/students/me/today");
    document.querySelector("#shell-topbar div").insertAdjacentHTML(
      "beforeend",
      `<p class="sub">Day ${today.day} / ${today.totalDays} · Week ${today.week.number} · ${today.dayTypeLabel}</p>`
    );
    render();
  } catch (err) {
    if (handlePaywallError(err)) return;
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();

function render() {
  const root = document.getElementById("lesson-root");
  const headerCard = `
    <div class="card" style="background:var(--primary);color:#fff;">
      <div class="row-between">
        <span class="badge" style="background:color-mix(in srgb, var(--accent) 30%, transparent);color:var(--accent);">Day ${today.day} — ${today.dayTypeLabel}</span>
        <span style="font-size:11px;color:rgba(255,255,255,.5);">Week ${today.week.number} · ${today.week.title}</span>
      </div>
      <div class="progress-bar" style="background:rgba(255,255,255,.15);margin-top:10px;"><span style="width:${(today.day / today.totalDays) * 100}%;"></span></div>
    </div>
  `;

  if (today.dayType === 1) return renderGrammarDay(root, headerCard);
  if (today.dayType === 2) return renderVocabularyDay(root, headerCard);
  if (today.dayType === 3) return renderExercisesDay(root, headerCard);
  if (today.dayType === 4) return renderPracticeDay(root, headerCard);
  return renderReviewDay(root, headerCard);
}

/* ---------------- Day type 1 : Grammar ---------------- */

function renderGrammarDay(root, headerCard) {
  root.innerHTML = `
    ${headerCard}
    <div class="card">
      <button class="btn btn-outline btn-sm" id="read-grammar-btn" style="margin-bottom:10px;">${icon("volume")} Écouter la leçon</button>
      <div id="grammar-html-content">${today.grammarHtml || "<p>Contenu à venir.</p>"}</div>
    </div>
    <div class="card">
      <p style="font-weight:600;font-size:13.5px;margin-bottom:8px;">🎯 Speaking task for this week</p>
      <p style="font-size:13.5px;color:var(--text-muted);">${today.speakingTask || "—"}</p>
    </div>
    ${continueButton("Continue to Vocabulary")}
  `;
  document.getElementById("read-grammar-btn").addEventListener("click", (e) => {
    speakText(document.getElementById("grammar-html-content").textContent, e.currentTarget);
  });
  bindContinueButton();
}

/* ---------------- Day type 2 : Vocabulary ---------------- */

function renderVocabularyDay(root, headerCard) {
  root.innerHTML = `
    ${headerCard}
    ${today.images?.length ? `
      <div>
        <p style="font-weight:600;font-size:14px;margin:4px 0 10px;">🖼️ Picture Vocabulary</p>
        <div class="grid grid-3">
          ${today.images.map((img) => `
            <div class="card" style="padding:0;overflow:hidden;text-align:center;">
              <img src="${img.image_url}" alt="${img.word}" style="width:100%;height:80px;object-fit:cover;" />
              <div style="padding:6px;"><p style="font-size:11px;font-weight:600;">${img.word}</p><p style="font-size:10px;color:var(--text-muted);">${img.translation_fr}</p></div>
            </div>`).join("")}
        </div>
      </div>` : ""}
    <div class="grid grid-2">
      ${today.vocabulary.length ? today.vocabulary.map((v) => `
        <div class="card">
          <div class="row-between">
            <span class="row" style="gap:6px;">
              <span style="font-weight:600;font-size:13.5px;">${v.word}</span>
              <button class="speak-word-btn" data-word="${v.word}" style="color:var(--text-muted);">${icon("volume")}</button>
            </span>
            <span class="badge badge-muted">${v.word_type || ""}</span>
          </div>
          <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">FR ${v.fr || ""}</p>
          ${v.gb_variant ? `<div class="row" style="margin-top:8px;gap:4px;"><span class="badge" style="background:#DCE6FB;color:#3B6FE0;">GB ${v.gb_variant}</span><span class="badge badge-accent">US ${v.us_variant}</span></div>` : ""}
        </div>`).join("") : `<div class="empty-state">Pas encore de vocabulaire pour cette semaine.</div>`}
    </div>
    ${continueButton("Continue to Exercises")}
  `;
  document.querySelectorAll(".speak-word-btn").forEach((btn) => btn.addEventListener("click", () => speakText(btn.dataset.word, btn)));
  bindContinueButton();
}

/* ---------------- Day type 3 : Exercises (20 questions) ---------------- */

function renderExercisesDay(root, headerCard) {
  const questions = today.questions;
  const selections = new Array(questions.length).fill(null);

  root.innerHTML = `
    ${headerCard}
    ${today.bestScore !== null ? `<div class="card" style="background:var(--row);font-size:12.5px;">Ton meilleur score jusqu'ici : <b>${today.bestScore}%</b> (minimum requis : ${today.passThreshold}%)</div>` : ""}
    <div id="quiz-questions"></div>
    <button class="btn btn-primary btn-block" id="submit-exercises-btn" disabled>Submit Answers (0/${questions.length})</button>
    <div id="exercises-result"></div>
  `;

  const container = document.getElementById("quiz-questions");
  container.innerHTML = questions.map((q, i) => `
    <div class="card" style="margin-bottom:10px;">
      <p style="font-size:13px;font-weight:600;margin-bottom:10px;">${i + 1}. ${q.question} <span class="badge badge-muted" style="margin-left:4px;">W${q.weekNumber}</span></p>
      <div class="stack" style="gap:6px;">
        ${q.options.map((opt, oi) => `
          <button class="exo-select btn btn-outline" data-q="${i}" data-idx="${oi}" style="justify-content:flex-start;text-align:left;">
            <span style="color:var(--text-muted);margin-right:6px;">${String.fromCharCode(65 + oi)}.</span>${opt}
          </button>`).join("")}
      </div>
    </div>`).join("");

  const submitBtn = document.getElementById("submit-exercises-btn");
  container.querySelectorAll(".exo-select").forEach((btn) => {
    btn.addEventListener("click", () => {
      const qi = Number(btn.dataset.q);
      selections[qi] = Number(btn.dataset.idx);
      container.querySelectorAll(`.exo-select[data-q="${qi}"]`).forEach((b) => { b.style.background = ""; b.style.borderColor = ""; b.style.color = ""; });
      btn.style.background = "var(--row)"; btn.style.borderColor = "var(--primary)"; btn.style.color = "var(--primary)";
      const answered = selections.filter((s) => s !== null).length;
      submitBtn.textContent = `Submit Answers (${answered}/${questions.length})`;
      submitBtn.disabled = answered < questions.length;
    });
  });

  submitBtn.addEventListener("click", async () => {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> Grading...`;

    const answers = questions.map((q, i) => ({ questionId: q.id, selectedIndex: selections[i] }));

    if (!navigator.onLine) {
      await queuePendingAction({ url: "/students/me/today/submit-exercises", method: "post", body: { answers }, description: "Exercices du jour" });
      document.getElementById("exercises-result").innerHTML = `<div class="card" style="text-align:center;background:var(--row);margin-top:10px;">☁️ Réponses enregistrées, seront corrigées et synchronisées dès ta reconnexion.</div>`;
      submitBtn.remove();
      if (typeof updateOfflineIndicator === "function") updateOfflineIndicator();
      return;
    }

    try {
      const result = await api.post("/students/me/today/submit-exercises", { answers });

      // On ne connait pas l'index correct cote client (jamais envoye, pour
      // eviter la triche) — on colore juste la reponse choisie par l'eleve
      // en vert/rouge selon si elle etait juste.
      questions.forEach((q, i) => {
        const chosenBtn = container.querySelector(`.exo-select[data-q="${i}"][data-idx="${selections[i]}"]`);
        container.querySelectorAll(`.exo-select[data-q="${i}"]`).forEach((b) => (b.style.pointerEvents = "none"));
        if (!chosenBtn) return;
        if (result.results[i]?.correct) {
          chosenBtn.style.background = "var(--success-bg)"; chosenBtn.style.borderColor = "var(--success)"; chosenBtn.style.color = "var(--success)";
        } else {
          chosenBtn.style.background = "var(--danger-bg)"; chosenBtn.style.borderColor = "var(--danger)"; chosenBtn.style.color = "var(--danger)";
        }
      });
      document.getElementById("exercises-result").innerHTML = `
        <div class="card" style="text-align:center;background:${result.passed ? "var(--success-bg)" : "var(--danger-bg)"};color:${result.passed ? "var(--success)" : "var(--danger)"};margin-top:10px;">
          <p style="font-size:22px;font-weight:800;">${result.scorePct}%</p>
          <p style="font-size:12.5px;">${result.passed ? `Réussi ! (minimum ${result.passThreshold}%)` : `Pas encore assez (minimum ${result.passThreshold}%) — retente.`}</p>
        </div>
        ${result.passed ? continueButton("Continue to Practice") : `<button class="btn btn-outline btn-block" onclick="location.reload()">Réessayer</button>`}
      `;
      if (result.passed) bindContinueButton();
      submitBtn.remove();
    } catch (err) {
      if (handlePaywallError(err)) return;
      submitBtn.disabled = false;
      submitBtn.textContent = "Retry";
      alert(err.message);
    }
  });
}

/* ---------------- Day type 4 : Practice (Composition + Speaking) ---------------- */

function renderPracticeDay(root, headerCard) {
  const hasComposition = !!today.composition;
  const hasSpeaking = !!today.speakingScenario;
  const compOk = today.submission?.status === "corrected" && today.submission.score >= today.compositionPassThreshold;
  const speakOk = (today.bestSpeakingScore || 0) >= today.speakingPassThreshold;

  root.innerHTML = `
    ${headerCard}
    ${hasComposition ? `
      <div class="card">
        <p style="font-weight:600;font-size:14px;margin-bottom:6px;">✍️ Composition — ${today.composition.title}</p>
        <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px;">${today.composition.prompt}</p>
        ${compOk
          ? `<span class="badge badge-success">✅ Validée — score ${today.submission.score}/100</span>`
          : today.submission?.status === "submitted"
            ? `<span class="badge badge-accent">⏳ En attente de correction</span>`
            : `<a href="/student/compositions.html" class="btn btn-primary btn-sm">Rédiger ma composition ${icon("arrowRight")}</a>`}
      </div>` : ""}
    ${hasSpeaking ? `
      <div class="card">
        <p style="font-weight:600;font-size:14px;margin-bottom:6px;">🎙️ Speaking Lab — ${today.speakingScenario.title}</p>
        <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px;">Meilleur score actuel : ${today.bestSpeakingScore || 0}% (minimum ${today.speakingPassThreshold}%)</p>
        ${speakOk ? `<span class="badge badge-success">✅ Validé</span>` : `<a href="/student/speaking-lab.html" class="btn btn-primary btn-sm">Aller au Speaking Lab ${icon("arrowRight")}</a>`}
      </div>` : ""}
    ${!hasComposition && !hasSpeaking ? `<div class="card empty-state">Rien de spécial aujourd'hui — tu peux directement continuer.</div>` : ""}
    ${continueButton("Continue to Review")}
  `;
  bindContinueButton();
}

/* ---------------- Day type 5 : Review ---------------- */

function renderReviewDay(root, headerCard) {
  root.innerHTML = `
    ${headerCard}
    <div class="card" style="text-align:center;">
      <p style="font-size:30px;">🎉</p>
      <p style="font-weight:600;font-size:16px;">Semaine ${today.week.number} terminée !</p>
      <p style="font-size:13px;color:var(--text-muted);margin-top:6px;">${today.weekSummary.grammarTitle || ""}</p>
      ${today.weekSummary.exerciseScore !== null ? `<p style="font-size:12.5px;margin-top:8px;">Score exercices : <b>${today.weekSummary.exerciseScore}%</b></p>` : ""}
    </div>
    ${continueButton("Continue to next week →")}
  `;
  bindContinueButton();
}

/* ---------------- Continuer / Avancer d'un jour ---------------- */

function continueButton(label) {
  return `
    <button class="btn btn-primary btn-block" id="advance-day-btn">${label}</button>
    <div id="advance-day-reasons"></div>
  `;
}

function bindContinueButton() {
  const btn = document.getElementById("advance-day-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Saving...`;
    try {
      await api.post("/students/me/advance-day", {});
      window.location.reload();
    } catch (err) {
      if (handlePaywallError(err)) return;
      btn.disabled = false;
      const reasons = err.data?.reasons;
      const box = document.getElementById("advance-day-reasons");
      if (box) {
        box.innerHTML = (reasons?.length ? reasons : [err.message])
          .map((r) => `<p style="font-size:12.5px;color:var(--danger);margin-top:6px;">⚠️ ${r}</p>`).join("");
      }
      btn.textContent = btn.dataset.originalLabel || "Retry";
    }
  });
}

function speakText(text, buttonEl) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  if (buttonEl) {
    utterance.onstart = () => { buttonEl.style.opacity = "0.5"; };
    utterance.onend = () => { buttonEl.style.opacity = "1"; };
  }
  window.speechSynthesis.speak(utterance);
}
