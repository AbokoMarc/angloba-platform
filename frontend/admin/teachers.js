// frontend/admin/teachers.js

let teachersList = [];

(async () => {
  const ctx = await renderShell({ roles: ["admin", "superadmin"], activeKey: "teachers", title: "Teachers" });
  if (!ctx) return;
  await load();
})();

async function load() {
  const root = document.getElementById("teachers-root");
  try {
    const { teachers } = await api.get("/teachers");
    teachersList = teachers;
    render();
  } catch (err) {
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
}

// Rafraîchit uniquement la liste des profs (fetch + redessine les cartes),
// SANS toucher au formulaire d'ajout — pour ne jamais effacer un mot de
// passe temporaire affiché à l'écran.
async function refreshTeacherCardsOnly() {
  try {
    const { teachers } = await api.get("/teachers");
    teachersList = teachers;
    drawCards();
    updateCountLine();
  } catch (err) {
    console.error(err);
  }
}

function updateCountLine() {
  const active = teachersList.filter((t) => t.status === "active").length;
  const line = document.getElementById("count-line");
  if (line) line.textContent = `${active} active · ${teachersList.length} total`;
}

function render() {
  const root = document.getElementById("teachers-root");
  const active = teachersList.filter((t) => t.status === "active").length;

  root.innerHTML = `
    <div class="row-between">
      <p style="font-size:13px;color:var(--text-muted);" id="count-line">${active} active · ${teachersList.length} total</p>
      <button class="btn btn-primary btn-sm" id="new-teacher-btn">${icon("plus")} Add Teacher</button>
    </div>
    <div id="new-teacher-form"></div>
    <div class="grid grid-2" id="teacher-cards"></div>
  `;

  document.getElementById("new-teacher-btn").addEventListener("click", showForm);
  drawCards();
}

function showForm() {
  document.getElementById("new-teacher-form").innerHTML = `
    <div class="card" style="border:1.5px solid var(--accent);">
      <p style="font-weight:600;font-size:13.5px;margin-bottom:10px;">New Teacher Account</p>
      <div class="grid grid-2">
        <div class="field"><label>Full name</label><input type="text" id="t-name" /></div>
        <div class="field"><label>Email</label><input type="email" id="t-email" /></div>
      </div>
      <p style="font-size:11.5px;color:var(--text-muted);margin-bottom:10px;">Un mot de passe temporaire sera généré — à communiquer au professeur.</p>
      <div class="row"><button class="btn btn-primary btn-sm" id="create-teacher-btn">Create Account</button><button class="btn btn-outline btn-sm" id="cancel-teacher-btn">Cancel</button></div>
      <p id="create-result" style="font-size:12.5px;margin-top:8px;"></p>
    </div>
  `;
  document.getElementById("cancel-teacher-btn").addEventListener("click", () => {
    document.getElementById("new-teacher-form").innerHTML = "";
  });

  document.getElementById("create-teacher-btn").addEventListener("click", async (e) => {
    const name = document.getElementById("t-name").value.trim();
    const email = document.getElementById("t-email").value.trim();
    if (!name || !email) return;
    e.target.disabled = true;
    e.target.textContent = "Creating...";
    try {
      const { temporaryPassword } = await api.post("/teachers", { name, email });

      // On remplace TOUT le contenu du formulaire par le résultat, qui reste
      // affiché tant que l'admin ne clique pas explicitement sur "Fermer".
      // La liste des profs se rafraîchit en arrière-plan, sans toucher à ce bloc.
      document.getElementById("new-teacher-form").innerHTML = `
        <div class="card" style="border:1.5px solid var(--success);background:var(--success-bg);">
          <p style="font-weight:600;font-size:13.5px;color:var(--success);margin-bottom:8px;">✅ Compte créé pour ${escapeHtml(name)}</p>
          <p style="font-size:13px;margin-bottom:6px;">Email : <b>${escapeHtml(email)}</b></p>
          <p style="font-size:13px;margin-bottom:10px;">Mot de passe temporaire (affiché une seule fois, à communiquer au professeur) :</p>
          <div class="row" style="gap:8px;">
            <code id="temp-pass-value" style="background:#fff;padding:8px 12px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:.03em;flex:1;">${escapeHtml(temporaryPassword)}</code>
            <button class="btn btn-outline btn-sm" id="copy-pass-btn">Copy</button>
          </div>
          <button class="btn btn-primary btn-sm" id="close-result-btn" style="margin-top:12px;">Fermer, j'ai noté le mot de passe</button>
        </div>
      `;

      document.getElementById("copy-pass-btn").addEventListener("click", async () => {
        await navigator.clipboard.writeText(temporaryPassword);
        const btn = document.getElementById("copy-pass-btn");
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = "Copy"), 1500);
      });

      document.getElementById("close-result-btn").addEventListener("click", () => {
        document.getElementById("new-teacher-form").innerHTML = "";
      });

      refreshTeacherCardsOnly(); // met à jour la liste sans effacer le message ci-dessus
    } catch (err) {
      document.getElementById("create-result").textContent = `⚠️ ${err.message}`;
      e.target.disabled = false;
      e.target.textContent = "Create Account";
    }
  });
}

function drawCards() {
  const wrap = document.getElementById("teacher-cards");
  wrap.innerHTML = teachersList.map((t) => `
    <div class="card" style="${t.status !== "active" ? "opacity:.55;" : ""}">
      <div class="row-between">
        <div class="row">
          <div style="width:32px;height:32px;border-radius:999px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">${initials(t.name)}</div>
          <div><p style="font-weight:600;font-size:13.5px;">${t.name}</p><p style="font-size:11px;color:var(--text-muted);">${t.email}</p></div>
        </div>
        <span class="badge ${t.status === "active" ? "badge-success" : "badge-muted"}">${t.status}</span>
      </div>
      <p style="font-size:11.5px;color:var(--text-muted);margin-top:10px;">${t.student_count} students</p>
      ${t.role !== "superadmin" ? `<button class="btn btn-sm ${t.status === "active" ? "btn-danger" : "btn-success"} btn-block" style="margin-top:8px;" data-id="${t.id}" data-status="${t.status}">${t.status === "active" ? "Disable" : "Enable"}</button>` : `<p style="font-size:11px;color:var(--accent);margin-top:8px;">${icon("crown")} Super Admin</p>`}
    </div>`).join("");

  wrap.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const newStatus = btn.dataset.status === "active" ? "inactive" : "active";
      await api.patch(`/teachers/${btn.dataset.id}`, { status: newStatus });
      await refreshTeacherCardsOnly();
    });
  });
}

function initials(name) { return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
