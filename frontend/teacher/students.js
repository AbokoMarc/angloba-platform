// frontend/teacher/students.js

(async () => {
  const ctx = await renderShell({ roles: ["teacher", "superadmin"], activeKey: "students", title: "My Students" });
  if (!ctx) return;

  try {
    const { students } = await api.get("/students");
    const tbody = document.getElementById("students-tbody");

    function draw(filter = "") {
      const filtered = students.filter((s) => s.name.toLowerCase().includes(filter.toLowerCase()) || s.email.toLowerCase().includes(filter.toLowerCase()));
      tbody.innerHTML = filtered.length ? filtered.map((s) => `
        <tr>
          <td>
            <div class="row">
              <div style="width:26px;height:26px;border-radius:999px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">${initials(s.name)}</div>
              <div><p style="font-weight:500;">${s.name}</p><p style="font-size:11px;color:var(--text-muted);">${s.email}</p></div>
            </div>
          </td>
          <td>
            <div class="row">
              <div class="progress-bar" style="width:60px;"><span style="width:${s.overall_pct}%;"></span></div>
              <span style="font-size:12px;font-weight:600;">${s.overall_pct}%</span>
              <span style="font-size:11px;color:var(--text-muted);">M${s.current_month}·W${s.current_week}</span>
            </div>
          </td>
          <td><span class="badge ${s.status === "active" ? "badge-success" : "badge-muted"}">${s.status}</span></td>
        </tr>`).join("") : `<tr><td colspan="3" class="empty-state">Aucun élève.</td></tr>`;
    }
    draw();
    document.getElementById("search-input").addEventListener("input", (e) => draw(e.target.value));
  } catch (err) {
    document.getElementById("students-tbody").innerHTML = `<tr><td colspan="3" class="empty-state">${err.message}</td></tr>`;
  }
})();

function initials(name) { return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }
