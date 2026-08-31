// frontend/student/lesson.js

let currentTab = "grammar";
let weekData = null;

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "lesson", title: "Current Lesson" });
  if (!ctx) return;

  const root = document.getElementById("lesson-root");

  // 1) Affichage INSTANTANE depuis le cache local (IndexedDB), sans attendre
  // le reseau — c'est ce qui permet a la page de s'ouvrir immediatement
  // meme hors-ligne, au lieu de rester bloquee sur un chargement infini.
  const lastWeekNum = Number(localStorage.getItem("angloba_last_week") || 1);
  const cached = await getCachedWeekData(lastWeekNum);
  if (cached) {
    weekData = cached;
    document.querySelector("#shell-topbar div").insertAdjacentHTML("beforeend", `<p class="sub">Week ${cached.week.number} · ${cached.week.grammar_title || ""}</p>`);
    renderLesson();
  } else {
    root.innerHTML = `<div class="empty-state"><span class="spinner"></span></div>`;
  }

  // 2) En arriere-plan, on tente de recuperer les donnees fraiches. Si ca
  // reussit, on met a jour le cache ET l'ecran. Si ca echoue (hors-ligne),
  // on ne fait rien de plus — l'utilisateur a deja le contenu ci-dessus.
  try {
    const { profile } = await api.get("/students/me/dashboard");
    const weekNum = profile?.current_week || 1;
    const fresh = await api.get(`/courses/weeks/${weekNum}`);
    weekData = fresh;
    localStorage.setItem("angloba_last_week", String(weekNum));
    cacheWeekData(weekNum, fresh);

    const topbarSub = document.querySelector("#shell-topbar .sub");
    if (topbarSub) topbarSub.textContent = `Week ${fresh.week.number} · ${fresh.week.grammar_title || ""}`;

    renderLesson();
  } catch (err) {
    if (handlePaywallError(err)) return;
    if (!cached) {
      root.innerHTML = `<div class="empty-state">📴 Impossible de charger ta leçon (hors-ligne et rien en cache pour l'instant). Connecte-toi une première fois à internet.</div>`;
    }
    // Si `cached` existe deja, l'utilisateur voit son contenu — on ne casse rien.
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
    if (!exercises.length) {
      tabContent.innerHTML = `<div class="empty-state">Pas encore d'exercices pour cette semaine.</div>` + renderCompleteWeekBlock(week);
      bindCompleteWeekButton(week);
      return;
    }

    const selections = new Array(exercises.length).fill(null);

    tabContent.innerHTML = exercises.map((ex, i) => `
      <div class="card" style="margin-bottom:10px;">
        <p style="font-size:13px;font-weight:600;margin-bottom:10px;">${i + 1}. ${ex.question}</p>
        <div class="stack" style="gap:6px;">
          ${ex.options.map((opt, oi) => `
            <button class="exo-select btn btn-outline" data-exo="${i}" data-idx="${oi}" style="justify-content:flex-start;text-align:left;">
              <span style="color:var(--text-muted);margin-right:6px;">${String.fromCharCode(65 + oi)}.</span>${opt}
            </button>`).join("")}
        </div>
      </div>
    `).join("") + `
      <button class="btn btn-primary btn-block" id="submit-exercises-btn" disabled>Submit Answers (0/${exercises.length})</button>
      <div id="exercises-result"></div>
    `;

    const submitBtn = document.getElementById("submit-exercises-btn");

    document.querySelectorAll(".exo-select").forEach((btn) => {
      btn.addEventListener("click", () => {
        const exoIdx = Number(btn.dataset.exo);
        const optIdx = Number(btn.dataset.idx);
        selections[exoIdx] = optIdx;

        document.querySelectorAll(`.exo-select[data-exo="${exoIdx}"]`).forEach((b) => {
          b.style.background = ""; b.style.borderColor = ""; b.style.color = "";
        });
        btn.style.background = "var(--row)"; btn.style.borderColor = "var(--primary)"; btn.style.color = "var(--primary)";

        const answeredCount = selections.filter((s) => s !== null).length;
        submitBtn.textContent = `Submit Answers (${answeredCount}/${exercises.length})`;
        submitBtn.disabled = answeredCount < exercises.length;
      });
    });

    submitBtn.addEventListener("click", async () => {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner"></span> Grading...`;

      // Hors-ligne : on corrige localement (le corrige est deja dans les
      // donnees en cache) et on met la vraie soumission en file d'attente
      // pour la prochaine reconnexion — l'eleve n'est jamais bloque.
      if (!navigator.onLine) {
        const results = exercises.map((ex, i) => selections[i] === ex.correct_index);
        const scorePct = Math.round((results.filter(Boolean).length / exercises.length) * 100);

        await queuePendingAction({
          url: `/courses/weeks/${week.number}/submit-exercises`,
          method: "post",
          body: { answers: selections },
          description: `Exercices semaine ${week.number}`,
        });

        exercises.forEach((ex, i) => {
          const isCorrect = results[i];
          const correctBtn = document.querySelector(`.exo-select[data-exo="${i}"][data-idx="${ex.correct_index}"]`);
          const chosenBtn = document.querySelector(`.exo-select[data-exo="${i}"][data-idx="${selections[i]}"]`);
          document.querySelectorAll(`.exo-select[data-exo="${i}"]`).forEach((b) => (b.style.pointerEvents = "none"));
          if (correctBtn) { correctBtn.style.background = "var(--success-bg)"; correctBtn.style.borderColor = "var(--success)"; correctBtn.style.color = "var(--success)"; }
          if (!isCorrect && chosenBtn) { chosenBtn.style.background = "var(--danger-bg)"; chosenBtn.style.borderColor = "var(--danger)"; chosenBtn.style.color = "var(--danger)"; }
        });

        document.getElementById("exercises-result").innerHTML = `
          <div class="card" style="text-align:center;background:var(--row);margin-top:10px;">
            <p style="font-size:22px;font-weight:800;">${scorePct}%</p>
            <p style="font-size:12.5px;color:var(--text-muted);">☁️ Résultat provisoire — sera confirmé et débloquera la semaine suivante dès ta reconnexion.</p>
          </div>
        `;
        submitBtn.remove();
        if (typeof updateOfflineIndicator === "function") updateOfflineIndicator();
        return;
      }

      try {
        const result = await api.post(`/courses/weeks/${week.number}/submit-exercises`, { answers: selections });

        // Colore chaque question selon la correction reelle renvoyee par le serveur.
        exercises.forEach((ex, i) => {
          const isCorrect = result.results[i];
          const correctBtn = document.querySelector(`.exo-select[data-exo="${i}"][data-idx="${ex.correct_index}"]`);
          const chosenBtn = document.querySelector(`.exo-select[data-exo="${i}"][data-idx="${selections[i]}"]`);
          document.querySelectorAll(`.exo-select[data-exo="${i}"]`).forEach((b) => (b.style.pointerEvents = "none"));
          if (correctBtn) { correctBtn.style.background = "var(--success-bg)"; correctBtn.style.borderColor = "var(--success)"; correctBtn.style.color = "var(--success)"; }
          if (!isCorrect && chosenBtn) { chosenBtn.style.background = "var(--danger-bg)"; chosenBtn.style.borderColor = "var(--danger)"; chosenBtn.style.color = "var(--danger)"; }
        });

        document.getElementById("exercises-result").innerHTML = `
          <div class="card" style="text-align:center;background:${result.passed ? "var(--success-bg)" : "var(--danger-bg)"};color:${result.passed ? "var(--success)" : "var(--danger)"};margin-top:10px;">
            <p style="font-size:22px;font-weight:800;">${result.scorePct}%</p>
            <p style="font-size:12.5px;">${result.passed ? `Réussi ! (minimum ${result.passThreshold}%)` : `Pas encore assez (minimum ${result.passThreshold}%) — retente depuis l'onglet Grammar.`}</p>
          </div>
          ${renderCompleteWeekBlock(week)}
        `;
        bindCompleteWeekButton(week);
        submitBtn.remove();
      } catch (err) {
        if (handlePaywallError(err)) return;
        submitBtn.disabled = false;
        submitBtn.textContent = "Retry";
        alert(err.message);
      }
    });
    return;
  }
}

function bindCompleteWeekButton(week) {
  const completeBtn = document.getElementById("complete-week-btn");
  if (completeBtn) {
    completeBtn.addEventListener("click", async () => {
      completeBtn.disabled = true;
      completeBtn.textContent = "Saving...";
      try {
        const { currentWeek } = await api.post("/students/me/advance-week", {});
        completeBtn.textContent = `✅ Week complete! Moving to Week ${currentWeek}...`;
        setTimeout(() => { window.location.href = "/student/dashboard.html"; }, 1200);
      } catch (err) {
        completeBtn.textContent = `Mark Week ${week.number} complete → Continue to Week ${week.number + 1}`;
        completeBtn.disabled = false;
        const reasons = err.data?.reasons;
        const box = document.getElementById("complete-week-reasons");
        if (box) {
          box.innerHTML = reasons?.length
            ? reasons.map((r) => `<p style="font-size:12.5px;color:var(--danger);margin-top:6px;">⚠️ ${r}</p>`).join("")
            : `<p style="font-size:12.5px;color:var(--danger);margin-top:6px;">⚠️ ${err.message}</p>`;
        }
      }
    });
  }
}

function renderCompleteWeekBlock(week) {
  if (week.number >= 36) {
    return `<div class="card" style="text-align:center;background:var(--success-bg);color:var(--success);">🎉 Tu es sur la dernière semaine du programme !</div>`;
  }
  return `
    <div class="card" style="text-align:center;">
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:10px;">Terminé la grammaire, le vocabulaire et les exercices de cette semaine ?</p>
      <button class="btn btn-primary" id="complete-week-btn">Mark Week ${week.number} complete → Continue to Week ${week.number + 1}</button>
      <div id="complete-week-reasons"></div>
    </div>
  `;
}
