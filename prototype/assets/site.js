/* VinUI docs site — shared shell + interactions (prototype) */
(function () {
  const BASE = document.body.dataset.base || ".";
  const PAGE = document.body.dataset.page || "";
  const store = {
    get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const url = (p) => `${BASE}/${p}`;

  const I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    sun: '<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    gh: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12l5 5L20 7"/></svg>',
  };
  window.VIN_ICONS = I;

  /* ---------------- Component catalogue (single source for hub, sidebar, search) */
  const C = [
    { slug: "button", name: "Button", cat: "Actions", ready: true, desc: "Trigger an action. 5 variants, 3 sizes.",
      thumb: '<button class="vin-btn">Button</button><button class="vin-btn vin-btn--outline">Outline</button>' },
    { slug: "badge", name: "Badge", cat: "Data display", desc: "Small status label for counts and states.",
      thumb: '<span class="vin-badge vin-badge--primary">New</span><span class="vin-badge vin-badge--success">Active</span><span class="vin-badge">Draft</span>' },
    { slug: "card", name: "Card", cat: "Data display", desc: "Container for grouped content.",
      thumb: '<div class="vin-card" style="width:200px;padding:14px"><div class="vin-card__bar">card.exe <span>×</span></div><div class="vin-card__body"><p class="vin-card__title">Monthly plan</p><p class="vin-card__desc">$12 / month</p></div></div>' },
    { slug: "avatar", name: "Avatar", cat: "Data display", desc: "User image with initials fallback.",
      thumb: '<div class="vin-avatar-group"><span class="vin-avatar vin-avatar--a">VK</span><span class="vin-avatar vin-avatar--b">AS</span><span class="vin-avatar vin-avatar--c">RM</span><span class="vin-avatar">+4</span></div>' },
    { slug: "input", name: "Input", cat: "Forms", desc: "Single-line text field with label & hint.",
      thumb: '<div class="vin-field" style="width:200px"><label class="vin-label">Email</label><input class="vin-input" placeholder="you@site.dev"></div>' },
    { slug: "checkbox", name: "Checkbox", cat: "Forms", desc: "Select one or many options.",
      thumb: '<div style="display:grid;gap:8px"><label class="vin-check"><input type="checkbox" class="vin-checkbox" checked> Accept terms</label><label class="vin-check"><input type="checkbox" class="vin-checkbox"> Newsletter</label></div>' },
    { slug: "switch", name: "Switch", cat: "Forms", desc: "Toggle a setting on or off.",
      thumb: '<label class="vin-check"><button class="vin-switch" role="switch" aria-checked="true"><span class="vin-switch__thumb"></span></button> Dark mode</label>' },
    { slug: "select", name: "Select", cat: "Forms", desc: "Pick one value from a list.",
      thumb: '<button class="vin-select" style="width:190px">Framework: React</button>' },
    { slug: "tabs", name: "Tabs", cat: "Navigation", desc: "Switch between related views.",
      thumb: '<div class="vin-tabs__list" role="tablist"><button class="vin-tabs__tab" role="tab" aria-selected="true">Account</button><button class="vin-tabs__tab" role="tab" aria-selected="false">Billing</button></div>' },
    { slug: "breadcrumb", name: "Breadcrumb", cat: "Navigation", desc: "Show where a page sits in the hierarchy.",
      thumb: '<ol class="vin-breadcrumb"><li>Home</li><li>Docs</li><li aria-current="page">Button</li></ol>' },
    { slug: "alert", name: "Alert", cat: "Feedback", desc: "Inline message for important info.",
      thumb: '<div class="vin-alert" style="width:220px"><div><p class="vin-alert__title">Heads up</p><p class="vin-alert__desc">You can add this via CLI.</p></div></div>' },
    { slug: "progress", name: "Progress", cat: "Feedback", desc: "Show completion of a task.",
      thumb: '<div style="width:200px;display:grid;gap:8px;font-size:12px"><span>Uploading… 64%</span><div class="vin-progress"><div class="vin-progress__bar" style="--value:64%"></div></div></div>' },
    { slug: "toast", name: "Toast", cat: "Feedback", desc: "Brief notification after an action.",
      thumb: '<div class="vin-card vin-toast" style="width:230px;padding:12px 14px"><div><p class="vin-card__title">Saved</p><p class="vin-card__desc">Changes are live.</p></div><button class="vin-btn vin-btn--sm vin-btn--outline">Undo</button></div>' },
    { slug: "dialog", name: "Dialog", cat: "Overlays", desc: "Modal window that needs a response.",
      thumb: '<div class="vin-card" style="width:220px;padding:14px"><p class="vin-card__title">Delete project?</p><p class="vin-card__desc">This cannot be undone.</p><div style="display:flex;gap:6px;justify-content:flex-end;margin-top:12px"><button class="vin-btn vin-btn--sm vin-btn--ghost">Cancel</button><button class="vin-btn vin-btn--sm vin-btn--danger">Delete</button></div></div>' },
    { slug: "tooltip", name: "Tooltip", cat: "Overlays", desc: "Short hint on hover or focus.",
      thumb: '<div style="display:grid;justify-items:center;gap:6px"><span class="vin-tooltip">Copy to clipboard</span><button class="vin-btn vin-btn--outline vin-btn--sm">Hover me</button></div>' },
    { slug: "dropdown-menu", name: "Dropdown Menu", cat: "Overlays", desc: "List of actions in a popover.",
      thumb: '<div class="vin-menu"><div class="vin-menu__item">Profile <kbd>⌘P</kbd></div><div class="vin-menu__item" data-active>Settings <kbd>⌘,</kbd></div><div class="vin-menu__item">Log out</div></div>' },
  ];
  window.VIN_COMPONENTS = C;
  const compHref = (c) => (c.ready ? url(`components/${c.slug}.html`) : url(`components/index.html#${c.slug}`));

  /* ---------------- Header */
  const nav = [
    ["docs", "Docs", "components/index.html#getting-started"],
    ["components", "Components", "components/index.html"],
    ["styles", "Styles", "styles/index.html"],
    ["lab", "Style Lab", "style-lab/index.html"],
  ];
  const header = $("#site-header");
  if (header) {
    header.outerHTML = `
    <header class="site-header"><div class="container">
      ${document.getElementById("sidebar") ? `<button class="icon-btn menu-btn" data-menu aria-label="Open navigation">${I.menu}</button>` : ""}
      <a class="brand" href="${url("index.html")}"><span class="brand-mark">V</span>VinUI<span class="brand-sub">vinish.dev</span></a>
      <nav class="nav" aria-label="Main">${nav.map(([k, l, h]) => `<a href="${url(h)}" ${k === PAGE ? 'aria-current="page"' : ""}>${l}</a>`).join("")}</nav>
      <div class="header-actions">
        <button class="search-btn" data-open-palette aria-label="Search components">${I.search}<span>Search components…</span><kbd class="k">⌘K</kbd></button>
        <a class="icon-btn" href="#" aria-label="GitHub">${I.gh}</a>
        <button class="icon-btn theme-toggle" data-theme-toggle aria-label="Toggle light or dark mode">${I.sun}${I.moon}</button>
      </div>
    </div></header>`;
  }

  /* ---------------- Sidebar (docs pages) */
  const side = $("#sidebar");
  if (side) {
    const cur = side.dataset.current;
    const cats = [...new Set(C.map((c) => c.cat))];
    const link = (href, label, key, extra = "", cls = "") =>
      `<a class="${cls}" href="${href}" ${key === cur ? 'aria-current="page"' : ""}>${label}${extra}</a>`;
    side.innerHTML = `
      <div class="side-group" id="getting-started"><h5>Getting started</h5>
        ${link(url("index.html"), "Introduction", "intro")}
        ${link(url("components/index.html#install"), "Installation", "install")}
        ${link(url("styles/index.html"), "Styles", "styles", '<span class="new">3 + 2</span>')}
        ${link(url("styles/index.html#contract"), "The style contract", "contract")}
        ${link("#", "Theming", "theming", "", "soon")}
        ${link("#", "AI / MCP / llms.txt", "ai", "", "soon")}
      </div>
      <div class="side-group"><h5>Components</h5>${link(url("components/index.html"), "All components", "all", `<span class="new">${C.length}</span>`)}</div>
      ${cats.map((cat) => `<div class="side-group"><h5>${cat}</h5>${C.filter((c) => c.cat === cat)
        .map((c) => link(compHref(c), c.name, c.slug, c.ready ? "" : "", c.ready ? "" : "soon")).join("")}</div>`).join("")}
      <div class="side-group"><h5>Coming next</h5>${link("#", "Blocks", "", "", "soon")}${link("#", "Templates", "", "", "soon")}${link("#", "Motion", "", "", "soon")}</div>`;
  }

  /* ---------------- Footer */
  const footer = $("#site-footer");
  if (footer) {
    footer.outerHTML = `
    <footer class="site-footer"><div class="container">
      <div class="footer-grid">
        <div><a class="brand" href="${url("index.html")}"><span class="brand-mark">V</span>VinUI</a>
          <p class="muted" style="margin:12px 0 0;max-width:280px">Free, open-source components in multiple styles for HTML, React, Vue and Svelte. Part of vinish.dev.</p></div>
        <div><h4>Library</h4><ul><li><a href="${url("components/index.html")}">Components</a></li><li><a href="${url("styles/index.html")}">Styles</a></li><li><a href="#">Blocks <span class="tag-soon">soon</span></a></li><li><a href="#">Templates <span class="tag-soon">soon</span></a></li></ul></div>
        <div><h4>Docs</h4><ul><li><a href="${url("components/index.html#install")}">Installation</a></li><li><a href="${url("styles/index.html#contract")}">Style contract</a></li><li><a href="#">CLI</a></li><li><a href="#">llms.txt</a></li></ul></div>
        <div><h4>vinish.dev</h4><ul><li><a href="#">Home</a></li><li><a href="#">Blog</a></li><li><a href="#">Tools</a></li><li><a href="#">GitHub</a></li></ul></div>
      </div>
      <div class="footer-bottom"><span>© 2026 vinish.dev · MIT licence · free forever</span><span>Built with VinUI</span></div>
    </div></footer>`;
  }

  /* ---------------- Theme */
  $$("[data-theme-toggle]").forEach((b) =>
    b.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      store.set("vin-theme", next);
    })
  );

  /* ---------------- Mobile nav */
  $$("[data-menu]").forEach((b) => b.addEventListener("click", () => document.body.classList.toggle("nav-open")));

  /* ---------------- Global style (Minimal / Glass / Brutalist) */
  function applyStyle(s) {
    $$("[data-vin-sync]").forEach((el) => (el.dataset.vinStyle = s));
    $$("[data-set-style]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setStyle === s)));
    $$("[data-style-name]").forEach((el) => (el.textContent = s));
    store.set("vin-style", s);
    document.dispatchEvent(new CustomEvent("vin:style", { detail: s }));
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-set-style]");
    if (b) applyStyle(b.dataset.setStyle);
  });
  applyStyle(store.get("vin-style", "minimal"));

  /* ---------------- Framework tabs (HTML / React / Vue / Svelte), remembered site-wide */
  function applyFw(fw) {
    $$("[data-fw]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.fw === fw)));
    $$("[data-fw-pane]").forEach((p) => (p.hidden = p.dataset.fwPane !== fw));
    store.set("vin-fw", fw);
  }
  if ($("[data-fw]")) {
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-fw]");
      if (b) applyFw(b.dataset.fw);
    });
    applyFw(store.get("vin-fw", "html"));
  }

  /* ---------------- Preview / Code toggles inside an example */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-view]");
    if (!b) return;
    const ex = b.closest(".example");
    $$("[data-view]", ex).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    $(".preview", ex).hidden = b.dataset.view !== "preview";
    $(".example-code", ex).hidden = b.dataset.view !== "code";
  });

  /* ---------------- Copy buttons */
  $$(".copy-btn").forEach((b) => { if (!b.innerHTML.trim()) b.innerHTML = `${I.copy}<span>Copy</span>`; });
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    const scope = b.closest(".code, .cmd, .example");
    const pres = $$("pre, code", scope).filter((p) => !p.closest("[hidden]"));
    const text = b.dataset.copy || (pres[0] ? pres[0].innerText : "");
    try { await navigator.clipboard.writeText(text); } catch (err) {}
    const old = b.innerHTML;
    b.innerHTML = `${I.check}<span>Copied</span>`;
    setTimeout(() => (b.innerHTML = old), 1400);
  });

  /* ---------------- Live component behaviour (switch, tabs) */
  document.addEventListener("click", (e) => {
    const sw = e.target.closest(".vin-switch");
    if (sw) { sw.setAttribute("aria-checked", String(sw.getAttribute("aria-checked") !== "true")); e.preventDefault(); }
    const tab = e.target.closest(".vin-tabs__tab");
    if (tab) $$(".vin-tabs__tab", tab.parentElement).forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
  });

  /* ---------------- Command palette (⌘K) */
  const pages = [
    { name: "Introduction", href: url("index.html"), kind: "Page" },
    { name: "All components", href: url("components/index.html"), kind: "Page" },
    { name: "Choose styles", href: url("styles/index.html"), kind: "Page" },
    { name: "The style contract", href: url("styles/index.html#contract"), kind: "Page" },
  ];
  const items = [...C.map((c) => ({ name: c.name, href: compHref(c), kind: c.cat })), ...pages];
  const back = document.createElement("div");
  back.className = "palette-backdrop";
  back.innerHTML = `<div class="palette" role="dialog" aria-label="Search"><input placeholder="Search components and docs…" aria-label="Search"><ul></ul>
    <div class="pal-foot"><span><kbd class="k">↑↓</kbd> move</span><span><kbd class="k">↵</kbd> open</span><span><kbd class="k">esc</kbd> close</span></div></div>`;
  document.body.appendChild(back);
  const pin = $("input", back), plist = $("ul", back);
  let sel = 0, shown = [];
  function renderPal() {
    const q = pin.value.trim().toLowerCase();
    shown = items.filter((i) => !q || i.name.toLowerCase().includes(q) || i.kind.toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    plist.innerHTML = shown.length
      ? shown.map((i, n) => `<li><a href="${i.href}" class="${n === sel ? "sel" : ""}">${i.name}<span>${i.kind}</span></a></li>`).join("")
      : '<li class="pal-head">No results</li>';
  }
  const openPal = () => { back.classList.add("open"); pin.value = ""; sel = 0; renderPal(); setTimeout(() => pin.focus(), 0); };
  const closePal = () => back.classList.remove("open");
  document.addEventListener("click", (e) => { if (e.target.closest("[data-open-palette]")) openPal(); });
  back.addEventListener("click", (e) => { if (e.target === back) closePal(); });
  pin.addEventListener("input", () => { sel = 0; renderPal(); });
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); back.classList.contains("open") ? closePal() : openPal(); }
    if (e.key === "/" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); openPal(); }
    if (!back.classList.contains("open")) return;
    if (e.key === "Escape") closePal();
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); renderPal(); }
    if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); renderPal(); }
    if (e.key === "Enter" && shown[sel]) location.href = shown[sel].href;
  });

  /* ---------------- Hub grid */
  const grid = $("#hub-grid");
  if (grid) {
    grid.innerHTML = C.map((c) => {
      const tag = c.ready ? "a" : "div";
      return `<${tag} class="comp-card" id="${c.slug}" data-name="${c.name.toLowerCase()} ${c.desc.toLowerCase()}" data-cat="${c.cat}" ${c.ready ? `href="${compHref(c)}"` : ""}>
        <div class="thumb vin-stage" data-vin-sync data-vin-style="minimal" ${c.ready ? "" : 'inert'}>${c.thumb}</div>
        <div class="info"><h3>${c.name}<span class="status ${c.ready ? "ready" : ""}">${c.ready ? "docs ready" : "preview"}</span></h3><p>${c.desc}</p></div>
      </${tag}>`;
    }).join("");
    applyStyle(store.get("vin-style", "minimal"));
    const chips = $("#hub-chips");
    const cats = ["All", ...new Set(C.map((c) => c.cat))];
    chips.innerHTML = cats.map((k) => `<button class="chip" data-cat="${k}" aria-pressed="${k === "All"}">${k}<span class="n">${k === "All" ? C.length : C.filter((c) => c.cat === k).length}</span></button>`).join("");
    const input = $("#hub-q");
    let cat = "All";
    const filter = () => {
      const q = input.value.trim().toLowerCase();
      let n = 0;
      $$(".comp-card", grid).forEach((card) => {
        const ok = (cat === "All" || card.dataset.cat === cat) && (!q || card.dataset.name.includes(q));
        card.style.display = ok ? "" : "none";
        if (ok) n++;
      });
      $("#hub-empty").style.display = n ? "none" : "block";
      $("#hub-count").textContent = `${n} component${n === 1 ? "" : "s"}`;
    };
    chips.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      cat = b.dataset.cat;
      $$(".chip", chips).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      filter();
    });
    input.addEventListener("input", filter);
    filter();
  }

  /* ---------------- Style picker (styles page) */
  const picks = $$("[data-pick]");
  if (picks.length) {
    let chosen = store.get("vin-picks", "minimal,glass,brutalist").split(",").filter(Boolean);
    const render = () => {
      picks.forEach((b) => {
        const on = chosen.includes(b.dataset.pick);
        b.setAttribute("aria-pressed", String(on));
        b.innerHTML = on ? `${I.check.replace("<svg", '<svg width="14" height="14"')} Picked` : "Pick this style";
        b.closest(".style-card").classList.toggle("picked", on);
      });
      $("#pick-count").textContent = `${chosen.length} / 3`;
      $("#pick-list").textContent = chosen.length ? chosen.map((s) => s[0].toUpperCase() + s.slice(1)).join(" · ") : "nothing yet";
      store.set("vin-picks", chosen.join(","));
    };
    picks.forEach((b) => b.addEventListener("click", () => {
      const s = b.dataset.pick;
      if (chosen.includes(s)) chosen = chosen.filter((x) => x !== s);
      else { chosen.push(s); if (chosen.length > 3) chosen.shift(); }
      render();
    }));
    render();
  }

  /* ---------------- TOC highlight */
  const tocLinks = $$(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) tocLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    }), { rootMargin: "-80px 0px -70% 0px" });
    tocLinks.forEach((a) => { const t = document.getElementById(a.getAttribute("href").slice(1)); if (t) io.observe(t); });
  }
})();
