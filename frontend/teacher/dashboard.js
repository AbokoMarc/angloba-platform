// frontend/teacher/dashboard.js

(async () => {
  const ctx = await renderShell({ roles: ["teacher", "superadmin"], activeKey: "dashboard", title: "Teacher Dashboard" });
  if (!ctx) return;
  const root = document.getElementById("teacher-dash-root");

  document.querySelector("#shell-topbar div").innerHTML += `<p class="sub">Welcome back, ${ctx.user.name.split(" ")[0]}</p>`;

  try {
    const [{ students }, { pending }] = await Promise.all([
      api.get("/students"),
      api.get("/compositions/pending"),
    ]);

    const isSuperadmin = ctx.user.role === "superadmin";
    const avg = students.length ? Math.round(students.reduce((a, s) => a + s.overall_pct, 0) / students.length) : 0;
    const courseCount = new Set(students.map((s) => s.course_name)).size;

    root.innerHTML = `
      <div class="grid grid-4">
        <div class="card"><p style="font-size:11px;color:var(--text-muted);">${isSuperadmin ? "Students (all)" : "My Students"}</p><p style="font-size:20px;font-weight:700;color:var(--primary);">${students.length}</p></div>
        <div class="card"><p style="font-size:11px;color:var(--text-muted);">Pending Corrections</p><p style="font-size:20px;font-weight:700;color:var(--accent);">${pending.length}</p></div>
        <div class="card"><p style="font-size:11px;color:var(--text-muted);">Active Courses</p><p style="font-size:20px;font-weight:700;color:var(--primary);">${courseCount}</p></div>
        <div class="card"><p style="font-size:11px;color:var(--text-muted);">Avg. Score</p><p style="font-size:20px;font-weight:700;color:var(--primary);">${avg}%</p></div>
      </div>

      <div class="card">
        <div class="row-between" style="margin-bottom:10px;">
          <p style="font-weight:600;font-size:14px;">Pending Corrections</p>
          <a href="/teacher/corrections.html" style="font-size:12px;color:var(--accent);font-weight:600;">View all →</a>
        </div>
        ${pending.length === 0 ? `<p class="empty-state">Aucune copie en attente. 🎉</p>` : pending.slice(0, 4).map((p) => `
          <div class="row-between" style="padding:8px 0;border-top:1px solid var(--border);">
            <div>
              <p style="font-size:13px;font-weight:500;">${p.student_name}</p>
              <p style="font-size:11.5px;color:var(--text-muted);">Composition #${p.number} — ${p.title}</p>
            </div>
            <span style="font-size:11px;color:var(--danger);font-weight:600;">${timeAgo(p.submitted_at)}</span>
          </div>`).join("")}
      </div>

      <div class="card">
        <p style="font-weight:600;font-size:14px;margin-bottom:10px;">${isSuperadmin ? "Students (all)" : "My Students"} — quick view</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Progress</th><th>Status</th></tr></thead>
            <tbody>
              ${students.slice(0, 6).map((s) => `
                <tr>
                  <td>${s.name}${isSuperadmin ? `<br><span style="font-size:10.5px;color:var(--text-muted);">${s.teacher_name || "Unassigned"}</span>` : ""}</td>
                  <td><div class="row"><div class="progress-bar" style="width:60px;"><span style="width:${s.overall_pct}%;"></span></div><span style="font-size:12px;">${s.overall_pct}%</span></div></td>
                  <td><span class="badge ${s.status === "active" ? "badge-success" : "badge-muted"}">${s.status}</span></td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr + "Z").getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
