// frontend/assets/js/media-shared.js
//
// Partagee entre /teacher/media.html et /admin/media.html : upload d'audio
// (listening lab, prononciation, exemples de speaking), demande explicite
// du cahier des charges ("l'admin ou le prof peuvent introduire les audios").

async function initMediaPage(roles, activeKey) {
  const ctx = await renderShell({ roles, activeKey, title: "Audio Library", subtitle: "Upload audio for listening & speaking labs" });
  if (!ctx) return;
  const root = document.getElementById("media-root");

  root.innerHTML = `
    <div class="card">
      <p style="font-weight:600;font-size:14px;margin-bottom:12px;">Upload new audio</p>
      <form id="upload-form">
        <div class="field"><label>Title</label><input type="text" id="title" required placeholder="At the Doctor's Office" /></div>
        <div class="grid grid-2">
          <div class="field"><label>Category</label>
            <select id="category">
              <option value="listening">Listening exercise</option>
              <option value="vocabulary">Vocabulary pronunciation</option>
              <option value="speaking_example">Speaking example</option>
            </select>
          </div>
          <div class="field"><label>Week number (optional)</label><input type="number" id="week-number" min="1" max="36" placeholder="15" /></div>
        </div>
        <div class="field"><label>Transcript (optional)</label><textarea id="transcript" placeholder="Full text of the audio..."></textarea></div>
        <div class="field"><label>Audio file (mp3, wav, ogg, m4a)</label><input type="file" id="audio-file" accept="audio/*" required /></div>
        <button type="submit" class="btn btn-primary" id="upload-btn">${icon("upload")} Upload</button>
      </form>
      <p id="upload-status" style="font-size:12.5px;margin-top:8px;"></p>
    </div>

    <div class="card">
      <p style="font-weight:600;font-size:14px;margin-bottom:10px;">Uploaded audio</p>
      <div class="stack" id="audio-list" style="gap:8px;"></div>
    </div>
  `;

  document.getElementById("upload-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("upload-btn");
    const status = document.getElementById("upload-status");
    const fileInput = document.getElementById("audio-file");
    const file = fileInput.files[0];
    if (!file) return;

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Uploading...`;
    status.textContent = "";

    try {
      const fileBase64 = await fileToBase64(file);
      const ext = file.name.split(".").pop();
      await api.post("/media/upload", {
        title: document.getElementById("title").value,
        category: document.getElementById("category").value,
        weekNumber: document.getElementById("week-number").value || undefined,
        transcript: document.getElementById("transcript").value || undefined,
        fileBase64,
        fileExt: ext,
      });
      status.textContent = "✅ Uploaded successfully.";
      status.style.color = "var(--success)";
      document.getElementById("upload-form").reset();
      loadAudioList();
    } catch (err) {
      status.textContent = `⚠️ ${err.message}`;
      status.style.color = "var(--danger)";
    }
    btn.disabled = false;
    btn.innerHTML = `${icon("upload")} Upload`;
  });

  loadAudioList();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function loadAudioList() {
  const list = document.getElementById("audio-list");
  try {
    const { audios } = await api.get("/media");
    list.innerHTML = audios.length ? audios.map((a) => `
      <div class="card" style="background:var(--row);">
        <div class="row-between">
          <div>
            <p style="font-weight:600;font-size:13px;">${a.title}</p>
            <p style="font-size:11px;color:var(--text-muted);">${a.category}${a.week_number ? ` · Week ${a.week_number}` : ""} · by ${a.uploaded_by_name || "?"}</p>
          </div>
          <span class="badge badge-accent">${a.category}</span>
        </div>
        <audio controls src="${a.url}" style="width:100%;margin-top:8px;height:34px;"></audio>
      </div>`).join("") : `<div class="empty-state">Aucun audio pour le moment.</div>`;
  } catch (err) {
    list.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
}
