// frontend/assets/js/media-shared.js
// Partagee entre /teacher/media.html et /admin/media.html.

let mediaTab = "audio";

async function initMediaPage(roles, activeKey) {
  const ctx = await renderShell({ roles, activeKey, title: "Media Library", subtitle: "Audio, images et vidéos pour tes cours" });
  if (!ctx) return;
  renderMediaTabs();
}

function renderMediaTabs() {
  const root = document.getElementById("media-root");
  root.innerHTML = `
    <div class="row" style="gap:6px;">
      ${[["audio", "🎧 Audio"], ["images", "🖼️ Images"], ["videos", "🎬 Vidéos"]].map(([key, label]) => `
        <button class="btn btn-sm media-tab-btn" data-tab="${key}" style="${mediaTab === key ? "background:var(--primary);color:#fff;" : "background:var(--row);color:var(--text);"}">${label}</button>
      `).join("")}
    </div>
    <div id="media-tab-content"></div>
  `;
  document.querySelectorAll(".media-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => { mediaTab = btn.dataset.tab; renderMediaTabs(); });
  });

  if (mediaTab === "audio") renderAudioTab();
  else if (mediaTab === "images") renderImagesTab();
  else renderVideosTab();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ---------------- Audio ---------------- */

function renderAudioTab() {
  const content = document.getElementById("media-tab-content");
  content.innerHTML = `
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
    const file = document.getElementById("audio-file").files[0];
    if (!file) return;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Uploading...`;
    try {
      const fileBase64 = await fileToBase64(file);
      await api.post("/media/upload", {
        title: document.getElementById("title").value,
        category: document.getElementById("category").value,
        weekNumber: document.getElementById("week-number").value || undefined,
        transcript: document.getElementById("transcript").value || undefined,
        fileBase64,
        fileExt: file.name.split(".").pop(),
      });
      status.textContent = "✅ Uploaded successfully."; status.style.color = "var(--success)";
      document.getElementById("upload-form").reset();
      loadAudioList();
    } catch (err) {
      status.textContent = `⚠️ ${err.message}`; status.style.color = "var(--danger)";
    }
    btn.disabled = false; btn.innerHTML = `${icon("upload")} Upload`;
  });

  loadAudioList();
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

/* ---------------- Images ---------------- */

function renderImagesTab() {
  const content = document.getElementById("media-tab-content");
  content.innerHTML = `
    <div class="card">
      <p style="font-weight:600;font-size:14px;margin-bottom:12px;">Add vocabulary image</p>
      <form id="image-form">
        <div class="grid grid-2">
          <div class="field"><label>English word</label><input type="text" id="img-word" required placeholder="Apple" /></div>
          <div class="field"><label>French translation</label><input type="text" id="img-fr" required placeholder="Pomme" /></div>
        </div>
        <div class="field"><label>Week number (débloque à partir de)</label><input type="number" id="img-week" min="1" max="36" placeholder="1" /></div>
        <div class="field"><label>Image URL (ou upload ci-dessous)</label><input type="text" id="img-url" placeholder="https://..." /></div>
        <div class="field"><label>Ou uploader un fichier (png, jpg, webp)</label><input type="file" id="img-file" accept="image/*" /></div>
        <button type="submit" class="btn btn-primary" id="img-upload-btn">${icon("upload")} Add image</button>
      </form>
      <p id="img-status" style="font-size:12.5px;margin-top:8px;"></p>
    </div>
    <div class="card">
      <p style="font-weight:600;font-size:14px;margin-bottom:10px;">Image Library</p>
      <div class="grid grid-3" id="images-list"></div>
    </div>
  `;

  document.getElementById("image-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("img-upload-btn");
    const status = document.getElementById("img-status");
    const file = document.getElementById("img-file").files[0];
    const url = document.getElementById("img-url").value.trim();
    if (!url && !file) { status.textContent = "⚠️ Fournis une URL ou un fichier."; status.style.color = "var(--danger)"; return; }
    btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Adding...`;
    try {
      const body = {
        word: document.getElementById("img-word").value,
        translationFr: document.getElementById("img-fr").value,
        weekNumber: document.getElementById("img-week").value || undefined,
      };
      if (url) body.imageUrl = url;
      else { body.fileBase64 = await fileToBase64(file); body.fileExt = file.name.split(".").pop(); }
      await api.post("/media/images", body);
      status.textContent = "✅ Image ajoutée."; status.style.color = "var(--success)";
      document.getElementById("image-form").reset();
      loadImagesList();
    } catch (err) {
      status.textContent = `⚠️ ${err.message}`; status.style.color = "var(--danger)";
    }
    btn.disabled = false; btn.innerHTML = `${icon("upload")} Add image`;
  });

  loadImagesList();
}

async function loadImagesList() {
  const list = document.getElementById("images-list");
  try {
    const { images } = await api.get("/media/images");
    list.innerHTML = images.length ? images.map((img) => `
      <div class="card" style="padding:0;overflow:hidden;">
        <img src="${img.image_url}" alt="${img.word}" style="width:100%;height:90px;object-fit:cover;" />
        <div style="padding:8px;">
          <p style="font-size:12px;font-weight:600;">${img.word}</p>
          <p style="font-size:10.5px;color:var(--text-muted);">${img.translation_fr} · Week ${img.week_number || "?"}</p>
        </div>
      </div>`).join("") : `<div class="empty-state">Aucune image pour le moment.</div>`;
  } catch (err) {
    list.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
}

/* ---------------- Videos ---------------- */

function renderVideosTab() {
  const content = document.getElementById("media-tab-content");
  content.innerHTML = `
    <div class="card">
      <p style="font-weight:600;font-size:14px;margin-bottom:12px;">Add video</p>
      <form id="video-form">
        <div class="field"><label>Title</label><input type="text" id="vid-title" required placeholder="Week 15 - Health vocabulary" /></div>
        <div class="grid grid-2">
          <div class="field"><label>Category</label>
            <select id="vid-category"><option value="lesson">Lesson</option><option value="listening">Listening</option><option value="culture">Culture</option></select>
          </div>
          <div class="field"><label>Week number (optional)</label><input type="number" id="vid-week" min="1" max="36" /></div>
        </div>
        <div class="field"><label>Video URL (YouTube, Vimeo, ou lien direct .mp4)</label><input type="text" id="vid-url" placeholder="https://..." /></div>
        <div class="field"><label>Ou uploader un petit fichier (.mp4)</label><input type="file" id="vid-file" accept="video/*" /></div>
        <button type="submit" class="btn btn-primary" id="vid-upload-btn">${icon("upload")} Add video</button>
      </form>
      <p id="vid-status" style="font-size:12.5px;margin-top:8px;"></p>
    </div>
    <div class="card">
      <p style="font-weight:600;font-size:14px;margin-bottom:10px;">Video Library</p>
      <div class="stack" id="videos-list" style="gap:8px;"></div>
    </div>
  `;

  document.getElementById("video-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("vid-upload-btn");
    const status = document.getElementById("vid-status");
    const file = document.getElementById("vid-file").files[0];
    const url = document.getElementById("vid-url").value.trim();
    if (!url && !file) { status.textContent = "⚠️ Fournis une URL ou un fichier."; status.style.color = "var(--danger)"; return; }
    btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Adding...`;
    try {
      const body = {
        title: document.getElementById("vid-title").value,
        category: document.getElementById("vid-category").value,
        weekNumber: document.getElementById("vid-week").value || undefined,
      };
      if (url) body.videoUrl = url;
      else { body.fileBase64 = await fileToBase64(file); body.fileExt = file.name.split(".").pop(); }
      await api.post("/media/videos", body);
      status.textContent = "✅ Vidéo ajoutée."; status.style.color = "var(--success)";
      document.getElementById("video-form").reset();
      loadVideosList();
    } catch (err) {
      status.textContent = `⚠️ ${err.message}`; status.style.color = "var(--danger)";
    }
    btn.disabled = false; btn.innerHTML = `${icon("upload")} Add video`;
  });

  loadVideosList();
}

async function loadVideosList() {
  const list = document.getElementById("videos-list");
  try {
    const { videos } = await api.get("/media/videos");
    list.innerHTML = videos.length ? videos.map((v) => `
      <div class="card" style="background:var(--row);">
        <div class="row-between">
          <div>
            <p style="font-weight:600;font-size:13px;">${v.title}</p>
            <p style="font-size:11px;color:var(--text-muted);">${v.category}${v.week_number ? ` · Week ${v.week_number}` : ""} · by ${v.uploaded_by_name || "?"}</p>
          </div>
          <a href="${v.url}" target="_blank" class="btn btn-outline btn-sm">Ouvrir ↗</a>
        </div>
      </div>`).join("") : `<div class="empty-state">Aucune vidéo pour le moment.</div>`;
  } catch (err) {
    list.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
}
