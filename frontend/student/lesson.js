// frontend/student/lesson.js — vue "Today" du parcours journalier.
// UNE SEMAINE = 7 JOURS. Chaque jour a plusieurs tâches : le bouton "Continuer"
// ne s'active que lorsque TOUTES les tâches du jour sont faites.

let today = null;
const MIN_READ_SECONDS = 20; // doit rester >= au minimum imposé par le serveur

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "lesson", title: "Current Lesson" });
  if (!ctx) return;

  const root = document.getElementById("lesson-root");
  try {
    today = await api.get("/students/me/today");
    document.querySelector("#shell-topbar > div")?.insertAdjacentHTML("beforeend", `<p class="sub">Day ${today.day}/${today.totalDays}</p>`);
    render();
  } catch (err) {
    if (handlePaywallError(err)) return;
    root.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
  }
})();

function render() {
  const root = document.getElementById("lesson-root");
  const pct = Math.round((today.day / today.totalDays) * 100);
  const dots = Array.from({ length: today.daysPerWeek }, (_, i) => {
    const n = i + 1;
    return `<span class="wd ${n < today.dayInWeek ? "done" : n === today.dayInWeek ? "cur" : ""}">${n}</span>`;
  }).join("");

  const header = `
    <div class="day-hero">
      <div class="row-between">
        <div>
          <h2>Day ${today.day} · ${esc(today.dayTypeLabel)}</h2>
          <p>Week ${today.week.number} · ${esc(today.week.title)}</p>
        </div>
        <span class="pill pill-dark">${pct}%</span>
      </div>
      <div class="week-dots" aria-label="Jour ${today.dayInWeek} sur ${today.daysPerWeek} de la semaine">${dots}</div>
      <div class="progress-bar on-dark" style="margin-top:10px;"><span style="width:${Math.max(pct, 2)}%;"></span></div>
    </div>
    <div class="sec-card task-card">
      <h3>Aujourd'hui, à faire (${today.tasks.filter((t) => t.done).length}/${today.tasks.length})</h3>
      <ul class="task-list">
        ${today.tasks.map((t) => `
          <li class="task ${t.done ? "done" : ""}">
            <span class="tk">${t.done ? icon("check") : ""}</span>
            <span class="tt"><b>${esc(t.title)}</b>${t.detail ? `<small>${esc(t.detail)}</small>` : ""}</span>
          </li>`).join("")}
      </ul>
      <p class="task-hint">${today.dayComplete ? "✅ Journée complète ! Tu peux passer au jour suivant." : "Fais toutes les tâches pour débloquer le jour suivant."}</p>
    </div>
  `;

  root.innerHTML = `${header}<div id="day-body" class="stack"></div><div id="day-footer"></div>`;
  const body = document.getElementById("day-body");

  if (today.dayType === 1) renderGrammar(body);
  else if (today.dayType === 2) renderVocabulary(body);
  else if (today.dayType === 4) renderSpeaking(body);
  else if (today.dayType === 5) renderWriting(body);
  else if (today.dayType === 7) renderWeekSummary(body);

  if (today.quiz) renderQuiz(body);
  renderFooter();
}

function taskDone(key) { return today.tasks.find((t) => t.key === key)?.done; }

/* ---------- Bouton "j'ai lu / j'ai fait" (avec petit délai anti-clic-sans-lire) ---------- */
function confirmBlock(taskKey, label) {
  if (taskDone(taskKey)) return `<span class="badge badge-success" style="align-self:flex-start;">✅ Fait</span>`;
  return `<button class="btn btn-primary btn-block" id="confirm-${taskKey}" disabled>${esc(label)}</button>`;
}

function bindConfirm(taskKey, label) {
  const btn = document.getElementById(`confirm-${taskKey}`);
  if (!btn) return;
  let left = MIN_READ_SECONDS;
  const tick = () => {
    if (left > 0) { btn.textContent = `${label} (${left}s)`; left -= 1; setTimeout(tick, 1000); }
    else { btn.disabled = false; btn.textContent = label; }
  };
  tick();
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span>`;
    try {
      await api.post("/students/me/today/task", { task: taskKey });
      location.reload();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = label;
      alert(err.message);
    }
  });
}

/* ---------------- Jour 1 : Grammar ---------------- */
function renderGrammar(body) {
  body.innerHTML = `
    <div class="sec-card">
      <button class="btn btn-outline btn-sm" id="read-grammar-btn" style="margin-bottom:12px;">${icon("volume")} Écouter la leçon</button>
      <div class="grammar-body" id="grammar-html-content">${today.grammarHtml || "<p>Contenu à venir.</p>"}</div>
      <div style="margin-top:14px;">${confirmBlock("lesson_read", "J'ai lu la leçon")}</div>
    </div>
    <div class="sec-card" style="background:var(--orange-soft);">
      <h3>🎯 Speaking task for this week</h3>
      <p style="font-size:15px;color:#5A3A12;font-weight:600;">${esc(today.speakingTask || "—")}</p>
    </div>
  `;
  document.getElementById("read-grammar-btn").addEventListener("click", (e) => speakText(document.getElementById("grammar-html-content").textContent, e.currentTarget));
  bindConfirm("lesson_read", "J'ai lu la leçon");
}

/* ---------------- Jour 2 : Vocabulary ---------------- */
function renderVocabulary(body) {
  body.innerHTML = `
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
    <div class="sec-card">${confirmBlock("words_seen", "J'ai parcouru tous les mots")}</div>
  `;
  document.querySelectorAll(".speak-word-btn").forEach((btn) => btn.addEventListener("click", () => speakText(btn.dataset.word, btn)));
  bindConfirm("words_seen", "J'ai parcouru tous les mots");
}

/* ---------------- Jour 4 : Speaking ---------------- */
function renderSpeaking(body) {
  const hasLab = !!today.speakingScenario;
  body.innerHTML = `
    <div class="sec-card" style="background:var(--orange-soft);">
      <h3>🎯 ${esc(today.speakingTask || "Speaking")}</h3>
      <p style="font-size:14px;color:#5A3A12;font-weight:600;">Écoute chaque phrase, puis répète-la à voix haute 3 fois.</p>
    </div>
    <div class="stack" style="gap:10px;">
      ${(today.keyPhrases || []).map((p) => `
        <div class="word">
          <div>
            <p><span class="w" style="font-size:17px;">${esc(p.en)}</span></p>
            <p class="fr">${esc(p.fr)}</p>
          </div>
          <div class="acts"><button class="icon-btn speak-word-btn" data-word="${esc(p.en)}" aria-label="Écouter">${icon("volume")}</button></div>
        </div>`).join("")}
    </div>
    <div class="sec-card">${confirmBlock("phrases", "J'ai répété les phrases à voix haute")}</div>
    ${hasLab ? `
      <div class="sec-card">
        <h3>🎙️ Speaking Lab — ${esc(today.speakingScenario.title)}</h3>
        <p style="font-size:14.5px;color:var(--text-muted);margin-bottom:12px;">Meilleur score actuel : ${today.bestSpeakingScore || 0}% (minimum ${today.speakingPassThreshold}%)</p>
        ${taskDone("speaking_lab") ? `<span class="badge badge-success">✅ Validé</span>` : `<a href="/student/speaking-lab.html" class="btn btn-cta btn-sm">Aller au Speaking Lab ${icon("chevronRight")}</a>`}
      </div>` : ""}
  `;
  document.querySelectorAll(".speak-word-btn").forEach((btn) => btn.addEventListener("click", () => speakText(btn.dataset.word, btn)));
  bindConfirm("phrases", "J'ai répété les phrases à voix haute");
}

/* ---------------- Jour 5 : Writing ---------------- */
function renderWriting(body) {
  if (today.composition) {
    const sub = today.submission;
    const status = sub?.status;
    body.innerHTML = `
      <div class="sec-card">
        <h3>✍️ Composition — ${esc(today.composition.title)}</h3>
        <p style="font-size:14.5px;color:var(--text-muted);margin-bottom:12px;">${esc(today.composition.prompt)}</p>
        ${status === "corrected"
          ? `<span class="badge badge-success">✅ Corrigée — score ${sub.score ?? "—"}/100</span>
             ${sub.teacher_feedback ? `<div class="tip-banner" style="margin-top:10px;font-weight:600;">${icon("edit")}<span>${esc(sub.teacher_feedback)}</span></div>` : ""}`
          : status === "submitted"
            ? `<span class="badge badge-accent">⏳ En attente de correction</span>
               <p style="font-size:13px;color:var(--text-muted);margin-top:8px;">Dès que ton professeur (ou l'IA) l'a corrigée, ce jour sera validé. Tu seras notifié.</p>`
            : `<a href="/student/compositions.html?id=${today.composition.id}" class="btn btn-cta btn-sm">${status === "draft" ? "Terminer ma composition" : "Rédiger ma composition"} ${icon("chevronRight")}</a>`}
      </div>`;
    return;
  }

  const w = today.writing;
  const done = taskDone("writing");
  body.innerHTML = `
    <div class="sec-card">
      <h3>✍️ Écriture courte</h3>
      <p style="font-size:14.5px;color:var(--text-muted);margin-bottom:10px;">${esc(w.prompt)}</p>
      <textarea id="writing-text" class="comp-ta" placeholder="Write here..." ${done ? "disabled" : ""}>${esc(w.body || "")}</textarea>
      <div class="wc" style="margin-top:10px;"><span id="w-count">0/${w.minWords} words</span><div class="progress-bar"><span id="w-bar" style="width:0%;"></span></div></div>
      <p id="w-note" style="font-size:13px;font-weight:700;min-height:18px;margin-top:6px;"></p>
      ${done ? `<span class="badge badge-success">✅ Envoyé</span>` : `
        <div class="nav-row" style="margin-top:8px;">
          <button class="btn btn-primary" id="w-save">${icon("file")} Save draft</button>
          <button class="btn btn-cta" id="w-submit">${icon("send")} Valider</button>
        </div>`}
    </div>`;
  const ta = document.getElementById("writing-text");
  const count = () => (ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0);
  const update = () => {
    const n = count();
    document.getElementById("w-count").textContent = `${n}/${w.minWords} words`;
    document.getElementById("w-bar").style.width = `${Math.min(100, Math.round((n / w.minWords) * 100))}%`;
  };
  ta.addEventListener("input", update);
  update();
  const note = document.getElementById("w-note");
  async function send(submit, btn) {
    btn.disabled = true;
    note.style.color = "var(--text-muted)";
    try {
      const r = await api.post("/students/me/today/submit-writing", { text: ta.value, submit });
      if (submit) { location.reload(); return; }
      note.style.color = "#14663F";
      note.textContent = "✓ Brouillon enregistré";
    } catch (err) {
      note.style.color = "var(--danger)";
      note.textContent = err.message;
    }
    btn.disabled = false;
  }
  document.getElementById("w-save")?.addEventListener("click", (e) => send(false, e.currentTarget));
  document.getElementById("w-submit")?.addEventListener("click", (e) => send(true, e.currentTarget));
}

/* ---------------- Jour 7 : résumé de la semaine ---------------- */
function renderWeekSummary(body) {
  const scores = today.weekSummary?.scores || [];
  body.innerHTML = `
    <div class="sec-card">
      <h3>📋 Ta semaine ${today.week.number}</h3>
      <p style="font-size:14px;color:var(--text-muted);">${esc(today.weekSummary?.grammarTitle || "")}</p>
      ${scores.length ? `<div class="chips" style="margin-top:10px;">${scores.map((s) => `<span class="pill pill-green">${esc(s.task)} : ${s.score}%</span>`).join("")}</div>` : ""}
      <p style="font-size:13.5px;margin-top:10px;font-weight:600;">Réussis le test final (20 questions) pour terminer la semaine.</p>
    </div>`;
}

/* ---------------- Quiz générique (mini-quiz, exercices, révision, test) ---------------- */
function renderQuiz(container) {
  const quiz = today.quiz;
  const holder = document.createElement("div");
  holder.id = "quiz-holder";
  container.appendChild(holder);

  if (quiz.done) {
    holder.innerHTML = `<div class="sec-card"><h3>${esc(quiz.title)}</h3><span class="badge badge-success">✅ Validé${quiz.bestScore != null ? ` — ${quiz.bestScore}%` : ""}</span></div>`;
    return;
  }
  const questions = quiz.questions;
  const total = questions.length;
  const selections = new Array(total).fill(null);
  let cur = 0;
  let graded = false;

  const answeredCount = () => selections.filter((s) => s !== null).length;

  function draw() {
    const q = questions[cur];
    const pct = Math.round(((cur + 1) / total) * 100);
    const isLast = cur === total - 1;
    const allDone = answeredCount() === total;
    holder.innerHTML = `
      <div class="exo-head"><h2>${esc(quiz.title)}</h2><p>${total} questions · minimum ${quiz.passThreshold}%${quiz.attempts ? ` · essai ${quiz.attempts + 1}` : ""}</p></div>
      <div class="q-progress"><span>Progress ${cur + 1}/${total}</span><div class="progress-bar"><span style="width:${pct}%;"></span></div><span>${pct}%</span></div>
      ${quiz.bestScore !== null ? `<div class="card row-between" style="padding:12px 14px;"><span class="pill pill-orange" style="font-size:14px;">${icon("trophy")} Best: ${quiz.bestScore}%</span><span style="font-weight:700;color:var(--brand);">Minimum ${quiz.passThreshold}%</span></div>` : ""}
      <div class="card">
        <p style="text-align:center;"><span class="pill pill-green" style="font-size:12px;letter-spacing:.04em;">QUESTION ${cur + 1}</span></p>
        <h3 style="font-size:22px;font-weight:800;color:var(--brand);margin:12px 0 14px;line-height:1.3;">${cur + 1}. ${esc(q.question)}</h3>
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
          ? `<button class="btn btn-cta" id="submit-quiz-btn" ${allDone ? "" : "disabled"}>Submit (${answeredCount()}/${total})</button>`
          : `<button class="btn btn-cta" id="next-btn">Next ${icon("chevronRight")}</button>`}
      </div>
      <div class="dots">${questions.map((_, i) => `<button class="${i === cur ? "cur" : selections[i] !== null ? "done" : ""}" data-go="${i}" aria-label="Question ${i + 1}"></button>`).join("")}</div>
      ${isLast && !allDone ? `<p style="text-align:center;font-size:13px;color:var(--danger);font-weight:700;">Réponds à toutes les questions pour valider (${total - answeredCount()} restante(s)).</p>` : ""}
    `;
    holder.querySelectorAll(".opt").forEach((btn) => btn.addEventListener("click", () => {
      const at = cur;
      selections[at] = Number(btn.dataset.idx);
      draw();
      if (at < total - 1) setTimeout(() => { if (cur === at && !graded) { cur += 1; draw(); } }, 350);
    }));
    holder.querySelector("#prev-btn")?.addEventListener("click", () => { cur -= 1; draw(); });
    holder.querySelector("#next-btn")?.addEventListener("click", () => { cur += 1; draw(); });
    holder.querySelectorAll("[data-go]").forEach((d) => d.addEventListener("click", () => { cur = Number(d.dataset.go); draw(); }));
    holder.querySelector("#submit-quiz-btn")?.addEventListener("click", submit);
  }

  async function submit() {
    const btn = document.getElementById("submit-quiz-btn");
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Grading...`;
    const answers = questions.map((q, i) => ({ questionId: q.id, selectedIndex: selections[i] }));

    if (!navigator.onLine) {
      await queuePendingAction({ url: "/students/me/today/submit-quiz", method: "post", body: { answers }, description: quiz.title });
      holder.innerHTML = `<div class="card" style="text-align:center;">☁️ Réponses enregistrées, elles seront corrigées dès ta reconnexion.</div>`;
      if (typeof updateOfflineIndicator === "function") updateOfflineIndicator();
      return;
    }
    try {
      const result = await api.post("/students/me/today/submit-quiz", { answers });
      graded = true;
      const ok = result.passed;
      holder.innerHTML = `
        <div class="score-card" style="background:${ok ? "var(--green-soft)" : "var(--danger-bg)"};color:${ok ? "#14663F" : "var(--danger)"};">
          <p style="font-size:34px;">${ok ? "🎉" : "💪"}</p>
          <p class="num">${result.scorePct}%</p>
          <p style="font-weight:800;font-size:16px;margin-top:6px;">${ok ? "Bravo, c'est validé !" : "Presque ! Tu auras de nouvelles questions."}</p>
          <p style="font-size:13px;font-weight:600;opacity:.85;">Minimum requis : ${result.passThreshold}%</p>
        </div>
        <button class="btn btn-cta btn-block" onclick="location.reload()">${ok ? "Continuer" : "Réessayer"}</button>
        <h2 class="sec-title">Your answers</h2>
        ${questions.map((q, i) => {
          const good = result.results[i]?.correct;
          return `<div class="review-q"><p class="q">${i + 1}. ${esc(q.question)}</p>
            <div class="opt ${good ? "ok" : "bad"}"><span class="letter">${String.fromCharCode(65 + (selections[i] ?? 0))}</span><span>${esc(q.options[selections[i]] ?? "")}</span><span class="mark">${good ? icon("check") : icon("x")}</span></div></div>`;
        }).join("")}
      `;
    } catch (err) {
      if (handlePaywallError(err)) return;
      btn.disabled = false;
      btn.textContent = "Retry";
      alert(err.message);
    }
  }

  draw();
}

/* ---------------- Continuer / avancer d'un jour ---------------- */
function renderFooter() {
  const footer = document.getElementById("day-footer");
  const lastDay = today.day >= today.totalDays;
  const isWeekEnd = today.dayInWeek === today.daysPerWeek;
  const label = lastDay ? "Terminer le programme 🎓" : isWeekEnd ? `Terminer la semaine ${today.week.number}` : `Passer au jour ${today.day + 1}`;
  footer.innerHTML = `
    <button class="btn btn-cta btn-block sticky-cta" id="advance-day-btn" ${today.dayComplete ? "" : "disabled"}>${label} ${icon("chevronRight")}</button>
    <div id="advance-day-reasons">${today.dayComplete ? "" : `<p style="font-size:13.5px;font-weight:700;color:var(--text-muted);margin-top:8px;text-align:center;">🔒 Termine toutes les tâches ci-dessus pour continuer.</p>`}</div>
  `;
  const btn = document.getElementById("advance-day-btn");
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Saving...`;
    try {
      const r = await api.post("/students/me/advance-day", {});
      if (r.weekCompleted) {
        footer.innerHTML = "";
        document.getElementById("day-body").innerHTML = `
          <div class="score-card" style="background:var(--card);">
            <p style="font-size:44px;">🏆</p>
            <p style="font-weight:800;font-size:21px;color:var(--brand);margin-top:6px;">Semaine ${r.weekCompleted} terminée !</p>
            <p style="font-size:14px;color:var(--text-muted);margin-top:6px;">7 jours complets. ${r.courseComplete ? "Tu as fini tout le programme, félicitations !" : "Bravo, la semaine suivante t'attend."}</p>
            <button class="btn btn-cta btn-block" style="margin-top:14px;" onclick="location.reload()">Continuer</button>
          </div>`;
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      window.location.reload();
    } catch (err) {
      if (handlePaywallError(err)) return;
      btn.disabled = false;
      btn.innerHTML = `${label} ${icon("chevronRight")}`;
      const reasons = err.data?.reasons;
      document.getElementById("advance-day-reasons").innerHTML = (reasons?.length ? reasons : [err.message])
        .map((r) => `<p style="font-size:14px;font-weight:700;color:var(--danger);margin-top:6px;">⚠️ ${esc(r)}</p>`).join("");
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
