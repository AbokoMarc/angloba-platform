// frontend/admin/admins.js
// Reserve au SUPER ADMIN — roles:['superadmin'] fait que tout autre role
// est automatiquement redirige vers son propre espace par shell.js.

const PERMISSION_LABELS = {
  can_manage_teachers: "Manage teachers",
  can_manage_students: "Manage / reassign students",
  can_manage_courses: "Edit course content (Course Builder)",
  can_manage_appearance: "Edit appearance (theme, logo, nav)",
  can_manage_media: "Upload audio (listening / speaking)",
};

let adminsList = [];

(async () => {
  const ctx = await renderShell({ roles: ["superadmin"], activeKey: "admins", title: "Admins", subtitle: "Only you can create admins and set their rights" });
  if (!ctx) return;
  await load();
})();

async function load() {
  try {
    const { admins } = await api.get("/admins");
    adminsList = admins;
    render();
  } catch (err) {
    document.getElementById("admins-root").innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
}

// Rafraîchit uniquement les cartes d'admins, sans toucher au formulaire
// (pour ne jamais effacer un mot de passe temporaire affiché à l'écran).
async function refreshAdminCardsOnly() {
  try {
    const { admins } = await api.get("/admins");
    adminsList = admins;
    drawCards();
    const line = document.getElementById("count-line");
    if (line) line.textContent = `${adminsList.length} admin(s)`;
  } catch (err) {
    console.error(err);
  }
}

function render() {
  const root = document.getElementById("admins-root");
  root.innerHTML = `
    <div class="card" style="background:color-mix(in srgb, var(--accent) 10%, white);font-size:12.5px;color:var(--primary);">
      ${icon("crown")} Toi seul peux créer des admins et changer leurs droits. Un admin ne peut jamais gérer d'autres admins.
    </div>
    <div class="row-between">
      <p style="font-size:13px;color:var(--text-muted);" id="count-line">${adminsList.length} admin(s)</p>
      <button class="btn btn-primary btn-sm" id="new-admin-btn">${icon("plus")} New Admin</button>
    </div>
    <div id="new-admin-form"></div>
    <div class="stack" id="admin-cards" style="gap:10px;"></div>
  `;
  document.getElementById("new-admin-btn").addEventListener("click", showForm);
  drawCards();
}

function showForm() {
  document.getElementById("new-admin-form").innerHTML = `
    <div class="card" style="border:1.5px solid var(--accent);">
      <p style="font-weight:600;font-size:13.5px;margin-bottom:10px;">New Admin Account</p>
      <div class="grid grid-2">
        <div class="field"><label>Full name</label><input type="text" id="a-name" /></div>
        <div class="field"><label>Email</label><input type="email" id="a-email" /></div>
      </div>
      <label>Permissions</label>
      <div class="stack" style="gap:6px;margin-bottom:12px;">
        ${Object.entries(PERMISSION_LABELS).map(([key, label]) => `
          <label style="display:flex;align-items:center;gap:8px;font-weight:400;font-size:13px;color:var(--text);">
            <input type="checkbox" class="perm-checkbox" data-perm="${key}" style="width:auto;" /> ${label}
          </label>`).join("")}
      </div>
      <div class="row"><button class="btn btn-primary btn-sm" id="create-admin-btn">Create Account</button><button class="btn btn-outline btn-sm" id="cancel-admin-btn">Cancel</button></div>
      <p id="create-result" style="font-size:12.5px;margin-top:8px;"></p>
    </div>
  `;
  document.getElementById("cancel-admin-btn").addEventListener("click", () => {
    document.getElementById("new-admin-form").innerHTML = "";
  });

  document.getElementById("create-admin-btn").addEventListener("click", async (e) => {
    const name = document.getElementById("a-name").value.trim();
    const email = document.getElementById("a-email").value.trim();
    if (!name || !email) return;
    const permissions = {};
    document.querySelectorAll(".perm-checkbox").forEach((cb) => { permissions[cb.dataset.perm] = cb.checked; });

    e.target.disabled = true;
    e.target.textContent = "Creating...";
    try {
      const { temporaryPassword } = await api.post("/admins", { name, email, permissions });

      // Meme principe que pour les profs : le message reste affiche tant que
      // l'admin ne clique pas explicitement sur "Fermer". La liste se
      // rafraichit en arriere-plan sans toucher a ce bloc.
      document.getElementById("new-admin-form").innerHTML = `
        <div class="card" style="border:1.5px solid var(--success);background:var(--success-bg);">
          <p style="font-weight:600;font-size:13.5px;color:var(--success);margin-bottom:8px;">✅ Compte admin créé pour ${escapeHtml(name)}</p>
          <p style="font-size:13px;margin-bottom:6px;">Email : <b>${escapeHtml(email)}</b></p>
          <p style="font-size:13px;margin-bottom:10px;">Mot de passe temporaire (affiché une seule fois, à communiquer à cette personne) :</p>
          <div class="row" style="gap:8px;">
            <code style="background:#fff;padding:8px 12px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:.03em;flex:1;">${escapeHtml(temporaryPassword)}</code>
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
        document.getElementById("new-admin-form").innerHTML = "";
      });

      refreshAdminCardsOnly();
    } catch (err) {
      document.getElementById("create-result").textContent = `⚠️ ${err.message}`;
      e.target.disabled = false;
      e.target.textContent = "Create Account";
    }
  });
}

function drawCards() {
  const wrap = document.getElementById("admin-cards");
  wrap.innerHTML = adminsList.length ? adminsList.map((a) => `
    <div class="card" style="${a.status !== "active" ? "opacity:.55;" : ""}">
      <div class="row-between">
        <div>
          <p style="font-weight:600;font-size:13.5px;">${a.name}</p>
          <p style="font-size:11px;color:var(--text-muted);">${a.email}</p>
        </div>
        <span class="badge ${a.status === "active" ? "badge-success" : "badge-muted"}">${a.status}</span>
      </div>
      <div class="stack" style="gap:6px;margin-top:12px;">
        ${Object.entries(PERMISSION_LABELS).map(([key, label]) => `
          <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;">
            <input type="checkbox" class="live-perm" data-id="${a.user_id}" data-perm="${key}" ${a[key] ? "checked" : ""} style="width:auto;" /> ${label}
          </label>`).join("")}
      </div>
      <button class="btn btn-sm ${a.status === "active" ? "btn-danger" : "btn-success"} btn-block" style="margin-top:12px;" data-toggle-id="${a.user_id}" data-status="${a.status}">${a.status === "active" ? "Disable" : "Enable"}</button>
    </div>`).join("") : `<div class="empty-state">Aucun admin pour l'instant.</div>`;

  wrap.querySelectorAll(".live-perm").forEach((cb) => {
    cb.addEventListener("change", async () => {
      await api.patch(`/admins/${cb.dataset.id}/permissions`, { [cb.dataset.perm]: cb.checked });
    });
  });
  wrap.querySelectorAll("button[data-toggle-id]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const newStatus = btn.dataset.status === "active" ? "inactive" : "active";
      await api.patch(`/admins/${btn.dataset.toggleId}/status`, { status: newStatus });
      await refreshAdminCardsOnly();
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}