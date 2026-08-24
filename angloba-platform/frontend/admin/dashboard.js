// frontend/admin/dashboard.js

(async () => {
  const ctx = await renderShell({ roles: ["admin", "superadmin"], activeKey: "dashboard", title: "Admin Dashboard" });
  if (!ctx) return;
  const root = document.getElementById("admin-dash-root");

  const isSuperadmin = ctx.user.role === "superadmin";
  const perms = ctx.user.permissions || {};
  const can = (flag) => isSuperadmin || perms[flag];

  try {
    const requests = [api.get("/students")];
    if (can("can_manage_teachers")) requests.push(api.get("/teachers"));
    const [studentsRes, teachersRes] = await Promise.all(requests);
    const students = studentsRes.students;
    const teachers = teachersRes ? teachersRes.teachers : [];

    root.innerHTML = `
      ${isSuperadmin ? `
      <div class="card" style="background:color-mix(in srgb, var(--accent) 12%, white);">
        <p style="font-size:12.5px;color:var(--primary);">${icon("crown")} Ton compte est <b>Super Admin + Enseignant titulaire</b>. Tu vois tout, tu peux tout gérer, et tu peux nommer d'autres admins avec des droits limités.</p>
      </div>` : ""}

      <div class="grid grid-4">
        <div class="card"><p style="font-size:11px;color:var(--text-muted);">Total Students</p><p style="font-size:20px;font-weight:700;color:var(--primary);">${students.length}</p></div>
        ${teachers.length || can("can_manage_teachers") ? `<div class="card"><p style="font-size:11px;color:var(--text-muted);">Teachers</p><p style="font-size:20px;font-weight:700;color:var(--primary);">${teachers.filter((t) => t.status === "active").length}</p></div>` : ""}
        <div class="card"><p style="font-size:11px;color:var(--text-muted);">Courses</p><p style="font-size:20px;font-weight:700;color:var(--primary);">36</p><p style="font-size:10px;color:var(--text-muted);">9 months</p></div>
        <div class="card"><p style="font-size:11px;color:var(--text-muted);">Avg Progress</p><p style="font-size:20px;font-weight:700;color:var(--primary);">${students.length ? Math.round(students.reduce((a, s) => a + s.overall_pct, 0) / students.length) : 0}%</p></div>
      </div>

      <div class="card">
        <p style="font-weight:600;font-size:14px;margin-bottom:10px;">Quick Actions</p>
        <div class="stack" style="gap:6px;">
          ${can("can_manage_students") ? `<a href="/admin/students.html" class="row-between card" style="background:var(--row);">🎓 Manage students ${icon("arrowRight")}</a>` : ""}
          ${can("can_manage_teachers") ? `<a href="/admin/teachers.html" class="row-between card" style="background:var(--row);">👥 Add new teacher ${icon("arrowRight")}</a>` : ""}
          ${can("can_manage_courses") ? `<a href="/admin/courses.html" class="row-between card" style="background:var(--row);">📚 Edit course content ${icon("arrowRight")}</a>` : ""}
          ${can("can_manage_appearance") ? `<a href="/admin/appearance.html" class="row-between card" style="background:var(--row);">🎨 Edit appearance ${icon("arrowRight")}</a>` : ""}
          ${isSuperadmin ? `<a href="/admin/admins.html" class="row-between card" style="background:var(--row);">👑 Manage admins ${icon("arrowRight")}</a>` : ""}
        </div>
      </div>

      ${teachers.length ? `
      <div class="card">
        <p style="font-weight:600;font-size:14px;margin-bottom:10px;">Teachers Overview</p>
        <div class="grid grid-2">
          ${teachers.map((t) => `
            <div class="card" style="background:var(--row);${t.status !== "active" ? "opacity:.5;" : ""}">
              <div class="row-between">
                <p style="font-size:13px;font-weight:600;">${t.name}</p>
                <span class="badge ${t.status === "active" ? "badge-success" : "badge-muted"}">${t.status}</span>
              </div>
              <p style="font-size:11px;color:var(--text-muted);margin-top:4px;">${t.student_count} students</p>
            </div>`).join("")}
        </div>
      </div>` : ""}
    `;
  } catch (err) {
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();
