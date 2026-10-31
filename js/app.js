(function () {
  "use strict";

  const data = window.GUN_BUILDS || { config: {}, builds: [] };
  const cfg = Object.assign(
    { name: "Streamer", avatar: "", game: "Delta Force", mode: "Operations", twitch: "", live: false, liveTitle: "", schedule: "", tagline: "", showSampleNotice: false, socials: [] },
    data.config
  );
  const builds = (data.builds || []).map((b, i) => Object.assign({ order: i }, b));
  const FAV_KEY = "goddess-loadouts:favs";

  // localStorage can be blocked (private windows, embeds), so every access is guarded.
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
    favs: new Set(store.get(FAV_KEY, []).filter((id) => builds.some((b) => b.id === id))),
    openId: "",
    pic: "image"
  };

  // ── helpers ────────────────────────────────────────────────
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uniq = (arr) => [...new Set(arr.filter(Boolean))];
  const byId = (id) => builds.find((b) => b.id === id);
  const initials = (name) => String(name).split(/[\s_-]+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const fmtDate = (iso) => {
    const d = new Date(iso + "T00:00:00");
    return isNaN(d) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };
  // Wraps every match of the search words in <mark>, on already-escaped text.
  function highlight(text) {
    const words = state.q.trim().split(/\s+/).filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const safe = esc(text);
    if (!words.length) return safe;
    return safe.replace(new RegExp("(" + words.map(esc).join("|") + ")", "gi"), "<mark>$1</mark>");
  }

  const categories = uniq(builds.map((b) => b.category));
  const twitchUrl = cfg.twitch ? "https://www.twitch.tv/" + encodeURIComponent(cfg.twitch) : "";
  const avatarHTML = (cls) =>
    cfg.avatar ? `<img class="${cls}" src="${esc(cfg.avatar)}" alt="">` : `<span class="${cls}" aria-hidden="true">${esc(initials(cfg.name))}</span>`;

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
    ${[0, 1, 2, 3, 4].map((i) => `<g transform="translate(18 ${112 - i * 15})"><ellipse cx="44" cy="10" rx="44" ry="13" fill="#a8741c" stroke="none"/><rect x="0" y="0" width="88" height="10" fill="#a8741c" stroke="none"/><ellipse cx="44" cy="0" rx="44" ry="13" fill="#f2c14e" stroke="#c48a22" stroke-width="2"/></g>`).join("")}
    <g transform="translate(118 38) rotate(14)"><circle r="34" fill="#c48a22" stroke="none"/><circle r="31" fill="#f6cf5f" stroke="none"/><circle r="23" fill="none" stroke="#c48a22" stroke-width="3"/><text x="0" y="8" text-anchor="middle" font-family="Chakra Petch, sans-serif" font-weight="700" font-size="22" fill="#8a5a10" stroke="none">+</text></g>
  </svg>`;

  function promoHTML(p) {
    return `<a class="promo" href="${esc(p.url)}" target="_blank" rel="noopener sponsored">
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

  // live: "auto" asks decapi.me (a free public Twitch status service) every 2 minutes;
  // true/false force it. If the check fails the box just stays a normal Twitch link.
  const live = { on: cfg.live === true, title: cfg.liveTitle };

  function statusHTML() {
    if (!twitchUrl) return "";
    if (live.on) {
      return `<a class="status is-live" href="${twitchUrl}" target="_blank" rel="noopener">
        <i class="dot" aria-hidden="true"></i>
        <span><strong>Live now on Twitch</strong><small>${esc(live.title || "Watch " + cfg.name + " play " + cfg.game)}</small></span>
      </a>`;
    }
    return `<a class="status" href="${twitchUrl}" target="_blank" rel="noopener">
      <i class="dot" aria-hidden="true"></i>
      <span><strong>twitch.tv/${esc(cfg.twitch)}</strong><small>${cfg.schedule ? "Streams " + esc(cfg.schedule) : "Follow to catch the next stream"}</small></span>
    </a>`;
  }

  function codeRow(b) {
    return `<div class="code-row">
      <code class="code" title="${esc(b.code)}">${highlight(b.code)}</code>
      <button class="copy-btn" type="button" data-copy="${esc(b.id)}" aria-label="Copy ${esc(b.weapon)} build code">${icon.copy}<span>Copy</span></button>
    </div>`;
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
        ${cfg.promo && cfg.promo.url ? promoHTML(cfg.promo) : ""}
        ${cfg.socials.length ? `<ul class="socials">${cfg.socials.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}<span aria-hidden="true">→</span></a></li>`).join("")}</ul>` : ""}
       </div>
      </aside>

      <main class="main" id="builds">
        ${cfg.showSampleNotice ? `<p class="notice">Sample builds shown. Replace them with the real codes in <code>js/builds.js</code>.</p>` : ""}
        <div>
          <p class="eyebrow">${esc(cfg.game)} · ${esc(cfg.mode)} loadouts</p>
        </div>
        <div class="toolbar">
          <label class="search" for="search">
            ${icon.search}
            <input id="search" type="search" placeholder="Search a gun or code" autocomplete="off" aria-label="Search builds">
            <button type="button" class="clear-btn" id="clear" aria-label="Clear search" hidden>${icon.close}</button>
            <kbd aria-hidden="true" id="slash">/</kbd>
          </label>
          <div class="chips" role="group" aria-label="Weapon class">
            ${["All", ...categories].map((c) => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${c === "All"}">${esc(c === "All" ? "All" : c)}</button>`).join("")}
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
    const words = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return builds
      .filter((b) => {
        if (state.category !== "All" && b.category !== state.category) return false;
        if (state.savedOnly && !state.favs.has(b.id)) return false;
        const hay = [b.weapon, b.category, b.code, b.note].join(" ").toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.order - b.order);
  }

  function cardHTML(b) {
    const fav = state.favs.has(b.id);
    const shot = b.image
      ? `<button type="button" class="shot" data-open="${esc(b.id)}" data-pic="image" aria-label="View ${esc(b.weapon)} build"><img src="${esc(b.image)}" alt="" loading="lazy"></button>`
      : `<div class="shot shot-empty">Screenshot coming soon</div>`;
    return `<article class="card" data-card="${esc(b.id)}">
      <div class="card-head">
        <div>
          <h3 class="card-title"><button type="button" data-open="${esc(b.id)}">${highlight(b.weapon)}</button></h3>
          <p class="cat">${esc(b.category)}${b.updated ? " · " + esc(fmtDate(b.updated)) : ""}</p>
        </div>
        <button type="button" class="star" data-fav="${esc(b.id)}" aria-pressed="${fav}" aria-label="${fav ? "Remove " + esc(b.weapon) + " from saved" : "Save " + esc(b.weapon)}">${icon.star}</button>
      </div>
      ${shot}
      ${codeRow(b)}
      <div class="card-foot">
        ${b.image ? `<button type="button" class="text-btn" data-open="${esc(b.id)}" data-pic="image">View build</button>` : ""}
        ${b.calibration ? `<button type="button" class="text-btn" data-open="${esc(b.id)}" data-pic="calibration">Calibration</button>` : ""}
        ${!b.image && !b.calibration ? `<button type="button" class="text-btn" data-open="${esc(b.id)}">Details</button>` : ""}
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
        <button type="button" class="btn" data-reset>Clear search</button>
        ${twitchUrl ? `<a class="btn btn-accent" href="${twitchUrl}" target="_blank" rel="noopener">Ask in Twitch chat</a>` : ""}
      </div>`;
  }

  function render() {
    const list = filtered();
    grid.innerHTML = list.map(cardHTML).join("");
    grid.hidden = list.length === 0;
    empty.hidden = list.length !== 0;
    if (!list.length) empty.innerHTML = emptyHTML();

    const n = list.length;
    const where = [state.category !== "All" ? "in " + state.category : "", state.savedOnly ? "saved" : ""].filter(Boolean).join(", ");
    $("#count").innerHTML = state.q.trim()
      ? `<strong>${n} ${n === 1 ? "build" : "builds"}</strong> match “${esc(state.q.trim())}”${where ? " " + esc(where) : ""}`
      : `<strong>${n} ${n === 1 ? "build" : "builds"}</strong>${where ? " " + esc(where) : ""}`;

    app.querySelectorAll("[data-cat]").forEach((el) => el.setAttribute("aria-pressed", String(el.dataset.cat === state.category)));
    $("#nav-all").setAttribute("aria-pressed", String(!state.savedOnly));
    $("#nav-saved").setAttribute("aria-pressed", String(state.savedOnly));
    $("#saved-count").textContent = state.favs.size;
    $("#clear").hidden = !state.q;
    $("#slash").hidden = !!state.q;
  }

  function resetFilters() {
    Object.assign(state, { q: "", category: "All", savedOnly: false });
    search.value = "";
    render();
  }

  // ── build viewer ───────────────────────────────────────────
  let lastFocus = null;

  function modalHTML(b) {
    const pics = ["image", "calibration"].filter((k) => b[k]);
    const pic = pics.includes(state.pic) ? state.pic : pics[0];
    const list = filtered();
    const pool = list.some((x) => x.id === b.id) ? list : builds;
    const i = pool.findIndex((x) => x.id === b.id);
    const prev = pool.length > 1 ? pool[(i - 1 + pool.length) % pool.length] : null;
    const next = pool.length > 1 ? pool[(i + 1) % pool.length] : null;
    const fav = state.favs.has(b.id);
    return `
      <div class="modal-head">
        <div>
          <h2 id="modal-title">${esc(b.weapon)}</h2>
          <p>${[b.category, cfg.mode, b.updated ? "Updated " + fmtDate(b.updated) : ""].filter(Boolean).map(esc).join(" · ")}</p>
        </div>
        <div class="modal-tools">
          ${pics.length > 1 ? `<span role="tablist" aria-label="Screenshot" style="display:contents">
            ${pics.map((k) => `<button type="button" class="tab" role="tab" data-pic-tab="${k}" aria-selected="${k === pic}">${k === "image" ? "View build" : "Calibration"}</button>`).join("")}
          </span>` : ""}
          <button type="button" class="icon-btn star" data-fav="${esc(b.id)}" aria-pressed="${fav}" aria-label="${fav ? "Remove from saved" : "Save build"}">${icon.star}</button>
          <button type="button" class="icon-btn" data-close aria-label="Close">${icon.close}</button>
        </div>
      </div>
      <div class="picture">
        ${pic ? `<img src="${esc(b[pic])}" alt="${esc(b.weapon)} ${pic === "image" ? "build" : "calibration"} in the Gunsmith">` : `<p class="picture-empty">No screenshot for this build yet.<br>The code below still imports the full build.</p>`}
      </div>
      ${pic ? `<a class="full-link" href="${esc(b[pic])}" target="_blank" rel="noopener">Open full size</a>` : ""}
      <div class="modal-code">
        ${codeRow(b)}
        ${prev ? `<div class="nav-btns">
          <button type="button" class="tab" data-open="${esc(prev.id)}" aria-label="Previous build: ${esc(prev.weapon)}">${icon.prev}${esc(prev.weapon)}</button>
          <button type="button" class="tab" data-open="${esc(next.id)}" aria-label="Next build: ${esc(next.weapon)}">${esc(next.weapon)}${icon.next}</button>
        </div>` : ""}
      </div>
      <p class="how-to">In ${esc(cfg.mode)}, open the ${esc(b.weapon)} in the Gunsmith, choose Import and paste the code. <button type="button" class="text-btn" data-share="${esc(b.id)}" style="min-height:0;padding:0 0 0 6px">${icon.link} Copy link to this build</button></p>
      ${b.note || b.clip ? `<div class="note-strip">
        ${avatarHTML("mini-avatar")}
        ${b.note ? `<p>“${esc(b.note)}”</p>` : `<p>${esc(cfg.name)} ran this build on stream.</p>`}
        ${b.clip ? `<a href="${esc(b.clip)}" target="_blank" rel="noopener">Watch the clip →</a>` : ""}
      </div>` : ""}
    `;
  }

  function openModal(id, pic, fromHash) {
    const b = byId(id);
    if (!b) return;
    if (modal.hidden) lastFocus = document.activeElement;
    state.openId = id;
    state.pic = pic || "image";
    panel.innerHTML = modalHTML(b);
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
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus();
  }

  function step(dir) {
    const btns = panel.querySelectorAll(".nav-btns [data-open]");
    if (btns.length === 2) openModal(btns[dir < 0 ? 0 : 1].dataset.open, state.pic);
  }

  // ── copy + toast ───────────────────────────────────────────
  let toastTimer;
  function toast(title, body) {
    toastEl.innerHTML = `<span class="toast-icon">${icon.check}</span><span class="toast-body"><strong>${esc(title)}</strong>${body || ""}</span>`;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 4200);
  }

  function selectCode(btn) {
    const codeEl = btn && btn.parentElement && btn.parentElement.querySelector(".code");
    if (!codeEl) return;
    const range = document.createRange();
    range.selectNodeContents(codeEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function copyBuild(id, btn) {
    const b = byId(id);
    if (!b) return;
    const done = () => {
      toast(`${b.weapon} code copied`,
        `<span>Open the Gunsmith in ${esc(cfg.game)} → Import → paste.</span>${twitchUrl ? `<a href="${twitchUrl}" target="_blank" rel="noopener">Enjoying the builds? Follow ${esc(cfg.name)} on Twitch →</a>` : ""}`);
      app.querySelectorAll(`[data-copy="${CSS.escape(id)}"]`).forEach((el) => {
        el.classList.add("copied");
        el.parentElement.classList.add("copied-row");
        el.innerHTML = `${icon.check}<span>Copied</span>`;
        const card = el.closest(".card");
        if (card) card.classList.add("is-copied");
        setTimeout(() => {
          el.classList.remove("copied");
          el.parentElement.classList.remove("copied-row");
          el.innerHTML = `${icon.copy}<span>Copy</span>`;
          if (card) card.classList.remove("is-copied");
        }, 2000);
      });
    };
    const fail = () => {
      selectCode(btn);
      toastEl.innerHTML = `<span class="toast-body"><strong>Couldn't copy automatically</strong><span>The code is selected. Press Ctrl+C (or long-press and Copy on a phone).</span></span>`;
      toastEl.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove("show"), 5000);
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(b.code).then(done, fail);
      else fail();
    } catch (e) {
      fail();
    }
  }

  function copyLink(id) {
    const url = location.href.split("#")[0] + "#" + id;
    try {
      navigator.clipboard.writeText(url).then(() => toast("Link copied", "<span>Anyone opening it lands on this build.</span>"), () => toast("Couldn't copy the link", `<span>${esc(url)}</span>`));
    } catch (e) {
      toast("Couldn't copy the link", `<span>${esc(url)}</span>`);
    }
  }

  function toggleFav(id) {
    const b = byId(id);
    if (state.favs.has(id)) state.favs.delete(id);
    else state.favs.add(id);
    store.set(FAV_KEY, [...state.favs]);
    toast(state.favs.has(id) ? `${b.weapon} saved` : `${b.weapon} removed from saved`, "<span>Saved builds stay on this device.</span>");
    render();
    if (!modal.hidden && state.openId) panel.innerHTML = modalHTML(byId(state.openId));
  }

  // ── events ─────────────────────────────────────────────────
  app.addEventListener("click", (e) => {
    const t = e.target.closest("[data-copy],[data-fav],[data-open],[data-close],[data-cat],[data-share],[data-reset],[data-pic-tab]");
    if (!t) return;
    const d = t.dataset;
    if ("copy" in d) copyBuild(d.copy, t);
    else if ("fav" in d) toggleFav(d.fav);
    else if ("picTab" in d) {
      state.pic = d.picTab;
      panel.innerHTML = modalHTML(byId(state.openId));
      const tab = panel.querySelector(`[data-pic-tab="${d.picTab}"]`);
      if (tab) tab.focus();
    } else if ("open" in d) openModal(d.open, d.pic || (modal.hidden ? "image" : state.pic));
    else if ("close" in d) closeModal();
    else if ("share" in d) copyLink(d.share);
    else if ("reset" in d) resetFilters();
    else if ("cat" in d) {
      state.category = d.cat;
      render();
    }
  });

  search.addEventListener("input", () => {
    state.q = search.value;
    render();
  });
  $("#clear").addEventListener("click", () => {
    search.value = "";
    state.q = "";
    render();
    search.focus();
  });
  $("#nav-all").addEventListener("click", () => {
    state.savedOnly = false;
    render();
  });
  $("#nav-saved").addEventListener("click", () => {
    state.savedOnly = true;
    render();
    if (window.matchMedia("(max-width: 720px)").matches) $("#builds").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.hidden) {
      if (e.key === "Escape") return closeModal();
      if (e.key === "ArrowLeft") return step(-1);
      if (e.key === "ArrowRight") return step(1);
      // Keep Tab inside the open viewer.
      if (e.key === "Tab") {
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
      return;
    }
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
    if (e.key === "/" && !typing) {
      e.preventDefault();
      search.focus();
    }
  });

  function syncHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id && byId(id)) openModal(id, "image", true);
    else if (!id) closeModal();
  }
  window.addEventListener("hashchange", syncHash);

  async function checkLive() {
    const base = "https://decapi.me/twitch/";
    const name = encodeURIComponent(cfg.twitch);
    try {
      const res = await fetch(`${base}uptime/${name}`, { cache: "no-store" });
      const text = (await res.text()).trim().toLowerCase();
      // Live answers look like "1 hour, 5 minutes, 2 seconds"; offline is "<name> is offline".
      const on = res.ok && /\d+\s+(second|minute|hour|day)/.test(text) && !text.includes("offline");
      let title = cfg.liveTitle;
      if (on && !title) {
        try {
          const t = await fetch(`${base}title/${name}`, { cache: "no-store" });
          if (t.ok) title = (await t.text()).trim();
        } catch (e) {}
      }
      if (on === live.on && title === live.title) return;
      Object.assign(live, { on, title });
    } catch (e) {
      if (!live.on) return;
      live.on = false;
    }
    $("#status").innerHTML = statusHTML();
    if (!empty.hidden) empty.innerHTML = emptyHTML();
  }
  if (cfg.live === "auto" && cfg.twitch) {
    checkLive();
    setInterval(checkLive, 120000);
  }

  render();
  syncHash();
})();
