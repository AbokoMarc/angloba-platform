// frontend/student/speaking-lab.js
//
// Speaking Lab — conversation vocale en temps reel avec un personnage IA.
//
// Pipeline :
//   1) Reconnaissance vocale navigateur (Web Speech API, SpeechRecognition)
//      transcrit ce que l'eleve dit -> texte.
//   2) Le texte est envoye a POST /api/speaking/turn -> le backend appelle
//      Claude (server-side, cle API jamais exposee au navigateur) qui repond
//      dans le personnage, calibre sur le niveau de l'eleve.
//   3) La reponse de l'IA est lue a voix haute (SpeechSynthesis) ET affichee.
//   4) A la fin, POST /api/speaking/finish -> l'IA note la session.
//
// Fallback : si SpeechRecognition n'est pas supporte (Firefox desktop,
// certains navigateurs), un champ texte apparait a la place du micro —
// aucune fonctionnalite n'est totalement bloquee.

let scenarios = [];
let activeScenario = null;
let history = []; // [{from:'ai'|'user', text}]
let recognizing = false;
let recognition = null;
let levelName = "Beginner";
let studentProfile = null;
let pastSessions = [];
let typeMode = false;

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSupported = Boolean(SpeechRecognitionAPI);
const TURN_GOAL = 5;

// Phrases d'aide cliquables pour les timides (sans micro, sans risque de rater la prononciation).
const HELP_CHIPS = {
  doctor: ["I have a sore throat", "I feel dizzy", "It's been 2 days"],
  restaurant: ["A table for two, please", "I would like a chicken", "The bill, please"],
  hotel: ["I have a reservation", "A room for two nights", "What time is breakfast?"],
  job: ["I have two years of experience", "I am a hard worker", "Thank you for your time"],
};
const GENERIC_CHIPS = ["Can you repeat, please?", "Sorry, I don't understand", "Can you speak slower?"];

function chipsFor(scn) {
  const k = `${scn.key} ${scn.title}`.toLowerCase();
  const hit = Object.keys(HELP_CHIPS).find((h) => k.includes(h));
  return [...(hit ? HELP_CHIPS[hit] : []), ...GENERIC_CHIPS].slice(0, 5);
}

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "speaking", title: "Speaking Lab" });
  if (!ctx) return;

  try {
    const [{ scenarios: list }, { profile }, hist] = await Promise.all([
      api.get("/courses/speaking-scenarios"),
      api.get("/students/me/dashboard"),
      api.get("/speaking/history").catch(() => ({ sessions: [] })),
    ]);
    scenarios = list;
    studentProfile = profile;
    pastSessions = hist.sessions || [];
    levelName = studentLevel(profile);
    renderScenarioGrid();
  } catch (err) {
    if (handlePaywallError(err)) return;
    document.getElementById("speaking-root").innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
  }
})();

function sessionsFor(scn) {
  return pastSessions.filter((s) => s.title === scn.title);
}

function renderScenarioGrid() {
  const root = document.getElementById("speaking-root");
  const sub = document.querySelector("#shell-topbar .sub");
  if (!sub) document.querySelector("#shell-topbar > div").insertAdjacentHTML("beforeend", `<p class="sub" style="flex-basis:100%;font-weight:600;font-size:15px;color:var(--text-muted);margin-top:4px;">Practice real conversations with AI</p>`);

  const featured = scenarios.find((s) => !sessionsFor(s).length) || scenarios[0];

  root.innerHTML = `
    ${!speechSupported ? `<div class="bar-link danger">${icon("alert")}<span style="flex:1;font-size:13px;">Ton navigateur ne gère pas la reconnaissance vocale — tu pourras taper ou choisir tes réponses.</span></div>` : ""}
    <div class="pill-row" style="justify-content:center;">
      <span class="pill pill-green" style="font-size:14px;padding:8px 14px;">${icon("shield")} ${levelName}</span>
      <span class="pill pill-orange" style="font-size:14px;padding:8px 14px;">${icon("flame")} XP ${studentXp(studentProfile)}</span>
    </div>
    <div class="scn-grid" id="scenario-grid"></div>
    ${featured ? `
      <h2 class="sec-title">Featured conversation</h2>
      <button class="card scenario-card" data-key="${esc(featured.key)}" style="display:flex;gap:14px;align-items:center;text-align:left;background:var(--orange-soft);border:2px solid #F3CFA5;">
        <span class="avatar-emoji lg" style="width:76px;height:76px;font-size:40px;">${esc(featured.emoji)}</span>
        <span style="flex:1;min-width:0;">
          <b style="display:block;font-size:19px;color:var(--brand);">${esc(featured.title)}</b>
          <span style="font-size:13px;color:#6B3300;font-weight:600;">With ${esc(featured.ai_persona)}</span>
        </span>
        <span class="btn btn-cta btn-sm">Start</span>
      </button>` : ""}
  `;

  const grid = document.getElementById("scenario-grid");
  grid.innerHTML = scenarios.map((s) => {
    const done = sessionsFor(s);
    const best = done.length ? Math.max(...done.map((x) => x.scores?.overall || 0)) : 0;
    return `
    <button class="scn scenario-card" data-key="${esc(s.key)}">
      ${done.length ? "" : ""}
      <span class="scn-av">${esc(s.emoji)}</span>
      <h3>${esc(s.title)}</h3>
      <span class="meta"><span>${icon("star")} ${esc(s.level)}</span></span>
      ${done.length ? `
        <span class="mini">${done.length} session${done.length > 1 ? "s" : ""} · best ${best}%
          <span class="progress-bar" style="height:6px;margin-top:4px;display:block;"><span style="width:${Math.min(best, 100)}%;background:var(--green-2);"></span></span></span>` : ""}
      <span class="go">${done.length ? "Practice again" : "Try now"}</span>
    </button>`;
  }).join("");

  root.querySelectorAll(".scenario-card").forEach((btn) => {
    btn.addEventListener("click", () => startScenario(btn.dataset.key));
  });
}

function startScenario(key) {
  activeScenario = scenarios.find((s) => s.key === key);
  history = [{ from: "ai", text: activeScenario.ai_opening }];
  typeMode = !speechSupported;
  renderConversation();
  speak(activeScenario.ai_opening);
}

function personaName() {
  return (activeScenario.ai_persona || "").split(",")[0].replace(/^(a|an|the)\s+/i, "").trim() || "AI partner";
}

function renderConversation() {
  const root = document.getElementById("speaking-root");
  document.getElementById("shell-topbar").style.display = "none";
  root.innerHTML = `
    <div class="chat-shell">
      <div class="chat-head">
        <button class="round-btn" id="back-btn" aria-label="Back">${icon("chevronLeft")}</button>
        <h1 style="font-size:24px;font-weight:800;color:var(--brand);flex:1;min-width:0;">${esc(activeScenario.title)}</h1>
        <span class="avatar-emoji md">${esc(activeScenario.emoji)}</span>
      </div>
      <div class="card row-between" style="padding:12px 14px;">
        <span class="row" style="gap:10px;min-width:0;">
          <span class="avatar-emoji sm">${esc(activeScenario.emoji)}</span>
          <span style="font-size:13px;font-weight:700;color:#3F5A4F;line-height:1.25;min-width:0;">${esc(personaName())} · AI Speaking Partner</span>
        </span>
        <span class="pill pill-green" id="xp-pill">${icon("bolt")} XP +0</span>
      </div>
      <div class="q-progress"><span id="turn-pct">0%</span><div class="progress-bar"><span id="turn-bar" style="width:0%;"></span></div><span id="turn-count">0/${TURN_GOAL} turns</span></div>

      <div class="chat-window" id="chat-window"></div>

      <div class="voice-panel" id="voice-panel"></div>
      <button class="btn btn-primary btn-block" id="finish-btn">Finish & get my score</button>
    </div>
  `;

  document.getElementById("back-btn").addEventListener("click", leaveConversation);
  document.getElementById("finish-btn").addEventListener("click", finishSession);

  renderChatMessages();
  renderVoicePanel();
}

function leaveConversation() {
  if (recognizing && recognition) { try { recognition.stop(); } catch {} }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  document.getElementById("shell-topbar").style.display = "";
  activeScenario = null;
  renderScenarioGrid();
}

function userTurns() { return history.filter((m) => m.from === "user").length; }

function updateTurnProgress() {
  const n = userTurns();
  const pct = Math.min(100, Math.round((n / TURN_GOAL) * 100));
  const set = (id, fn) => { const el = document.getElementById(id); if (el) fn(el); };
  set("turn-pct", (el) => (el.textContent = `${pct}%`));
  set("turn-bar", (el) => (el.style.width = `${pct}%`));
  set("turn-count", (el) => (el.textContent = `${Math.min(n, TURN_GOAL)}/${TURN_GOAL} turns`));
  set("xp-pill", (el) => (el.innerHTML = `${icon("bolt")} XP +${n * 5}`));
}

function renderChatMessages(extra = "") {
  const chatWindow = document.getElementById("chat-window");
  chatWindow.innerHTML = history.map((m) => m.from === "ai"
    ? `<div class="msg ai"><span class="avatar-emoji sm">${esc(activeScenario.emoji)}</span><div class="chat-bubble ai">${esc(m.text)}</div></div>`
    : `<div class="msg user"><div class="chat-bubble user">${esc(m.text)}</div></div>`).join("") + extra;
  chatWindow.lastElementChild?.scrollIntoView({ block: "end", behavior: "smooth" });
  updateTurnProgress();
}

function renderVoicePanel(status) {
  const panel = document.getElementById("voice-panel");
  if (!panel) return;
  const chips = chipsFor(activeScenario);
  const defaultStatus = typeMode ? "Type or tap a phrase below." : "Tap the mic and speak your answer.";

  panel.innerHTML = `
    <p class="voice-status" id="status-line">${status || defaultStatus}</p>
    ${typeMode ? `
      <div class="row" style="gap:8px;margin:8px 0 12px;">
        <input type="text" id="text-input" placeholder="Type your answer..." style="flex:1;min-height:50px;border-radius:14px;font-size:16px;" />
        <button class="btn btn-cta" id="send-text-btn" aria-label="Send">${icon("send")}</button>
      </div>` : `
      <div class="mic-wrap" id="mic-wrap"><i class="ring"></i><i class="ring r2"></i>
        <button class="mic-btn" id="mic-btn" aria-label="Speak">${icon("mic")}</button>
      </div>`}
    <div class="chips scroll" style="justify-content:flex-start;">
      ${chips.map((c) => `<button class="chip help-chip" data-text="${esc(c)}">${icon("chat")} ${esc(c)}</button>`).join("")}
    </div>
    <div class="chat-actions">
      <button class="chip" id="replay-btn">${icon("replay")} Replay</button>
      ${speechSupported ? `<button class="chip" id="mode-btn">${icon(typeMode ? "mic" : "keyboard")} ${typeMode ? "Use mic" : "Type"}</button>` : ""}
    </div>
  `;

  panel.querySelector("#mic-btn")?.addEventListener("click", toggleRecording);
  panel.querySelector("#replay-btn").addEventListener("click", () => {
    const last = [...history].reverse().find((m) => m.from === "ai");
    if (last) speak(last.text);
  });
  panel.querySelector("#mode-btn")?.addEventListener("click", () => { typeMode = !typeMode; renderVoicePanel(); });
  panel.querySelectorAll(".help-chip").forEach((b) => b.addEventListener("click", () => submitStudentTurn(b.dataset.text)));
  const input = panel.querySelector("#text-input");
  if (input) {
    const send = () => { if (input.value.trim()) { submitStudentTurn(input.value.trim()); input.value = ""; } };
    panel.querySelector("#send-text-btn").addEventListener("click", send);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
  }
}

function setLive(on) {
  document.getElementById("mic-wrap")?.classList.toggle("live", on);
  document.getElementById("mic-btn")?.classList.toggle("recording", on);
}

function toggleRecording() {
  if (recognizing) {
    recognition.stop();
    return;
  }
  recognition = new SpeechRecognitionAPI();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    recognizing = true;
    setLive(true);
    setStatus("Listening...");
  };
  recognition.onerror = (e) => {
    recognizing = false;
    setLive(false);
    setStatus(e.error === "not-allowed" ? "Micro bloqué — autorise-le, ou tape/choisis une phrase." : `Mic error (${e.error}). Try again or tap a phrase.`);
  };
  recognition.onend = () => {
    recognizing = false;
    setLive(false);
  };
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    submitStudentTurn(transcript);
  };
  recognition.start();
}

async function submitStudentTurn(text) {
  history.push({ from: "user", text });
  renderChatMessages(`<div class="msg ai" id="typing"><span class="avatar-emoji sm">${esc(activeScenario.emoji)}</span><div class="chat-bubble ai" style="color:var(--text-muted);">...</div></div>`);
  setStatus("Thinking...");

  try {
    const { reply } = await api.post("/speaking/turn", {
      scenarioKey: activeScenario.key,
      level: levelName,
      history: history.slice(0, -1),
      studentMessage: text,
    });
    history.push({ from: "ai", text: reply });
    renderChatMessages();
    speak(reply);
    setStatus(typeMode ? "Type or tap a phrase below." : "Tap the mic and speak your answer.");
  } catch (err) {
    document.getElementById("typing")?.remove();
    if (handlePaywallError(err)) return;
    setStatus(`⚠️ ${err.message}`);
  }
}

function setStatus(text) {
  const el = document.getElementById("status-line");
  if (el) el.textContent = text;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

async function finishSession() {
  const finishBtn = document.getElementById("finish-btn");
  finishBtn.disabled = true;
  finishBtn.innerHTML = `<span class="spinner"></span> Scoring...`;

  try {
    const { scores } = await api.post("/speaking/finish", {
      scenarioKey: activeScenario.key,
      level: levelName,
      transcript: history,
    });
    renderResults(scores);
  } catch (err) {
    if (handlePaywallError(err)) return;
    finishBtn.disabled = false;
    finishBtn.textContent = "Finish & get my score";
    setStatus(`⚠️ ${err.message}`);
  }
}

function renderResults(scores) {
  const root = document.getElementById("speaking-root");
  document.getElementById("shell-topbar").style.display = "";
  const ok = scores.overall >= 60;
  root.innerHTML = `
    <div class="hero" style="text-align:center;">
      <p style="font-size:34px;">🎉</p>
      <h2>Speaking Result</h2>
      <p class="muted" style="margin-top:2px;">${esc(activeScenario.title)}</p>
      <p style="font-size:52px;font-weight:800;color:var(--orange-2);margin-top:10px;line-height:1;">${scores.overall}%</p>
      <p class="muted">Overall score</p>
    </div>
    <div class="list-card">
      ${[["pronunciation", "mic"], ["fluency", "bolt"], ["grammar", "check"], ["vocabulary", "book"]].map(([k, ic]) => `
        <div class="skill"><span class="s-ico">${icon(ic)}</span><span style="text-transform:capitalize;">${k}</span>
          <div class="progress-bar"><span style="width:${scores[k]}%;"></span></div><span class="pv">${scores[k]}%</span></div>`).join("")}
    </div>
    <div class="tip-banner">${icon("bulb")}<span style="font-size:14.5px;">${esc(scores.feedback || (ok ? "Great job! Keep practicing." : "Good start — practice again to improve."))}</span></div>
    <button class="btn btn-cta btn-block sticky-cta" id="back-btn">${icon("replay")} Practice another conversation</button>
  `;
  document.getElementById("back-btn").addEventListener("click", async () => {
    try { const h = await api.get("/speaking/history"); pastSessions = h.sessions || []; } catch {}
    activeScenario = null; renderScenarioGrid();
  });
}
