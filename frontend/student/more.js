// frontend/student/more.js — profil + menu (Learning / Settings)

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "more", title: "More" });
  if (!ctx) return;
  const root = document.getElementById("more-root");
  document.getElementById("shell-topbar").style.display = "none";

  let profile = null, vocabCount = null;
  try {
    ({ profile } = await api.get("/students/me/dashboard"));
    const wk = await api.get(`/courses/weeks/${profile?.current_week || 1}`);
    vocabCount = wk.vocabulary?.length ?? null;
  } catch {}

  const u = ctx.user;
  const row = (href, ic, label, meta) => `
    <a href="${href}" class="list-row">
      <span class="li-ico">${icon(ic)}</span>
      <span class="li-main">${label}</span>
      ${meta ? `<span class="li-meta">${meta}</span>` : ""}
      <span class="li-chev">${icon("chevronRight")}</span>
    </a>`;

  root.innerHTML = `
    <div class="profile-card" style="margin-top:8px;">
      <div class="av">${esc((u.name || "?").trim()[0].toUpperCase())}</div>
      <div style="min-width:0;">
        <h2>${esc(u.name.split(" ")[0])}</h2>
        <p class="em">${esc(u.email || "")}</p>
        <div class="pill-row">
          <span class="pill pill-orange" style="background:transparent;border:1.5px solid var(--orange);">${icon("shield")} ${studentLevel(profile)} Level</span>
          <span class="pill" style="background:var(--orange);color:#fff;">${icon("bolt")} ${studentXp(profile)} XP</span>
        </div>
      </div>
    </div>

    <h2 class="sec-title">Learning</h2>
    <div class="list-card">
      ${row("/student/vocabulary.html", "book", "Vocabulary", vocabCount !== null ? `${vocabCount} words` : "")}
      ${row("/student/compositions.html", "edit", "Compositions")}
      ${row("/student/progress.html", "chart", "My Progress")}
      ${row("/student/leaderboard.html", "trophy", "Leaderboard")}
    </div>

    <h2 class="sec-title">Settings</h2>
    <div class="list-card">
      <button class="list-row" id="notif-btn"><span class="li-ico">${icon("bell")}</span><span class="li-main">Notifications</span><span class="li-meta" id="notif-state"></span><span class="li-chev">${icon("chevronRight")}</span></button>
      ${row("/student/subscribe.html", "card", "Subscription")}
    </div>

    <div style="text-align:center;margin-top:8px;">
      <button class="signout" id="signout-btn">${icon("logout")} Sign out</button>
    </div>
  `;

  const stateEl = document.getElementById("notif-state");
  const refreshNotif = () => {
    stateEl.textContent = !("Notification" in window) ? "Not supported" : Notification.permission === "granted" ? "On" : Notification.permission === "denied" ? "Blocked" : "Off";
  };
  refreshNotif();
  document.getElementById("notif-btn").addEventListener("click", async () => {
    if (typeof ensurePushSubscription === "function") await ensurePushSubscription();
    refreshNotif();
  });
  document.getElementById("signout-btn").addEventListener("click", () => {
    Auth.clear();
    window.location.href = "/index.html";
  });
})();
