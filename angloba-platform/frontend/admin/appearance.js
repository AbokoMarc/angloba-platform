// frontend/admin/appearance.js

const THEME_PRESETS = [
  { name: "Academy (Default)", primary: "#0F2544", accent: "#E8834A" },
  { name: "Forest", primary: "#123524", accent: "#E8834A" },
  { name: "Royal", primary: "#2C2560", accent: "#E0499A" },
  { name: "Slate Modern", primary: "#15181D", accent: "#30B8D6" },
  { name: "Midnight", primary: "#0B0D14", accent: "#8B7CF6" },
];
const LOGO_GLYPHS = ["E", "🦉", "🎓", "🧭", "🚀"];
const NAV_ICON_OPTIONS = ["grid", "compass", "book", "mic", "bookmark", "file", "chart", "headphones", "pen"];

let appearance = null;

(async () => {
  const ctx = await renderShell({ roles: ["admin", "superadmin"], activeKey: "appearance", title: "Appearance", subtitle: "Customize your platform" });
  if (!ctx) return;

  try {
    ({ appearance } = await api.get("/appearance"));
    render();
  } catch (err) {
    document.getElementById("appearance-root").innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();

function render() {
  const root = document.getElementById("appearance-root");
  root.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 320px;gap:16px;" id="appearance-layout">
      <div class="stack">
        <div class="card">
          <p style="font-weight:600;font-size:14px;margin-bottom:10px;">Theme Presets</p>
          <div class="stack" style="gap:4px;" id="theme-presets"></div>
        </div>
        <div class="card">
          <p style="font-weight:600;font-size:14px;margin-bottom:10px;">Branding</p>
          <div class="field"><label>Platform Name</label><input type="text" id="ap-name" value="${escapeAttr(appearance.platform_name)}" /></div>
          <div class="field"><label>Tagline</label><input type="text" id="ap-tagline" value="${escapeAttr(appearance.tagline)}" /></div>
          <label>Logo</label>
          <div class="row" style="margin-top:4px;" id="logo-picker"></div>
        </div>
        <div class="card">
          <p style="font-weight:600;font-size:14px;margin-bottom:4px;">Navigation Items (Student space)</p>
          <p style="font-size:11.5px;color:var(--text-muted);margin-bottom:10px;">Renomme les onglets et change leur icône. Aucun onglet ne peut être renommé pour tromper l'élève — mais tu peux personnaliser librement les libellés et l'ordre.</p>
          <div class="stack" style="gap:8px;" id="nav-items-editor"></div>
          <p style="font-size:11px;color:var(--text-muted);margin-top:8px;">Astuce : garde les 7 clés fonctionnelles (dashboard, journey, lesson, speaking, vocabulary, compositions, progress) — seuls les libellés/icônes affichés changent.</p>
        </div>
        <button class="btn btn-primary btn-block" id="save-appearance-btn">Save & Apply Changes</button>
        <p id="save-status" style="font-size:12.5px;text-align:center;"></p>
      </div>

      <div style="position:sticky;top:16px;height:fit-content;">
        <p style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;">Live Preview</p>
        <div class="card" style="padding:0;overflow:hidden;" id="live-preview"></div>
      </div>
    </div>
  `;

  document.getElementById("theme-presets").innerHTML = THEME_PRESETS.map((p) => `
    <button class="theme-preset-btn row-between" data-primary="${p.primary}" data-accent="${p.accent}" style="padding:8px 10px;border-radius:10px;background:${p.primary === appearance.theme_primary ? "var(--row)" : "transparent"};">
      <span class="row"><span style="width:16px;height:16px;border-radius:999px;background:${p.primary};"></span><span style="width:16px;height:16px;border-radius:999px;background:${p.accent};margin-left:-6px;"></span><span style="font-size:13px;">${p.name}</span></span>
      ${p.primary === appearance.theme_primary ? icon("check") : ""}
    </button>`).join("");

  document.querySelectorAll(".theme-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      appearance.theme_primary = btn.dataset.primary;
      appearance.theme_accent = btn.dataset.accent;
      render();
    });
  });

  document.getElementById("logo-picker").innerHTML = LOGO_GLYPHS.map((g) => `
    <button class="logo-pick-btn" data-g="${g}" style="width:36px;height:36px;border-radius:10px;border:1.5px solid ${g === appearance.logo_glyph ? "var(--accent)" : "var(--border)"};background:${g === appearance.logo_glyph ? "var(--row)" : "#fff"};font-weight:700;">${g}</button>`).join("");
  document.querySelectorAll(".logo-pick-btn").forEach((btn) => {
    btn.addEventListener("click", () => { appearance.logo_glyph = btn.dataset.g; render(); });
  });

  const navEditor = document.getElementById("nav-items-editor");
  navEditor.innerHTML = appearance.nav_items.map((item, idx) => `
    <div class="row">
      <input type="text" class="nav-label-input" data-idx="${idx}" value="${escapeAttr(item.label)}" style="flex:1;" />
      <select class="nav-icon-select" data-idx="${idx}" style="width:110px;">
        ${NAV_ICON_OPTIONS.map((ic) => `<option value="${ic}" ${ic === item.icon ? "selected" : ""}>${ic}</option>`).join("")}
      </select>
    </div>`).join("");

  navEditor.querySelectorAll(".nav-label-input").forEach((input) => {
    input.addEventListener("input", () => { appearance.nav_items[input.dataset.idx].label = input.value; updatePreview(); });
  });
  navEditor.querySelectorAll(".nav-icon-select").forEach((sel) => {
    sel.addEventListener("change", () => { appearance.nav_items[sel.dataset.idx].icon = sel.value; updatePreview(); });
  });

  document.getElementById("ap-name").addEventListener("input", (e) => { appearance.platform_name = e.target.value; updatePreview(); });
  document.getElementById("ap-tagline").addEventListener("input", (e) => { appearance.tagline = e.target.value; updatePreview(); });

  document.getElementById("save-appearance-btn").addEventListener("click", saveAppearance);

  updatePreview();
}

function updatePreview() {
  const preview = document.getElementById("live-preview");
  preview.innerHTML = `
    <div style="padding:8px 12px;background:#eee;display:flex;gap:5px;"><span style="width:8px;height:8px;border-radius:999px;background:#f88;"></span><span style="width:8px;height:8px;border-radius:999px;background:#fd6;"></span><span style="width:8px;height:8px;border-radius:999px;background:#8d8;"></span></div>
    <div style="display:flex;min-height:260px;">
      <div style="width:90px;background:${appearance.theme_primary};padding:8px;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:4px;margin-bottom:10px;">
          <span style="width:16px;height:16px;border-radius:5px;background:${appearance.theme_accent};color:${appearance.theme_primary};font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;">${appearance.logo_glyph}</span>
          <span style="font-size:8px;color:#fff;font-weight:600;">${appearance.platform_name}</span>
        </div>
        ${appearance.nav_items.slice(0, 5).map((item, i) => `<p style="font-size:7.5px;padding:3px 5px;border-radius:4px;margin-bottom:2px;background:${i === 0 ? "rgba(255,255,255,.12)" : "transparent"};color:${i === 0 ? "#fff" : "rgba(255,255,255,.5)"};">${item.label}</p>`).join("")}
      </div>
      <div style="flex:1;background:#F4F2ED;padding:10px;">
        <div style="border-radius:8px;padding:8px;color:#fff;background:${appearance.theme_primary};margin-bottom:8px;">
          <p style="font-size:7px;color:rgba(255,255,255,.5);">${appearance.tagline}</p>
          <p style="font-size:9px;font-weight:600;">Good evening, Jean 👋</p>
          <div style="width:100%;height:3px;border-radius:999px;background:rgba(255,255,255,.2);margin-top:6px;overflow:hidden;"><div style="width:60%;height:100%;background:${appearance.theme_accent};"></div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
          ${["Listening", "Speaking", "Vocabulary", "Writing"].map((l) => `<div style="background:#fff;border-radius:6px;padding:5px 7px;font-size:7px;color:#666;">${l}</div>`).join("")}
        </div>
      </div>
    </div>
  `;
}

async function saveAppearance() {
  const status = document.getElementById("save-status");
  status.textContent = "Saving...";
  try {
    await api.put("/appearance", {
      platformName: appearance.platform_name,
      tagline: appearance.tagline,
      logoGlyph: appearance.logo_glyph,
      themePrimary: appearance.theme_primary,
      themeAccent: appearance.theme_accent,
      navItems: appearance.nav_items,
    });
    status.textContent = "✅ Saved & applied.";
    document.documentElement.style.setProperty("--primary", appearance.theme_primary);
    document.documentElement.style.setProperty("--accent", appearance.theme_accent);
  } catch (err) {
    status.textContent = `⚠️ ${err.message}`;
  }
}

function escapeAttr(str) { return String(str).replace(/"/g, "&quot;"); }
