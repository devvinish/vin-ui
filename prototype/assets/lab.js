/* VinUI — Style Lab: header style picker, accent picker, playground, gallery */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  const STYLES = [
    { id: "precision", name: "Precision", short: "Crisp hairlines, quiet depth",
      desc: "Sharp 1px borders, subtle inner highlights and tight type. The calm, professional look of today's best developer tools.",
      tags: ["dev tools", "SaaS", "dashboards"], trend: "most used 2025–26" },
    { id: "tactile", name: "Tactile", short: "Physical, pressable buttons",
      desc: "Soft gradients and light from above make every control feel like a real button you can press. Modern skeuomorphism, done with restraint.",
      tags: ["productivity", "macOS-style apps", "tools"], trend: "rising trend" },
    { id: "clay", name: "Clay", short: "Puffy, friendly, inflated",
      desc: "Inflated shapes with soft inner shading, big radii and rounded type. Warm and playful without being childish.",
      tags: ["onboarding", "education", "consumer apps"], trend: "rising trend" },
    { id: "tonal", name: "Tonal", short: "Colour-led, pill shapes, springy",
      desc: "Surfaces are tinted from your accent colour, buttons are pills that morph when pressed, and motion is springy. Expressive and modern.",
      tags: ["mobile-first", "consumer", "personal apps"], trend: "expressive trend" },
    { id: "editorial", name: "Editorial", short: "Typographic, airy, magazine",
      desc: "Serif headlines, thin rules, underlined inputs and uppercase labels. Feels like a well-designed magazine.",
      tags: ["blogs", "portfolios", "content sites"], trend: "classic" },
    { id: "terminal", name: "Terminal", short: "Developer-native, monospace",
      desc: "Monospace everything, dashed outlines, [bracketed] buttons and $ prompts. Made for developers, which fits vinish.dev.",
      tags: ["dev blogs", "CLI docs", "side projects"], trend: "unique to VinUI" },
    { id: "paper", name: "Paper", short: "Warm, hand-made, human",
      desc: "Warm paper tones, a dotted texture, hand-drawn edges and handwritten labels. Personal and approachable.",
      tags: ["personal sites", "notes", "creative tools"], trend: "organic trend" },
    { id: "bento", name: "Bento", short: "Calm, layered, borderless",
      desc: "No borders: just soft grey layers, generous 24px radii and iOS-like controls. Clean, premium and familiar.",
      tags: ["product sites", "settings", "mobile"], trend: "popular layout style" },
  ];
  const ACCENTS = [
    ["Indigo", "#5b5bd6"], ["Blue", "#2563eb"], ["Sky", "#0284c7"], ["Teal", "#0d9488"], ["Emerald", "#059669"],
    ["Lime", "#65a30d"], ["Amber", "#d97706"], ["Orange", "#ea580c"], ["Rose", "#e11d48"], ["Violet", "#7c3aed"],
  ];
  const byId = (id) => STYLES.find((s) => s.id === id) || STYLES[0];

  let style = store.get("vin-lab-style", "precision");
  let accent = store.get("vin-accent", "#5b5bd6");
  let shortlist = store.get("vin-shortlist", "").split(",").filter(Boolean);

  /* ---------- accent helpers */
  function textOn(hex) {
    const n = parseInt(hex.slice(1), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return L > 0.4 ? "#111111" : "#ffffff";
  }

  /* ---------- header controls */
  const chev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>';
  const tick = '<svg class="chk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12l5 5L20 7"/></svg>';
  const actions = $(".header-actions");
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;gap:8px";
  wrap.innerHTML = `
    <div class="hdr-pop" id="pop-style">
      <button class="hdr-trigger" aria-haspopup="true" aria-expanded="false"><span class="lbl">Style</span><span class="nm" id="hdr-style-name"></span>${chev}</button>
      <div class="hdr-panel" role="menu"><h6>Component style · applies site-wide</h6>
        ${STYLES.map((s) => `<button class="style-opt" role="menuitemradio" data-style-opt="${s.id}">
          <span class="mini-swatch vin-stage" data-vin-style="${s.id}" style="border-radius:7px"><span class="vin-btn vin-btn--sm" style="height:14px;width:22px;padding:0;pointer-events:none"></span></span>
          <span><b>${s.name}</b><small>${s.short}</small></span>${tick}</button>`).join("")}
      </div>
    </div>
    <div class="hdr-pop" id="pop-accent">
      <button class="hdr-trigger" aria-haspopup="true" aria-expanded="false" aria-label="Accent colour"><span class="acc-dot"></span><span class="lbl">Accent</span>${chev}</button>
      <div class="hdr-panel" style="width:260px"><h6>Accent colour</h6>
        <div class="swatches">${ACCENTS.map(([n, h]) => `<button class="swatch" title="${n}" aria-label="${n}" data-acc="${h}" style="background:${h}"></button>`).join("")}</div>
        <label class="custom-acc"><input type="color" id="acc-custom" aria-label="Custom accent colour"> Custom<code id="acc-hex"></code></label>
      </div>
    </div>`;
  actions.insertBefore(wrap, actions.firstChild);

  $$(".hdr-pop").forEach((pop) => {
    const t = $(".hdr-trigger", pop);
    t.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !pop.classList.contains("open");
      $$(".hdr-pop").forEach((p) => { p.classList.remove("open"); $(".hdr-trigger", p).setAttribute("aria-expanded", "false"); });
      pop.classList.toggle("open", open);
      t.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".hdr-panel")) $$(".hdr-pop").forEach((p) => p.classList.remove("open"));
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $$(".hdr-pop").forEach((p) => p.classList.remove("open")); });

  /* ---------- apply */
  function applyAccent(hex) {
    accent = hex;
    document.documentElement.style.setProperty("--vin-accent", hex);
    document.documentElement.style.setProperty("--vin-accent-fg", textOn(hex));
    $$("[data-acc]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.acc.toLowerCase() === hex.toLowerCase())));
    $("#acc-custom").value = hex;
    $("#acc-hex").textContent = hex;
    store.set("vin-accent", hex);
    renderCode();
  }
  function applyStyle(id) {
    style = byId(id).id;
    $$("[data-lab-sync]").forEach((el) => (el.dataset.vinStyle = style));
    $$("[data-style-opt]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.styleOpt === style)));
    $("#hdr-style-name").textContent = byId(style).name;
    $$("[data-cur-name]").forEach((el) => (el.textContent = byId(style).name));
    $$("[data-cur-desc]").forEach((el) => (el.textContent = byId(style).desc));
    $$(".g-card").forEach((c) => c.classList.toggle("current", c.dataset.id === style));
    $$("[data-use]").forEach((b) => (b.textContent = b.dataset.use === style ? "In use" : "Use this style"));
    store.set("vin-lab-style", style);
    renderCode();
  }
  function renderCode() {
    const a = $("#code-cli"), h = $("#code-html");
    if (!a) return;
    a.innerHTML = `<span class="t-c"># set up once</span>\nnpx vin-ui@latest init --style <span class="t-s">${style}</span> --accent <span class="t-s">"${accent}"</span>\n\n<span class="t-c"># add components (they arrive in ${byId(style).name})</span>\nnpx vin-ui add button card dialog`;
    h.innerHTML = `<span class="t-t">&lt;html</span> <span class="t-a">data-vin-style</span>=<span class="t-s">"${style}"</span>\n      <span class="t-a">style</span>=<span class="t-s">"--vin-accent: ${accent}"</span><span class="t-t">&gt;</span>\n\n<span class="t-t">&lt;button</span> <span class="t-a">class</span>=<span class="t-s">"vin-btn"</span><span class="t-t">&gt;</span>Save<span class="t-t">&lt;/button&gt;</span>\n<span class="t-t">&lt;input</span> <span class="t-a">class</span>=<span class="t-s">"vin-input"</span> <span class="t-a">placeholder</span>=<span class="t-s">"Email"</span><span class="t-t">&gt;</span>`;
  }

  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-style-opt]");
    if (o) { applyStyle(o.dataset.styleOpt); $("#pop-style").classList.remove("open"); }
    const u = e.target.closest("[data-use]");
    if (u) { applyStyle(u.dataset.use); $("#playground").scrollIntoView({ behavior: "smooth", block: "start" }); }
    const s = e.target.closest("[data-acc]");
    if (s) applyAccent(s.dataset.acc);
    const p = e.target.closest("[data-short]");
    if (p) toggleShort(p.dataset.short);
  });
  $("#acc-custom").addEventListener("input", (e) => applyAccent(e.target.value));

  /* ---------- gallery */
  const mini = () => `
    <div class="vin-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div><p class="vin-card__title">Project settings</p><p class="vin-card__desc">Manage your workspace.</p></div>
        <span class="vin-badge vin-badge--success">Live</span>
      </div>
      <div class="vin-tabs__list" role="tablist" style="margin:14px 0 12px"><button class="vin-tabs__tab" role="tab" aria-selected="true">General</button><button class="vin-tabs__tab" role="tab" aria-selected="false">Team</button><button class="vin-tabs__tab" role="tab" aria-selected="false">Billing</button></div>
      <div style="display:grid;gap:12px">
        <div class="vin-field"><label class="vin-label">Project name</label><input class="vin-input" value="vin-ui-docs" aria-label="Project name"></div>
        <div class="vin-row"><label class="vin-check"><input type="checkbox" class="vin-checkbox" checked> Public project</label>
          <button class="vin-switch" role="switch" aria-checked="true" aria-label="Notifications"><span class="vin-switch__thumb"></span></button></div>
        <div style="display:grid;gap:6px;font-size:12px"><span>Storage · 64%</span><div class="vin-progress"><div class="vin-progress__bar" style="--value:64%"></div></div></div>
        <div style="display:flex;gap:8px;justify-content:flex-end"><button class="vin-btn vin-btn--ghost vin-btn--sm">Cancel</button><button class="vin-btn vin-btn--outline vin-btn--sm">Preview</button><button class="vin-btn vin-btn--sm">Save</button></div>
      </div>
    </div>`;
  const gallery = $("#gallery");
  gallery.innerHTML = STYLES.map((s, i) => `
    <article class="g-card" data-id="${s.id}">
      <div class="vin-stage" data-vin-style="${s.id}">${mini()}</div>
      <div class="g-meta">
        <div class="g-top"><h3><span class="g-num">0${i + 1}</span>${s.name}</h3></div>
        <p>${s.desc}</p>
        <div class="g-tags"><span class="trend">${s.trend}</span>${s.tags.map((t) => `<span>${t}</span>`).join("")}</div>
        <div class="g-actions"><button class="pick-btn" data-use="${s.id}">Use this style</button><button class="pick-btn" data-short="${s.id}" aria-pressed="false">☆ Shortlist</button></div>
      </div>
    </article>`).join("");

  function toggleShort(id) {
    if (shortlist.includes(id)) shortlist = shortlist.filter((x) => x !== id);
    else { shortlist.push(id); if (shortlist.length > 3) shortlist.shift(); }
    renderShort();
  }
  function renderShort() {
    $$("[data-short]").forEach((b) => {
      const on = shortlist.includes(b.dataset.short);
      b.setAttribute("aria-pressed", String(on));
      b.textContent = on ? "★ Shortlisted" : "☆ Shortlist";
    });
    $("#short-count").textContent = `${shortlist.length} / 3`;
    $("#short-list").textContent = shortlist.length ? shortlist.map((id) => byId(id).name).join(" · ") : "star up to 3 styles below";
    store.set("vin-shortlist", shortlist.join(","));
  }

  applyAccent(accent);
  applyStyle(style);
  renderShort();
})();
