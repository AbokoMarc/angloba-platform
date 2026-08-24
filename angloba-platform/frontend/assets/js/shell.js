// frontend/assets/js/shell.js
//
// Coeur de la separation par role. Chaque page protegee appelle :
//
//   renderShell({ roles: ['student'], activeKey: 'dashboard', title: '...', subtitle: '...' })
//
// Cette fonction :
//  1) Verifie le token aupres de /api/auth/me. Si invalide -> renvoie vers
//     la bonne page de connexion (jamais de contenu affiche entre-temps).
//  2) Si le role de l'utilisateur n'est PAS dans `roles` -> redirige vers
//     SON espace normal (un eleve ne peut jamais atterrir sur une page
//     professeur/admin, meme en tapant l'URL directement).
//  3) Applique le theme (couleurs/logo/nom) recupere depuis /api/appearance.
//  4) Injecte la sidebar (desktop) + la bottom-nav (mobile) + le topbar.
//
// Retourne { user, appearance } une fois tout charge, pour que le script
// de la page puisse ensuite charger ses propres donnees.

const ROLE_HOME = {
  student: "/student/dashboard.html",
  teacher: "/teacher/dashboard.html",
  admin: "/admin/dashboard.html",
  superadmin: "/admin/dashboard.html",
};

const TEACHER_NAV = [
  { key: "dashboard", label: "Dashboard", icon: "grid", href: "/teacher/dashboard.html" },
  { key: "students", label: "My Students", icon: "users", href: "/teacher/students.html" },
  { key: "corrections", label: "Corrections", icon: "clipboard", href: "/teacher/corrections.html" },
  { key: "media", label: "Audio Library", icon: "headphones", href: "/teacher/media.html" },
];

// items admin filtres selon permissions (voir buildAdminNav)
const ADMIN_NAV_ALL = [
  { key: "dashboard", label: "Dashboard", icon: "grid", href: "/admin/dashboard.html", perm: null },
  { key: "students", label: "Students", icon: "graduation", href: "/admin/students.html", perm: "can_manage_students" },
  { key: "teachers", label: "Teachers", icon: "users", href: "/admin/teachers.html", perm: "can_manage_teachers" },
  { key: "admins", label: "Admins", icon: "crown", href: "/admin/admins.html", perm: "SUPERADMIN_ONLY" },
  { key: "courses", label: "Courses", icon: "book", href: "/admin/courses.html", perm: "can_manage_courses" },
  { key: "media", label: "Audio Library", icon: "headphones", href: "/admin/media.html", perm: "can_manage_media" },
  { key: "appearance", label: "Appearance", icon: "settings", href: "/admin/appearance.html", perm: "can_manage_appearance" },
];

function applyTheme(appearance) {
  const root = document.documentElement.style;
  root.setProperty("--primary", appearance.theme_primary);
  root.setProperty("--accent", appearance.theme_accent);
  document.title = document.title.includes("|") ? document.title : `${document.title} | ${appearance.platform_name}`;
}

function buildStudentNav(navItems) {
  const hrefByKey = {
    dashboard: "/student/dashboard.html",
    journey: "/student/journey.html",
    lesson: "/student/lesson.html",
    speaking: "/student/speaking-lab.html",
    vocabulary: "/student/vocabulary.html",
    compositions: "/student/compositions.html",
    progress: "/student/progress.html",
  };
  return navItems
    .filter((item) => hrefByKey[item.key])
    .map((item) => ({ ...item, href: hrefByKey[item.key] }));
}

function buildAdminNav(user) {
  if (user.role === "superadmin") return ADMIN_NAV_ALL;
  const perms = user.permissions || {};
  return ADMIN_NAV_ALL.filter((item) => {
    if (item.perm === null) return true;
    if (item.perm === "SUPERADMIN_ONLY") return false;
    return Boolean(perms[item.perm]);
  });
}

function initials(name) {
  return (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function svgIcon(name) {
  return typeof icon === "function" ? icon(name) : "";
}

function renderSidebar({ spaceLabel, navItems, activeKey, user, switchLink }) {
  const el = document.getElementById("shell-sidebar");
  if (!el) return;
  el.innerHTML = `
    <div>
      <div class="sidebar-brand">
        <span class="logo-glyph" id="logo-glyph-sidebar"></span>
        <span class="name" id="platform-name-sidebar"></span>
      </div>
      <p class="sidebar-space-label">${spaceLabel}</p>
      <nav class="sidebar-nav">
        ${navItems.map((item) => `
          <a href="${item.href}" class="${item.key === activeKey ? "active" : ""}">
            ${svgIcon(item.icon)}<span>${item.label}</span>
          </a>`).join("")}
      </nav>
      ${switchLink ? `<a href="${switchLink.href}" class="sidebar-switch">${svgIcon("arrowRight")}<span>${switchLink.label}</span></a>` : ""}
    </div>
    <div class="sidebar-footer">
      <div class="avatar">${initials(user.name)}</div>
      <div class="who">
        <p class="n">${user.name}</p>
        <button id="logout-btn-sidebar">${svgIcon("logout")}<span>Sign out</span></button>
      </div>
    </div>
  `;
}

function renderBottomNav({ navItems, activeKey }) {
  const el = document.getElementById("shell-bottomnav");
  if (!el) return;
  const items = navItems.slice(0, 5); // garde la bottom-nav lisible sur mobile
  el.innerHTML = items.map((item) => `
    <a href="${item.href}" class="${item.key === activeKey ? "active" : ""}">
      ${svgIcon(item.icon)}<span>${item.label}</span>
    </a>`).join("");
}

function renderTopbar({ title, subtitle, roleLabel, roleIcon }) {
  const el = document.getElementById("shell-topbar");
  if (!el) return;
  el.innerHTML = `
    <div>
      <h1>${title}</h1>
      ${subtitle ? `<p class="sub">${subtitle}</p>` : ""}
    </div>
    <span class="role-badge">${svgIcon(roleIcon)}<span class="label">${roleLabel}</span></span>
  `;
}

function bindLogout() {
  const btn = document.getElementById("logout-btn-sidebar");
  if (btn) btn.addEventListener("click", () => { Auth.clear(); window.location.href = "/index.html"; });
}

/**
 * A appeler sur chaque page protegee.
 * @param {object} opts
 * @param {string[]} opts.roles - roles autorises sur cette page
 * @param {string} opts.activeKey - cle de l'item de nav actif
 * @param {string} opts.title
 * @param {string} [opts.subtitle]
 */
async function renderShell({ roles, activeKey, title, subtitle }) {
  if (!Auth.isLoggedIn()) {
    redirectToLogin(roles);
    return null;
  }

  let me, appearance;
  try {
    [{ user: me }, { appearance }] = await Promise.all([api.get("/auth/me"), api.get("/appearance")]);
  } catch (err) {
    redirectToLogin(roles);
    return null;
  }

  if (!roles.includes(me.role)) {
    // Jamais de nav melangee : on renvoie directement vers SON espace.
    window.location.href = ROLE_HOME[me.role] || "/index.html";
    return null;
  }

  applyTheme(appearance);
  document.querySelectorAll("#logo-glyph-sidebar").forEach((n) => (n.textContent = appearance.logo_glyph));
  document.querySelectorAll("#platform-name-sidebar").forEach((n) => (n.textContent = appearance.platform_name));

  let spaceLabel, navItems, roleLabel, roleIcon, switchLink = null;

  if (me.role === "student") {
    spaceLabel = "STUDENT SPACE";
    navItems = buildStudentNav(appearance.nav_items);
    roleLabel = "Student";
    roleIcon = "graduation";
  } else if (me.role === "teacher" || me.role === "superadmin") {
    spaceLabel = "TEACHER SPACE";
    navItems = TEACHER_NAV;
    roleLabel = me.role === "superadmin" ? "Teacher (Super Admin)" : "Teacher";
    roleIcon = "graduation";
    if (me.role === "superadmin" && roles[0] !== "adminOnlyContext") {
      switchLink = { href: "/admin/dashboard.html", label: "Switch to Admin space" };
    }
  } else if (me.role === "admin") {
    spaceLabel = "ADMIN SPACE";
    navItems = buildAdminNav(me);
    roleLabel = "Admin";
    roleIcon = "crown";
  }

  if (me.role === "superadmin" && roles.includes("admin")) {
    // On est actuellement sur une page ADMIN en tant que superadmin
    spaceLabel = "ADMIN SPACE";
    navItems = buildAdminNav(me);
    roleLabel = "Admin (Super Admin)";
    roleIcon = "crown";
    switchLink = { href: "/teacher/dashboard.html", label: "Switch to Teacher space" };
  }

  renderSidebar({ spaceLabel, navItems, activeKey, user: me, switchLink });
  renderBottomNav({ navItems, activeKey });
  renderTopbar({ title, subtitle, roleLabel, roleIcon });
  bindLogout();

  return { user: me, appearance };
}

function redirectToLogin(roles) {
  const goesToStaff = roles.some((r) => ["teacher", "admin", "superadmin"].includes(r));
  window.location.href = goesToStaff ? "/connexion-staff.html" : "/connexion.html";
}
