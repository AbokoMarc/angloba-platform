// frontend/student/lesson.js — devenu la vue "Today" du parcours journalier.

let today = null;

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "lesson", title: "Current Lesson" });
  if (!ctx) return;

  const root = document.getElementById("lesson-root");
  try {
    today = await api.get("/students/me/today");
    document.querySelector("#shell-topbar > div").insertAdjacentHTML(
      "beforeend",
      `<p class="sub">Day ${today.day}/${today.totalDays}</p>`
    );
    render();
  } catch (err) {
    if (handlePaywallError(err)) return;
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();

function render() {
  const root = document.getElementById("lesson-root");
  const pct = Math.round((today.day / today.totalDays) * 100);
  const headerCard = `
    <div class="day-hero">
      <div class="row-between">
        <div>
          <h2>Day ${today.day} · ${esc(today.dayTypeLabel)}</h2>
          <p>Week ${today.week.number} · ${esc(today.week.title)}</p>
        </div>
        <span class="pill pill-dark">${pct}%</span>
      </div>
      <div class="progress-bar on-dark" style="margin-top:12px;"><span style="width:${Math.max(pct, 2)}%;"></span></div>
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
    <div class="sec-card">
      <button class="btn btn-outline btn-sm" id="read-grammar-btn" style="margin-bottom:12px;">${icon("volume")} Écouter la leçon</button>
      <div class="grammar-body" id="grammar-html-content">${today.grammarHtml || "<p>Contenu à venir.</p>"}</div>
    </div>
    <div class="sec-card" style="background:var(--orange-soft);">
      <h3>🎯 Speaking task for this week</h3>
      <p style="font-size:15px;color:#5A3A12;font-weight:600;">${today.speakingTask || "—"}</p>
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
        <h2 class="sec-title" style="margin-bottom:8px;">Picture Vocabulary</h2>
        <div class="pic-strip">
          ${today.images.map((img) => `
            <div class="pic">
              <div class="ph"><img src="${img.image_url}" alt="${esc(img.word)}" loading="lazy" onerror="this.remove()" />📷</div>
              <b>${esc(img.word)}</b><span>${esc(img.translation_fr)}</span>
            </div>`).join("")}
        </div>
      </div>` : ""}
    <div class="stack" style="gap:10px;">
      ${today.vocabulary.length ? today.vocabulary.map((v) => `
        <div class="word">
          <div>
            <p><span class="w">${esc(v.word)}</span>${v.word_type ? `<span class="tag">${esc(v.word_type)}</span>` : ""}</p>
            <p class="fr">${esc(v.fr || "")}</p>
            ${v.gb_variant ? `<div class="row" style="margin-top:6px;gap:4px;"><span class="badge" style="background:#DCE6FB;color:#3B6FE0;">GB ${esc(v.gb_variant)}</span><span class="badge badge-accent">US ${esc(v.us_variant)}</span></div>` : ""}
          </div>
          <div class="acts"><button class="icon-btn speak-word-btn" data-word="${esc(v.word)}" aria-label="Écouter">${icon("volume")}</button></div>
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
  const total = questions.length;
  const selections = new Array(total).fill(null);
  let cur = 0;
  let graded = false;

  root.innerHTML = `
    <div class="exo-head">
      <h2>Day ${today.day} Exercises</h2>
      <p>Week ${today.week.number} · ${esc(today.week.title)}</p>
    </div>
    <div id="exo-body" class="stack"></div>
  `;
  const body = document.getElementById("exo-body");

  function answeredCount() { return selections.filter((s) => s !== null).length; }

  function draw() {
    const q = questions[cur];
    const pct = Math.round(((cur + 1) / total) * 100);
    const isLast = cur === total - 1;
    const allDone = answeredCount() === total;
    body.innerHTML = `
      <div class="q-progress"><span>Progress ${cur + 1}/${total}</span><div class="progress-bar"><span style="width:${pct}%;"></span></div><span>${pct}%</span></div>
      <div class="card row-between" style="padding:12px 14px;">
        ${today.bestScore !== null ? `<span class="pill pill-orange" style="font-size:14px;">${icon("trophy")} Best: ${today.bestScore}%</span>` : `<span class="pill pill-green">${icon("star")} First try</span>`}
        <span style="font-weight:700;color:var(--brand);">Minimum ${today.passThreshold}%</span>
      </div>
      <div class="card">
        <p style="text-align:center;"><span class="pill pill-green" style="font-size:12px;letter-spacing:.04em;">QUESTION ${cur + 1}</span></p>
        <h3 style="font-size:24px;font-weight:800;color:var(--brand);margin:12px 0 14px;line-height:1.25;">${cur + 1}. ${esc(q.question)}</h3>
        <div class="stack" style="gap:10px;">
          ${q.options.map((opt, oi) => `
            <button class="opt ${selections[cur] === oi ? "sel" : ""}" data-idx="${oi}">
              <span class="letter">${String.fromCharCode(65 + oi)}</span><span>${esc(opt)}</span>
              <span class="mark">${icon("check")}</span>
            </button>`).join("")}
        </div>
      </div>
      <div class="nav-row sticky-cta">
        <button class="btn btn-outline" id="prev-btn" ${cur === 0 ? "disabled" : ""}>${icon("chevronLeft")} Previous</button>
        ${isLast
          ? `<button class="btn btn-cta" id="submit-exercises-btn" ${allDone ? "" : "disabled"}>Submit (${answeredCount()}/${total})</button>`
          : `<button class="btn btn-cta" id="next-btn">Next ${icon("chevronRight")}</button>`}
      </div>
      <div class="dots">${questions.map((_, i) => `<button class="${i === cur ? "cur" : selections[i] !== null ? "done" : ""}" data-go="${i}" aria-label="Question ${i + 1}"></button>`).join("")}</div>
      ${isLast && !allDone ? `<p style="text-align:center;font-size:13px;color:var(--danger);font-weight:700;">Réponds à toutes les questions pour valider (${total - answeredCount()} restante(s)).</p>` : ""}
      <div id="exercises-result"></div>
    `;

    body.querySelectorAll(".opt").forEach((btn) => btn.addEventListener("click", () => {
      const at = cur;
      selections[at] = Number(btn.dataset.idx);
      draw();
      // Passe automatiquement a la question suivante (plus rapide sur mobile)
      if (at < total - 1) setTimeout(() => { if (cur === at && !graded) { cur += 1; draw(); } }, 350);
    }));
    body.querySelector("#prev-btn")?.addEventListener("click", () => { cur -= 1; draw(); });
    body.querySelector("#next-btn")?.addEventListener("click", () => { cur += 1; draw(); });
    body.querySelectorAll("[data-go]").forEach((d) => d.addEventListener("click", () => { cur = Number(d.dataset.go); draw(); }));
    body.querySelector("#submit-exercises-btn")?.addEventListener("click", submit);
  }

  async function submit() {
    const submitBtn = document.getElementById("submit-exercises-btn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> Grading...`;
    const answers = questions.map((q, i) => ({ questionId: q.id, selectedIndex: selections[i] }));

    if (!navigator.onLine) {
      await queuePendingAction({ url: "/students/me/today/submit-exercises", method: "post", body: { answers }, description: "Exercices du jour" });
      body.innerHTML = `<div class="card" style="text-align:center;">☁️ Réponses enregistrées, elles seront corrigées et synchronisées dès ta reconnexion.</div>`;
      if (typeof updateOfflineIndicator === "function") updateOfflineIndicator();
      return;
    }

    try {
      const result = await api.post("/students/me/today/submit-exercises", { answers });
      graded = true;
      const ok = result.passed;
      // L'index correct n'est jamais envoye au client (anti-triche) : on
      // colore seulement la reponse choisie (vert = juste, rouge = fausse).
      body.innerHTML = `
        <div class="score-card" style="background:${ok ? "var(--green-soft)" : "var(--danger-bg)"};color:${ok ? "#14663F" : "var(--danger)"};">
          <p style="font-size:34px;">${ok ? "🎉" : "💪"}</p>
          <p class="num">${result.scorePct}%</p>
          <p style="font-weight:800;font-size:16px;margin-top:6px;">${ok ? "Bravo, c'est validé !" : "Presque ! Retente pour passer."}</p>
          <p style="font-size:13px;font-weight:600;opacity:.85;">Minimum requis : ${result.passThreshold}%</p>
        </div>
        ${ok ? continueButton("Continue to Practice") : `<button class="btn btn-cta btn-block sticky-cta" onclick="location.reload()">Try again</button>`}
        <h2 class="sec-title">Your answers</h2>
        ${questions.map((q, i) => {
          const good = result.results[i]?.correct;
          return `<div class="review-q"><p class="q">${i + 1}. ${esc(q.question)}</p>
            <div class="opt ${good ? "ok" : "bad"}"><span class="letter">${String.fromCharCode(65 + (selections[i] ?? 0))}</span><span>${esc(q.options[selections[i]] ?? "")}</span><span class="mark">${good ? icon("check") : icon("x")}</span></div></div>`;
        }).join("")}
      `;
      if (ok) bindContinueButton();
    } catch (err) {
      if (handlePaywallError(err)) return;
      submitBtn.disabled = false;
      submitBtn.textContent = "Retry";
      alert(err.message);
    }
  }

  draw();
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
      <div class="sec-card">
        <h3>✍️ Composition — ${esc(today.composition.title)}</h3>
        <p style="font-size:14.5px;color:var(--text-muted);margin-bottom:12px;">${esc(today.composition.prompt)}</p>
        ${compOk
          ? `<span class="badge badge-success">✅ Validée — score ${today.submission.score}/100</span>`
          : today.submission?.status === "submitted"
            ? `<span class="badge badge-accent">⏳ En attente de correction</span>`
            : `<a href="/student/compositions.html" class="btn btn-cta btn-sm">Rédiger ma composition ${icon("chevronRight")}</a>`}
      </div>` : ""}
    ${hasSpeaking ? `
      <div class="sec-card">
        <h3>🎙️ Speaking Lab — ${esc(today.speakingScenario.title)}</h3>
        <p style="font-size:14.5px;color:var(--text-muted);margin-bottom:12px;">Meilleur score actuel : ${today.bestSpeakingScore || 0}% (minimum ${today.speakingPassThreshold}%)</p>
        ${speakOk ? `<span class="badge badge-success">✅ Validé</span>` : `<a href="/student/speaking-lab.html" class="btn btn-cta btn-sm">Aller au Speaking Lab ${icon("chevronRight")}</a>`}
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
    <div class="score-card" style="background:var(--card);">
      <p style="font-size:40px;">🎉</p>
      <p style="font-weight:800;font-size:20px;color:var(--brand);margin-top:6px;">Semaine ${today.week.number} terminée !</p>
      <p style="font-size:14px;color:var(--text-muted);margin-top:6px;">${esc(today.weekSummary.grammarTitle || "")}</p>
      ${today.weekSummary.exerciseScore !== null ? `<p style="margin-top:12px;"><span class="pill pill-green" style="font-size:14px;">Score exercices : ${today.weekSummary.exerciseScore}%</span></p>` : ""}
    </div>
    ${continueButton("Continue to next week")}
  `;
  bindContinueButton();
}

/* ---------------- Continuer / Avancer d'un jour ---------------- */

function continueButton(label) {
  return `
    <button class="btn btn-cta btn-block sticky-cta" id="advance-day-btn" data-original-label="${label}">${label} ${icon("chevronRight")}</button>
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
          .map((r) => `<p style="font-size:14px;font-weight:700;color:var(--danger);margin-top:6px;">⚠️ ${esc(r)}</p>`).join("");
      }
      btn.innerHTML = `${btn.dataset.originalLabel || "Retry"} ${icon("chevronRight")}`;
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
