// frontend/admin/students.js

let allStudents = [];
let allTeachers = [];

(async () => {
  const ctx = await renderShell({ roles: ["admin", "superadmin"], activeKey: "students", title: "Students" });
  if (!ctx) return;
  const root = document.getElementById("students-root");

  try {
    const [{ students }, { teachers }] = await Promise.all([api.get("/students"), api.get("/teachers")]);
    allStudents = students;
    allTeachers = teachers;

    root.innerHTML = `
      <div class="row">${icon("search")}<input type="text" id="search-input" placeholder="Search students by name or email..." /></div>
      <div class="card" style="padding:0;overflow:hidden;">
        <div class="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Teacher</th><th>Course</th><th>Progress</th><th>Week</th><th>Status</th></tr></thead>
            <tbody id="students-tbody"></tbody>
          </table>
        </div>
      </div>
    `;
    draw();
    document.getElementById("search-input").addEventListener("input", (e) => draw(e.target.value));
  } catch (err) {
    root.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
})();

function draw(filter = "") {
  const tbody = document.getElementById("students-tbody");
  const filtered = allStudents.filter((s) => s.name.toLowerCase().includes(filter.toLowerCase()) || s.email.toLowerCase().includes(filter.toLowerCase()));

  tbody.innerHTML = filtered.length ? filtered.map((s) => `
    <tr>
      <td>
        <div class="row">
          <div style="width:26px;height:26px;border-radius:999px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;">${initials(s.name)}</div>
          <div><p style="font-weight:500;">${s.name}</p><p style="font-size:11px;color:var(--text-muted);">${s.email}</p></div>
        </div>
      </td>
      <td>
        <select class="teacher-select" data-id="${s.id}" style="padding:5px 8px;font-size:12px;">
          <option value="">Non assigné</option>
          ${allTeachers.map((t) => `<option value="${t.id}" ${t.id === s.teacher_id ? "selected" : ""}>${t.name}</option>`).join("")}
        </select>
      </td>
      <td style="font-size:12px;">${s.course_name}</td>
      <td>
        <div class="row">
          <div class="progress-bar" style="width:50px;"><span style="width:${s.overall_pct}%;"></span></div>
          <span style="font-size:12px;">${s.overall_pct}%</span>
        </div>
      </td>
      <td>
        <div class="row" style="gap:4px;">
          M<input type="number" class="week-input" data-id="${s.id}" data-field="currentMonth" value="${s.current_month}" min="1" max="9" style="width:42px;padding:4px 4px;font-size:12px;" />
          W<input type="number" class="week-input" data-id="${s.id}" data-field="currentWeek" value="${s.current_week}" min="1" max="36" style="width:48px;padding:4px 4px;font-size:12px;" />
        </div>
      </td>
      <td>
        <button class="status-toggle badge ${s.status === "active" ? "badge-success" : "badge-muted"}" data-id="${s.id}" data-status="${s.status}">${s.status}</button>
      </td>
    </tr>`).join("") : `<tr><td colspan="6" class="empty-state">Aucun élève.</td></tr>`;

  tbody.querySelectorAll(".week-input").forEach((input) => {
    input.addEventListener("change", async () => {
      await api.patch(`/students/${input.dataset.id}`, { [input.dataset.field]: Number(input.value) });
    });
  });

  tbody.querySelectorAll(".teacher-select").forEach((sel) => {
    sel.addEventListener("change", async () => {
      await api.patch(`/students/${sel.dataset.id}`, { teacherId: sel.value || null });
    });
  });
  tbody.querySelectorAll(".status-toggle").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const newStatus = btn.dataset.status === "active" ? "inactive" : "active";
      await api.patch(`/students/${btn.dataset.id}`, { status: newStatus });
      const student = allStudents.find((s) => s.id === btn.dataset.id);
      student.status = newStatus;
      draw(document.getElementById("search-input").value);
    });
  });
}

function initials(name) { return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }
