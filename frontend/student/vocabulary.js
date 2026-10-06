// frontend/student/vocabulary.js

const FAV_KEY = "angloba_vocab_favs";
function loadFavs() { try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); } catch { return new Set(); } }
function saveFavs(set) { try { localStorage.setItem(FAV_KEY, JSON.stringify([...set])); } catch {} }

(async () => {
  const ctx = await renderShell({ roles: ["student"], activeKey: "vocabulary", title: "Vocabulary" });
  if (!ctx) return;
  const root = document.getElementById("vocab-root");

  try {
    const { profile } = await api.get("/students/me/dashboard");
    const weekNum = profile?.current_week || 1;
    const [{ week, vocabulary }, { images }] = await Promise.all([
      api.get(`/courses/weeks/${weekNum}`),
      api.get("/media/images").catch(() => ({ images: [] })),
    ]);

    const unlockedImages = images.filter((img) => (img.week_number || 1) <= weekNum);
    const lockedCount = images.length - unlockedImages.length;
    const favs = loadFavs();
    let onlyFavs = false;

    root.innerHTML = `
      <div class="row-between">
        <button class="round-btn" onclick="history.length > 1 ? history.back() : (location.href='/student/more.html')" aria-label="Back">${icon("chevronLeft")}</button>
        <h2 style="font-size:22px;font-weight:800;color:var(--brand);flex:1;margin-left:12px;">Week ${week.number} · ${esc(week.title || "")}</h2>
      </div>

      ${unlockedImages.length ? `
      <div>
        <div class="row-between" style="margin-bottom:8px;">
          <h2 class="sec-title" style="margin:0;">Picture Vocabulary</h2>
          <span class="sec-link">Swipe to explore ${icon("arrowRight")}</span>
        </div>
        <div class="pic-strip">
          ${unlockedImages.map((img) => `
            <div class="pic">
              <div class="ph"><img src="${img.image_url}" alt="${esc(img.word)}" loading="lazy" decoding="async" onerror="this.remove()" />🖼️</div>
              <b>${esc(img.word)}</b><span>${esc(img.translation_fr)}</span>
            </div>`).join("")}
        </div>
        ${lockedCount > 0 ? `<p style="font-size:12.5px;color:var(--text-muted);font-weight:600;">🔒 ${lockedCount} image(s) de plus à débloquer en avançant.</p>` : ""}
      </div>` : ""}

      <label class="search-box" for="search-input">${icon("search")}<input type="text" id="search-input" placeholder="Search words" autocomplete="off" /></label>
      <div class="row-between"><h2 class="sec-title" style="margin:0;">Words</h2>
        <button class="chip" id="fav-filter" style="min-height:36px;padding:6px 12px;">${icon("star")} Favorites</button></div>
      <div class="stack" style="gap:10px;" id="vocab-grid"></div>
    `;

    const grid = document.getElementById("vocab-grid");
    const favBtn = document.getElementById("fav-filter");
    let query = "";

    function draw() {
      const list = vocabulary.filter((v) =>
        v.word.toLowerCase().includes(query.toLowerCase()) && (!onlyFavs || favs.has(v.word)));
      grid.innerHTML = list.length ? list.map((v) => `
        <div class="word">
          <div style="min-width:0;">
            <p><span class="w">${esc(v.word)}</span>${v.word_type ? `<span class="tag">${esc(v.word_type)}</span>` : ""}</p>
            <p class="fr">${esc(v.fr || "")}</p>
            ${v.gb_variant ? `<div class="row" style="margin-top:6px;gap:4px;">
              <span class="badge" style="background:#DCE6FB;color:#3B6FE0;">GB ${esc(v.gb_variant)}</span>
              <span class="badge badge-accent">US ${esc(v.us_variant)}</span></div>` : ""}
          </div>
          <div class="acts">
            <button class="icon-btn fav ${favs.has(v.word) ? "on" : ""}" data-fav="${esc(v.word)}" aria-label="Favori">${icon("star")}</button>
            <button class="icon-btn speak-word" data-word="${esc(v.word)}" aria-label="Écouter">${icon("volume")}</button>
          </div>
        </div>`).join("") : `<div class="empty-state">${onlyFavs ? "Pas encore de favoris — touche ⭐ sur un mot." : "Aucun mot ne correspond."}</div>`;

      grid.querySelectorAll(".speak-word").forEach((btn) => btn.addEventListener("click", () => {
        if (!("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(btn.dataset.word);
        u.lang = "en-US";
        window.speechSynthesis.speak(u);
      }));
      grid.querySelectorAll("[data-fav]").forEach((btn) => btn.addEventListener("click", () => {
        const w = btn.dataset.fav;
        favs.has(w) ? favs.delete(w) : favs.add(w);
        saveFavs(favs);
        btn.classList.toggle("on");
        if (onlyFavs) draw();
      }));
    }
    draw();
    document.getElementById("search-input").addEventListener("input", (e) => { query = e.target.value; draw(); });
    favBtn.addEventListener("click", () => {
      onlyFavs = !onlyFavs;
      favBtn.style.background = onlyFavs ? "#FFE08A" : "";
      draw();
    });
  } catch (err) {
    if (handlePaywallError(err)) return;
    root.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
  }
})();
