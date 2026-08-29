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
let studentLevel = "Beginner";

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSupported = Boolean(SpeechRecognitionAPI);

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "speaking", title: "Speaking Lab", subtitle: "Practice real-life conversations" });
  if (!ctx) return;

  try {
    const [{ scenarios: list }, { profile }] = await Promise.all([
      api.get("/courses/speaking-scenarios"),
      api.get("/students/me/dashboard"),
    ]);
    scenarios = list;
    studentLevel = inferLevelFromMonth(profile?.current_month || 1);
    renderScenarioGrid();
  } catch (err) {
    if (handlePaywallError(err)) return;
    document.getElementById("speaking-root").innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();

function inferLevelFromMonth(month) {
  if (month <= 3) return "Beginner";
  if (month <= 6) return "Intermediate";
  return "Advanced";
}

function renderScenarioGrid() {
  const root = document.getElementById("speaking-root");
  root.innerHTML = `
    ${!speechSupported ? `<div class="card" style="background:var(--danger-bg);color:var(--danger);font-size:12.5px;">${icon("alert")} Ton navigateur ne supporte pas la reconnaissance vocale automatique — tu pourras taper tes réponses à la place.</div>` : ""}
    <p style="font-size:13px;color:var(--text-muted);">Choose a scenario to begin. Your level: <b>${studentLevel}</b></p>
    <div class="grid grid-3" id="scenario-grid"></div>
  `;
  const grid = document.getElementById("scenario-grid");
  grid.innerHTML = scenarios.map((s) => `
    <button class="card scenario-card" data-key="${s.key}" style="text-align:left;">
      <p style="font-size:24px;">${s.emoji}</p>
      <p style="font-weight:600;font-size:13.5px;margin-top:6px;">${s.title}</p>
      <span class="badge badge-accent" style="margin-top:6px;">${s.level}</span>
    </button>
  `).join("");
  grid.querySelectorAll(".scenario-card").forEach((btn) => {
    btn.addEventListener("click", () => startScenario(btn.dataset.key));
  });
}

function startScenario(key) {
  activeScenario = scenarios.find((s) => s.key === key);
  history = [{ from: "ai", text: activeScenario.ai_opening }];
  renderConversation();
  speak(activeScenario.ai_opening);
}

function renderConversation() {
  const root = document.getElementById("speaking-root");
  root.innerHTML = `
    <button class="btn btn-outline btn-sm" id="back-btn" style="width:fit-content;">${icon("arrowRight")} New scenario</button>
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="row" style="background:var(--primary);color:#fff;padding:10px 16px;font-size:12.5px;">
        <span style="width:7px;height:7px;border-radius:999px;background:#4ADE80;"></span>
        AI is playing: ${activeScenario.ai_persona}
      </div>
      <div class="chat-window" id="chat-window"></div>
      <div style="padding:16px;border-top:1px solid var(--border);background:var(--row);">
        <div id="voice-controls" style="text-align:center;"></div>
        <div id="text-fallback" style="display:none;gap:8px;" class="row"></div>
        <p id="status-line" style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:10px;"></p>
      </div>
    </div>
    <button class="btn btn-outline btn-block" id="finish-btn">Finish & get my score</button>
  `;

  document.getElementById("back-btn").addEventListener("click", () => { activeScenario = null; renderScenarioGrid(); });
  document.getElementById("finish-btn").addEventListener("click", finishSession);

  renderChatMessages();
  setupInputControls();
}

function renderChatMessages() {
  const chatWindow = document.getElementById("chat-window");
  chatWindow.innerHTML = history.map((m) => `<div class="chat-bubble ${m.from}">${escapeHtml(m.text)}</div>`).join("");
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function setupInputControls() {
  const voiceControls = document.getElementById("voice-controls");
  const textFallback = document.getElementById("text-fallback");
  const statusLine = document.getElementById("status-line");

  if (speechSupported) {
    voiceControls.style.display = "block";
    textFallback.style.display = "none";
    voiceControls.innerHTML = `<button class="mic-btn" id="mic-btn">${icon("mic")}</button>`;
    statusLine.textContent = "Tap the mic and speak your answer clearly.";
    document.getElementById("mic-btn").addEventListener("click", toggleRecording);
  } else {
    voiceControls.style.display = "none";
    textFallback.style.display = "flex";
    textFallback.innerHTML = `
      <input type="text" id="text-input" placeholder="Type your answer..." style="flex:1;" />
      <button class="btn btn-accent" id="send-text-btn">Send</button>
    `;
    document.getElementById("send-text-btn").addEventListener("click", () => {
      const input = document.getElementById("text-input");
      if (input.value.trim()) { submitStudentTurn(input.value.trim()); input.value = ""; }
    });
    document.getElementById("text-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("send-text-btn").click();
    });
  }
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
    document.getElementById("mic-btn").classList.add("recording");
    document.getElementById("status-line").textContent = "Listening...";
  };
  recognition.onerror = (e) => {
    recognizing = false;
    document.getElementById("mic-btn")?.classList.remove("recording");
    document.getElementById("status-line").textContent = `Mic error (${e.error}). Try again.`;
  };
  recognition.onend = () => {
    recognizing = false;
    document.getElementById("mic-btn")?.classList.remove("recording");
  };
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    submitStudentTurn(transcript);
  };
  recognition.start();
}

async function submitStudentTurn(text) {
  history.push({ from: "user", text });
  renderChatMessages();
  setStatus("Thinking...");

  try {
    const { reply } = await api.post("/speaking/turn", {
      scenarioKey: activeScenario.key,
      level: studentLevel,
      history: history.slice(0, -1),
      studentMessage: text,
    });
    history.push({ from: "ai", text: reply });
    renderChatMessages();
    speak(reply);
    setStatus(speechSupported ? "Tap the mic and speak your answer clearly." : "Type your answer...");
  } catch (err) {
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
      level: studentLevel,
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
  root.innerHTML = `
    <button class="btn btn-outline btn-sm" id="back-btn" style="width:fit-content;">${icon("arrowRight")} New scenario</button>
    <div class="card" style="background:var(--primary);color:#fff;text-align:center;">
      <p style="font-size:30px;">🎉</p>
      <h2 style="color:#fff;font-size:20px;">Speaking Result</h2>
      <p style="color:rgba(255,255,255,.5);font-size:12px;margin-top:4px;">${activeScenario.title}</p>
      <p style="font-size:40px;font-weight:800;color:var(--accent);margin-top:10px;">${scores.overall}%</p>
      <p style="color:rgba(255,255,255,.5);font-size:12px;">Overall score</p>
    </div>
    <div class="grid grid-2">
      ${["pronunciation", "fluency", "grammar", "vocabulary"].map((k) => `
        <div class="card" style="text-align:center;">
          <p style="font-size:22px;font-weight:700;color:var(--accent);">${scores[k]}%</p>
          <p style="font-size:11.5px;color:var(--text-muted);text-transform:capitalize;">${k}</p>
        </div>`).join("")}
    </div>
    <div class="card">
      <p style="font-weight:600;font-size:13px;margin-bottom:6px;">Feedback</p>
      <p style="font-size:13px;color:var(--text-muted);">${scores.feedback || ""}</p>
    </div>
  `;
  document.getElementById("back-btn").addEventListener("click", () => { activeScenario = null; renderScenarioGrid(); });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
