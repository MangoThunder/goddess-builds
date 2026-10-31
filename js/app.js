(function () {
  "use strict";

  // ── data ───────────────────────────────────────────────────
  const data = window.GUN_BUILDS || {};
  const cfg = Object.assign(
    { name: "Streamer", avatar: "", game: "Delta Force", mode: "Operations", twitch: "", live: false, liveTitle: "", schedule: "", tagline: "", showSampleNotice: false, promo: null, socials: [] },
    data.config
  );
  const builds = (data.builds || [])
    .map((b, i) => Object.assign({ order: i }, b))
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.order - b.order);
  const byId = (id) => builds.find((b) => b.id === id);
  const categories = [...new Set(builds.map((b) => b.category).filter(Boolean))];
  const twitchUrl = cfg.twitch ? "https://www.twitch.tv/" + encodeURIComponent(cfg.twitch) : "";
  const PICTURES = { image: "View build", calibration: "Calibration" };

  // localStorage can be blocked (private windows, embeds), so every access is guarded.
  const FAV_KEY = "goddess-loadouts:favs";
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {}
    }
  };

  const state = {
    q: "",
    category: "All",
    savedOnly: false,
    favs: new Set(store.get(FAV_KEY, []).filter(byId)),
    openId: "",
    pic: "image"
  };
  // live: "auto" asks decapi.me every 2 minutes (see checkLive); true/false force it.
  const live = { on: cfg.live === true, title: cfg.liveTitle };

  // ── helpers ────────────────────────────────────────────────
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const initials = (name) => String(name).split(/[\s_-]+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const fmtDate = (iso) => {
    const d = new Date(iso + "T00:00:00");
    return isNaN(d) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };
  const searchWords = () => state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  // Only web links and the site's own files are allowed, so a mistyped or pasted
  // "javascript:" or "data:" link in builds.js can never run code on the page.
  const blocked = new Set();
  function safeUrl(url) {
    const u = String(url || "").trim();
    if (!u) return "";
    try {
      const parsed = new URL(u, location.href);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") return u;
    } catch (e) {}
    if (!/^[a-z][a-z0-9+.-]*:/i.test(u) && !u.startsWith("//")) return u;
    if (!blocked.has(u)) console.warn("Blocked unsafe link in builds.js:", u);
    blocked.add(u);
    return "";
  }
  const extLink = (href, inner, cls) => {
    const url = safeUrl(href);
    return url ? `<a${cls ? ` class="${cls}"` : ""} href="${esc(url)}" target="_blank" rel="noopener noreferrer">${inner}</a>` : "";
  };
  const img = (src, attrs) => {
    const url = safeUrl(src);
    return url ? `<img src="${esc(url)}" ${attrs}>` : "";
  };

  // Escapes text, then wraps each search word it contains in <mark>.
  function highlight(text) {
    const safe = esc(text);
    const words = searchWords().map((w) => esc(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return words.length ? safe.replace(new RegExp(`(${words.join("|")})`, "gi"), "<mark>$1</mark>") : safe;
  }

  const avatarHTML = (cls) =>
    safeUrl(cfg.avatar) ? img(cfg.avatar, `class="${cls}" alt=""`) : `<span class="${cls}" aria-hidden="true">${esc(initials(cfg.name))}</span>`;

  const icon = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
    external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    crosshair: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>'
  };

  const coinStack = `<svg class="promo-coins" viewBox="0 0 160 152" aria-hidden="true">
    ${[0, 1, 2, 3, 4].map((i) => `<g transform="translate(18 ${112 - i * 15})"><ellipse cx="44" cy="10" rx="44" ry="13" fill="#a8741c" stroke="none"/><rect width="88" height="10" fill="#a8741c" stroke="none"/><ellipse cx="44" cy="0" rx="44" ry="13" fill="#f2c14e" stroke="#c48a22" stroke-width="2"/></g>`).join("")}
    <g transform="translate(118 38) rotate(14)"><circle r="34" fill="#c48a22" stroke="none"/><circle r="31" fill="#f6cf5f" stroke="none"/><circle r="23" fill="none" stroke="#c48a22" stroke-width="3"/><text y="8" text-anchor="middle" font-family="Chakra Petch, sans-serif" font-weight="700" font-size="22" fill="#8a5a10" stroke="none">+</text></g>
  </svg>`;

  // ── templates ──────────────────────────────────────────────
  function promoHTML(p) {
    return `<a class="promo" href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer sponsored">
      <span class="eyebrow">${esc(p.eyebrow || "Top-up deal")}</span>
      <span class="promo-body">
        <span class="promo-copy">
          <span class="promo-big">${esc(p.bonus)}</span>
          <span class="promo-label">${esc(p.headline)}</span>
        </span>
        ${coinStack}
      </span>
      <span class="promo-text">${esc(p.text)}</span>
      <span class="promo-cta">${esc(p.button)} ${icon.external}</span>
    </a>`;
  }

  function statusHTML() {
    if (!twitchUrl) return "";
    const [title, sub] = live.on
      ? ["Live now on Twitch", live.title || `Watch ${cfg.name} play ${cfg.game}`]
      : [`twitch.tv/${cfg.twitch}`, cfg.schedule ? `Streams ${cfg.schedule}` : "Follow to catch the next stream"];
    return extLink(twitchUrl, `<i class="dot" aria-hidden="true"></i><span><strong>${esc(title)}</strong><small>${esc(sub)}</small></span>`, live.on ? "status is-live" : "status");
  }

  const copyLabel = (copied) => (copied ? `${icon.check}<span>Copied</span>` : `${icon.copy}<span>Copy</span>`);

  function codeRow(b) {
    return `<div class="code-row">
      <code class="code" title="${esc(b.code)}">${highlight(b.code)}</code>
      <button class="copy-btn" type="button" data-copy="${esc(b.id)}" aria-label="Copy ${esc(b.weapon)} build code">${copyLabel(false)}</button>
    </div>`;
  }

  function starBtn(b, cls) {
    const fav = state.favs.has(b.id);
    return `<button type="button" class="${cls}" data-fav="${esc(b.id)}" aria-pressed="${fav}" aria-label="${fav ? "Remove " + esc(b.weapon) + " from saved" : "Save " + esc(b.weapon)}">${icon.star}</button>`;
  }

  function cardHTML(b) {
    const id = esc(b.id);
    const pics = Object.keys(PICTURES).filter((k) => safeUrl(b[k]));
    return `<article class="card">
      <div class="card-head">
        <div>
          <h3 class="card-title"><button type="button" data-open="${id}">${highlight(b.weapon)}</button></h3>
          <p class="cat">${esc(b.category)}${b.updated ? " · " + esc(fmtDate(b.updated)) : ""}</p>
        </div>
        ${starBtn(b, "star")}
      </div>
      ${safeUrl(b.image)
        ? `<button type="button" class="shot" data-open="${id}" data-pic="image" aria-label="View ${esc(b.weapon)} build">${img(b.image, 'alt="" loading="lazy"')}</button>`
        : `<div class="shot shot-empty">Screenshot coming soon</div>`}
      ${codeRow(b)}
      <div class="card-foot">
        ${pics.length
          ? pics.map((k) => `<button type="button" class="text-btn" data-open="${id}" data-pic="${k}">${PICTURES[k]}</button>`).join("")
          : `<button type="button" class="text-btn" data-open="${id}">Details</button>`}
      </div>
    </article>`;
  }

  function emptyHTML() {
    if (state.savedOnly && state.favs.size === 0) {
      return `${icon.star}
        <h2>No saved builds yet</h2>
        <p>Tap the star on any build to keep it here. Saved builds stay on this device only.</p>
        <div class="empty-actions"><button type="button" class="btn btn-accent" data-reset>Show all builds</button></div>`;
    }
    const q = state.q.trim();
    return `${icon.crosshair}
      <h2>${q ? `No build for “${esc(q)}” yet` : "No builds here yet"}</h2>
      <p>${live.on ? `${esc(cfg.name)} is live right now. Ask in chat and it might get built on stream.` : `Not every gun has a code yet. Ask for it in ${esc(cfg.name)}'s chat next stream.`}</p>
      <div class="empty-actions">
        <button type="button" class="btn" data-reset>${q ? "Clear search" : "Show all builds"}</button>
        ${twitchUrl ? extLink(twitchUrl, "Ask in Twitch chat", "btn btn-accent") : ""}
      </div>`;
  }

  // The builds before and after this one in the current list, wrapping around.
  function neighbors(b) {
    const list = filtered();
    const pool = list.includes(b) ? list : builds;
    if (pool.length < 2) return [];
    const i = pool.indexOf(b);
    return [pool[(i - 1 + pool.length) % pool.length], pool[(i + 1) % pool.length]];
  }

  function modalHTML(b) {
    const pics = Object.keys(PICTURES).filter((k) => safeUrl(b[k]));
    const pic = pics.includes(state.pic) ? state.pic : pics[0];
    const [prev, next] = neighbors(b);
    return `
      <div class="modal-head">
        <div>
          <h2 id="modal-title">${esc(b.weapon)}</h2>
          <p>${[b.category, cfg.mode, b.updated ? "Updated " + fmtDate(b.updated) : ""].filter(Boolean).map(esc).join(" · ")}</p>
        </div>
        <div class="modal-tools">
          ${pics.length > 1 ? `<span class="tabs" role="tablist" aria-label="Screenshot">
            ${pics.map((k) => `<button type="button" class="tab" role="tab" data-pic-tab="${k}" aria-selected="${k === pic}">${PICTURES[k]}</button>`).join("")}
          </span>` : ""}
          ${starBtn(b, "icon-btn star")}
          <button type="button" class="icon-btn" data-close aria-label="Close">${icon.close}</button>
        </div>
      </div>
      <div class="picture">
        ${pic
          ? img(b[pic], `alt="${esc(b.weapon)} ${pic === "image" ? "build" : "calibration"} in the Gunsmith"`)
          : `<p class="picture-empty">No screenshot for this build yet.<br>The code below still imports the full build.</p>`}
      </div>
      ${pic ? extLink(b[pic], "Open full size", "full-link") : ""}
      <div class="modal-code">
        ${codeRow(b)}
        ${prev ? `<div class="nav-btns">
          <button type="button" class="tab" data-open="${esc(prev.id)}" aria-label="Previous build: ${esc(prev.weapon)}">${icon.prev}${esc(prev.weapon)}</button>
          <button type="button" class="tab" data-open="${esc(next.id)}" aria-label="Next build: ${esc(next.weapon)}">${esc(next.weapon)}${icon.next}</button>
        </div>` : ""}
      </div>
      <p class="how-to">In ${esc(cfg.mode)}, open the ${esc(b.weapon)} in the Gunsmith, choose Import and paste the code.
        <button type="button" class="text-btn share-btn" data-share="${esc(b.id)}">${icon.link} Copy link to this build</button></p>
      ${b.note || b.clip ? `<div class="note-strip">
        ${avatarHTML("mini-avatar")}
        <p>${b.note ? `“${esc(b.note)}”` : `${esc(cfg.name)} ran this build on stream.`}</p>
        ${b.clip ? extLink(b.clip, "Watch the clip →") : ""}
      </div>` : ""}
    `;
  }

  // ── shell ──────────────────────────────────────────────────
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="shell">
      <aside class="rail" aria-label="About ${esc(cfg.name)}">
        <div class="rail-inner">
          <div class="rail-top">
            ${avatarHTML("avatar")}
            <div class="who">
              <h1>${esc(cfg.name)}</h1>
              <p>${esc(cfg.game)} streamer${cfg.schedule ? " · " + esc(cfg.schedule) : ""}</p>
            </div>
          </div>
          <div id="status">${statusHTML()}</div>
          ${cfg.tagline ? `<p class="tagline">${esc(cfg.tagline)}</p>` : ""}
          <ul class="rail-nav">
            <li><button type="button" id="nav-all" aria-pressed="true">All builds<span class="n">${builds.length}</span></button></li>
            <li><button type="button" id="nav-saved" aria-pressed="false">Saved<span class="n" id="saved-count">0</span></button></li>
          </ul>
          ${cfg.promo && safeUrl(cfg.promo.url) ? promoHTML(cfg.promo) : ""}
          ${cfg.socials.length ? `<ul class="socials">${cfg.socials.map((s) => `<li>${extLink(s.url, `${esc(s.label)}<span aria-hidden="true">→</span>`)}</li>`).join("")}</ul>` : ""}
        </div>
      </aside>

      <main class="main" id="builds">
        ${cfg.showSampleNotice ? `<p class="notice">Sample builds shown. Replace them with the real codes in <code>js/builds.js</code>.</p>` : ""}
        <p class="eyebrow">${esc(cfg.game)} · ${esc(cfg.mode)} loadouts</p>
        <div class="toolbar">
          <label class="search" for="search">
            ${icon.search}
            <input id="search" type="search" placeholder="Search a gun or code" autocomplete="off" aria-label="Search builds">
            <button type="button" class="clear-btn" id="clear" aria-label="Clear search" hidden>${icon.close}</button>
            <kbd aria-hidden="true" id="slash">/</kbd>
          </label>
          <div class="chips" role="group" aria-label="Weapon class">
            ${["All", ...categories].map((c) => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${c === "All"}">${esc(c)}</button>`).join("")}
          </div>
        </div>
        <p class="count" id="count" aria-live="polite"></p>
        <div class="grid" id="grid"></div>
        <div class="empty" id="empty" hidden></div>
        <p class="foot-note">Codes are for ${esc(cfg.game)} ${esc(cfg.mode)} and can stop working after a game update. If one breaks, check back after the next stream. Fan site, not affiliated with ${esc(cfg.game)}.</p>
      </main>
    </div>

    <div class="modal" id="modal" hidden>
      <div class="modal-backdrop" data-close></div>
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1" id="modal-panel"></div>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  `;

  const $ = (sel) => app.querySelector(sel);
  const grid = $("#grid");
  const empty = $("#empty");
  const search = $("#search");
  const modal = $("#modal");
  const panel = $("#modal-panel");
  const toastEl = $("#toast");

  // ── list ───────────────────────────────────────────────────
  function filtered() {
    const words = searchWords();
    return builds.filter((b) => {
      if (state.category !== "All" && b.category !== state.category) return false;
      if (state.savedOnly && !state.favs.has(b.id)) return false;
      const hay = [b.weapon, b.category, b.code, b.note].join(" ").toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }

  function render() {
    const list = filtered();
    grid.innerHTML = list.map(cardHTML).join("");
    grid.hidden = !list.length;
    empty.hidden = !!list.length;
    if (!list.length) empty.innerHTML = emptyHTML();

    const q = state.q.trim();
    const where = [state.category !== "All" && "in " + state.category, state.savedOnly && "saved"].filter(Boolean).join(", ");
    $("#count").innerHTML = `<strong>${plural(list.length, "build")}</strong>${q ? ` ${list.length === 1 ? "matches" : "match"} “${esc(q)}”` : ""}${where ? " " + esc(where) : ""}`;

    app.querySelectorAll("[data-cat]").forEach((el) => el.setAttribute("aria-pressed", String(el.dataset.cat === state.category)));
    $("#nav-all").setAttribute("aria-pressed", String(!state.savedOnly));
    $("#nav-saved").setAttribute("aria-pressed", String(state.savedOnly));
    $("#saved-count").textContent = state.favs.size;
    $("#clear").hidden = !state.q;
    $("#slash").hidden = !!state.q;
  }

  function setFilters(changes) {
    Object.assign(state, changes);
    if ("q" in changes) search.value = state.q;
    render();
  }
  const resetFilters = () => setFilters({ q: "", category: "All", savedOnly: false });

  // ── build viewer ───────────────────────────────────────────
  let lastFocus = null;

  function renderModal() {
    panel.innerHTML = modalHTML(byId(state.openId));
  }

  function openModal(id, pic, fromHash) {
    if (!byId(id)) return;
    if (modal.hidden) lastFocus = document.activeElement;
    Object.assign(state, { openId: id, pic: pic || "image" });
    renderModal();
    modal.hidden = false;
    document.documentElement.classList.add("no-scroll");
    panel.focus();
    if (!fromHash && location.hash !== "#" + id) {
      try { history.replaceState(null, "", "#" + id); } catch (e) {}
    }
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    state.openId = "";
    document.documentElement.classList.remove("no-scroll");
    if (location.hash) {
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    }
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  function step(dir) {
    const [prev, next] = neighbors(byId(state.openId));
    const to = dir < 0 ? prev : next;
    if (to) openModal(to.id, state.pic);
  }

  // Keeps Tab inside the open viewer.
  function trapFocus(e) {
    const items = [...panel.querySelectorAll("button,a[href]")];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ── copy, save, toast ──────────────────────────────────────
  let toastTimer;
  function toast(title, body, ok = true) {
    toastEl.innerHTML = `${ok ? `<span class="toast-icon">${icon.check}</span>` : ""}<span class="toast-body"><strong>${esc(title)}</strong>${body || ""}</span>`;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), ok ? 4200 : 5000);
  }

  // Resolves when the text is on the clipboard; rejects where the browser refuses.
  function writeClipboard(text) {
    try {
      return navigator.clipboard.writeText(text);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  function selectText(el) {
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function flashCopied(id) {
    app.querySelectorAll(`[data-copy="${CSS.escape(id)}"]`).forEach((btn) => {
      const row = btn.parentElement;
      const card = btn.closest(".card");
      const set = (on) => {
        btn.classList.toggle("copied", on);
        row.classList.toggle("copied-row", on);
        if (card) card.classList.toggle("is-copied", on);
        btn.innerHTML = copyLabel(on);
      };
      set(true);
      setTimeout(() => set(false), 2000);
    });
  }

  function copyBuild(id, btn) {
    const b = byId(id);
    writeClipboard(b.code).then(
      () => {
        flashCopied(id);
        toast(`${b.weapon} code copied`,
          `<span>Open the Gunsmith in ${esc(cfg.game)} → Import → paste.</span>` +
          (twitchUrl ? extLink(twitchUrl, `Enjoying the builds? Follow ${esc(cfg.name)} on Twitch →`) : ""));
      },
      () => {
        selectText(btn.parentElement.querySelector(".code"));
        toast("Couldn't copy automatically", "<span>The code is selected. Press Ctrl+C (or long-press and Copy on a phone).</span>", false);
      }
    );
  }

  function copyLink(id) {
    const url = location.href.split("#")[0] + "#" + id;
    writeClipboard(url).then(
      () => toast("Link copied", "<span>Anyone opening it lands on this build.</span>"),
      () => toast("Couldn't copy the link", `<span>${esc(url)}</span>`, false)
    );
  }

  function toggleFav(id) {
    const b = byId(id);
    const saved = !state.favs.has(id);
    if (saved) state.favs.add(id);
    else state.favs.delete(id);
    store.set(FAV_KEY, [...state.favs]);
    toast(saved ? `${b.weapon} saved` : `${b.weapon} removed from saved`, "<span>Saved builds stay on this device.</span>");
    render();
    if (!modal.hidden) renderModal();
  }

  // ── events ─────────────────────────────────────────────────
  app.addEventListener("click", (e) => {
    const t = e.target.closest("[data-copy],[data-fav],[data-pic-tab],[data-open],[data-close],[data-share],[data-reset],[data-cat]");
    if (!t) return;
    const d = t.dataset;
    if ("copy" in d) copyBuild(d.copy, t);
    else if ("fav" in d) toggleFav(d.fav);
    else if ("picTab" in d) {
      state.pic = d.picTab;
      renderModal();
      panel.querySelector(`[data-pic-tab="${d.picTab}"]`).focus();
    } else if ("open" in d) openModal(d.open, d.pic || (modal.hidden ? "image" : state.pic));
    else if ("close" in d) closeModal();
    else if ("share" in d) copyLink(d.share);
    else if ("reset" in d) resetFilters();
    else if ("cat" in d) setFilters({ category: d.cat });
  });

  search.addEventListener("input", () => setFilters({ q: search.value }));
  $("#clear").addEventListener("click", () => {
    setFilters({ q: "" });
    search.focus();
  });
  $("#nav-all").addEventListener("click", () => setFilters({ savedOnly: false }));
  $("#nav-saved").addEventListener("click", () => {
    setFilters({ savedOnly: true });
    if (window.matchMedia("(max-width: 720px)").matches) $("#builds").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.hidden) {
      if (e.key === "Escape") closeModal();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "Tab") trapFocus(e);
      return;
    }
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
    if (e.key === "/" && !typing) {
      e.preventDefault();
      search.focus();
    }
  });

  // A link ending in #<build id> opens that build.
  function syncHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (byId(id)) openModal(id, "image", true);
    else if (!id) closeModal();
  }
  window.addEventListener("hashchange", syncHash);

  // ── live status ────────────────────────────────────────────
  // decapi.me is a free public Twitch status service. If it fails, the box stays a normal Twitch link.
  async function decapi(what) {
    const res = await fetch(`https://decapi.me/twitch/${what}/${encodeURIComponent(cfg.twitch)}`, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    // Treat the answer as plain text and keep it short; it is escaped wherever it is shown.
    return (await res.text()).trim().slice(0, 140);
  }

  async function checkLive() {
    let on = false;
    let title = cfg.liveTitle;
    try {
      // Live answers look like "1 hour, 5 minutes, 2 seconds"; offline is "<name> is offline".
      const uptime = (await decapi("uptime")).toLowerCase();
      on = /\d+\s+(second|minute|hour|day)/.test(uptime) && !uptime.includes("offline");
      if (on && !title) title = await decapi("title").catch(() => "");
    } catch (e) {}
    if (on === live.on && title === live.title) return;
    Object.assign(live, { on, title });
    $("#status").innerHTML = statusHTML();
    if (!empty.hidden) empty.innerHTML = emptyHTML();
  }

  // ── start ──────────────────────────────────────────────────
  render();
  syncHash();
  if (cfg.live === "auto" && cfg.twitch) {
    checkLive();
    setInterval(checkLive, 120000);
  }
})();
