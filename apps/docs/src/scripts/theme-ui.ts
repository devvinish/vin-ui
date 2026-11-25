/**
 * Site UI: header theme controls, Customize drawer, ⌘K search, code tabs and copy buttons.
 * All theme logic comes from @vinui/theme; this file only wires it to the page.
 */
import { STYLES } from "@vinui/styles";
import {
  DEFAULT_THEME, normalizeTheme, applyTheme, themeToAttributes, loadTheme, saveTheme,
  themeFromQuery, themeToQuery, themeToHtml, themeToCss, themeToCli,
  serializeTheme, parseTheme, listSavedThemes, saveNamedTheme, deleteNamedTheme, normalizeHex,
} from "@vinui/theme";

type Theme = ReturnType<typeof normalizeTheme>;
const root = document.documentElement;
const $ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => el.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => [...el.querySelectorAll<T>(sel)];
const styleName = (id: string) => STYLES.find((s) => s.id === id)?.name ?? id;

/* ───────────── theme state ───────────── */

let theme: Theme = loadTheme();
const shared = themeFromQuery(location.search);
if (Object.keys(shared).length) {
  theme = normalizeTheme({ ...theme, ...shared });
  setTimeout(() => toast(`Applied a shared theme: ${styleName(theme.style)}`), 300);
}

function setTheme(patch: Partial<Theme>, { quiet = false } = {}) {
  theme = applyTheme(root, { ...theme, ...patch });
  saveTheme(theme);
  try { localStorage.setItem("vinui:boot", JSON.stringify(themeToAttributes(theme))); } catch {}
  syncUi();
  if (!quiet) document.dispatchEvent(new CustomEvent("vinui:theme", { detail: theme }));
}

const isDark = () => theme.mode === "dark" || (theme.mode === "system" && matchMedia("(prefers-color-scheme: dark)").matches);

function syncUi() {
  for (const el of $$("[data-style-name]")) el.textContent = styleName(theme.style);
  for (const el of $$("[data-set-style]")) el.setAttribute(el.getAttribute("role") === "menuitemradio" ? "aria-checked" : "aria-pressed", String(el.dataset.setStyle === theme.style));
  for (const el of $$("[data-demo-style]")) el.setAttribute("aria-pressed", String(el.dataset.demoStyle === theme.style));
  for (const el of $$("[data-set-accent]")) el.setAttribute("aria-checked", String(el.dataset.setAccent === theme.accent));
  for (const el of $$<HTMLInputElement>("[data-accent-input]")) el.value = theme.accent;
  for (const el of $$("[data-accent-hex]")) el.textContent = theme.accent;
  for (const el of $$("[data-opt]")) el.setAttribute("aria-pressed", String((theme as any)[el.dataset.opt!] === el.dataset.val));
  const ff = $<HTMLInputElement>("[data-font-family]");
  if (ff) { ff.hidden = theme.font !== "custom" && !ff.matches(":focus"); if (document.activeElement !== ff) ff.value = theme.fontFamily; }
  const now = `${styleName(theme.style)} · ${isDark() ? "dark" : "light"}`;
  for (const el of $$("[data-style-now]")) el.textContent = now;
  for (const el of $$("[data-current-style]")) el.classList.toggle("current", el.dataset.currentStyle === theme.style);
  renderSaved();
}

setTheme({}, { quiet: true });
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => syncUi());

/* ───────────── toast + clipboard ───────────── */

let toastTimer = 0;
function toast(msg: string) {
  const el = $("[data-toast]");
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (el.hidden = true), 2200);
}
async function copy(text: string, label = "Copied") {
  try { await navigator.clipboard.writeText(text); toast(label); }
  catch { toast("Couldn't copy. Select the text and copy it by hand."); }
}

/* ───────────── header popovers ───────────── */

function closePops(except?: string) {
  for (const p of $$("[data-pop]")) if (p.dataset.pop !== except) p.hidden = true;
  for (const t of $$("[data-pop-trigger]")) if (t.dataset.popTrigger !== except) t.setAttribute("aria-expanded", "false");
}
for (const trigger of $$("[data-pop-trigger]")) {
  trigger.addEventListener("click", () => {
    const panel = $(`[data-pop="${trigger.dataset.popTrigger}"]`)!;
    const open = panel.hidden;
    closePops(trigger.dataset.popTrigger);
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    if (open) ($("[aria-checked='true']", panel) ?? $("button, input", panel))?.focus();
  });
}
document.addEventListener("click", (e) => {
  const t = e.target as Element;
  if (!t.closest(".hdr-pop")) closePops();
});

document.addEventListener("click", (e) => {
  const t = (e.target as Element).closest<HTMLElement>("[data-set-style], [data-demo-style], [data-set-accent], [data-opt]");
  if (!t) return;
  if (t.dataset.setStyle) { setTheme({ style: t.dataset.setStyle }); closePops(); $("[data-pop-trigger='style']")?.focus(); }
  else if (t.dataset.demoStyle) setTheme({ style: t.dataset.demoStyle });
  else if (t.dataset.setAccent) setTheme({ accent: t.dataset.setAccent });
  else if (t.dataset.opt) {
    const key = t.dataset.opt, val = t.dataset.val!;
    if (key === "font" && val === "custom") {
      const ff = $<HTMLInputElement>("[data-font-family]")!;
      ff.hidden = false; ff.focus();
      if (theme.fontFamily) setTheme({ font: "custom" });
      return;
    }
    setTheme({ [key]: val } as Partial<Theme>);
  }
});

for (const input of $$<HTMLInputElement>("[data-accent-input]")) {
  input.addEventListener("input", () => { const hex = normalizeHex(input.value); if (hex) setTheme({ accent: hex }); });
}
const fontInput = $<HTMLInputElement>("[data-font-family]");
fontInput?.addEventListener("change", () => {
  const family = fontInput.value.trim();
  setTheme(family ? { font: "custom", fontFamily: family } : { font: "default", fontFamily: "" });
});

/* ───────────── Customize drawer ───────────── */

const drawer = $("[data-drawer]"), backdrop = $("[data-drawer-backdrop]");
let lastFocus: HTMLElement | null = null;
function openDrawer() {
  if (!drawer || !backdrop) return;
  lastFocus = document.activeElement as HTMLElement;
  closePops();
  drawer.hidden = backdrop.hidden = false;
  $<HTMLElement>("[data-close-customize]", drawer)?.focus();
}
function closeDrawer() {
  if (!drawer || drawer.hidden) return;
  drawer.hidden = backdrop!.hidden = true;
  lastFocus?.focus();
}
for (const b of $$("[data-open-customize]")) b.addEventListener("click", openDrawer);
for (const b of $$("[data-close-customize]")) b.addEventListener("click", closeDrawer);
backdrop?.addEventListener("click", closeDrawer);
drawer?.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return; // keep focus inside the drawer
  const items = $$<HTMLElement>("button, input:not([hidden]), [href]", drawer).filter((el) => !el.hidden && el.offsetParent !== null);
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

for (const b of $$("[data-copy-theme]")) {
  b.addEventListener("click", () => {
    const kind = b.dataset.copyTheme;
    const text = kind === "html" ? themeToHtml(theme) : kind === "css" ? themeToCss(theme) : themeToCli(theme);
    copy(text, `Copied ${kind!.toUpperCase()}`);
  });
}
$("[data-share-theme]")?.addEventListener("click", () => {
  const url = location.origin + location.pathname + themeToQuery(theme);
  copy(url, "Share link copied");
});
$("[data-export-theme]")?.addEventListener("click", () => {
  const blob = new Blob([serializeTheme(theme, `VinUI ${styleName(theme.style)}`)], { type: "application/json" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "vin-theme.json" });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast("Exported vin-theme.json");
});
const importFile = $<HTMLInputElement>("[data-import-file]");
$("[data-import-theme]")?.addEventListener("click", () => importFile?.click());
importFile?.addEventListener("change", async () => {
  const file = importFile.files?.[0];
  importFile.value = "";
  if (!file) return;
  try {
    const { theme: t, name, warnings } = parseTheme(await file.text());
    setTheme(t);
    toast(warnings.length ? `Imported "${name}" with ${warnings.length} warning(s): ${warnings[0]}` : `Imported "${name}"`);
  } catch (err) { toast((err as Error).message); }
});
$("[data-reset-theme]")?.addEventListener("click", () => { setTheme({ ...DEFAULT_THEME }); toast("Reset to defaults"); });

$<HTMLFormElement>("[data-save-form]")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $<HTMLInputElement>("[data-save-name]")!;
  const name = input.value.trim();
  if (!name) return;
  saveNamedTheme(name, theme);
  input.value = "";
  renderSaved();
  toast(`Saved "${name}"`);
});
function renderSaved() {
  const list = $("[data-saved-list]");
  if (!list) return;
  const saved = listSavedThemes();
  list.replaceChildren(...saved.map(({ name, theme: t }) => {
    const li = document.createElement("li");
    const dot = Object.assign(document.createElement("i"), { className: "acc-dot" });
    dot.style.background = t.accent;
    const label = Object.assign(document.createElement("span"), { textContent: `${name} · ${styleName(t.style)}` });
    const apply = Object.assign(document.createElement("button"), { type: "button", textContent: "Apply" });
    apply.addEventListener("click", () => { setTheme(t); toast(`Applied "${name}"`); });
    const del = Object.assign(document.createElement("button"), { type: "button", textContent: "Delete" });
    del.setAttribute("aria-label", `Delete ${name}`);
    del.addEventListener("click", () => { deleteNamedTheme(name); renderSaved(); });
    li.append(dot, label, apply, del);
    return li;
  }));
  if (!saved.length) list.innerHTML = '<li class="muted" style="border-style:dashed">No saved themes yet.</li>';
}

/* ───────────── ⌘K search ───────────── */

type Entry = { title: string; section: string; url: string };
const index: Entry[] = JSON.parse($("#search-index")?.textContent || "[]");
const palette = $("[data-palette]"), pInput = $<HTMLInputElement>("[data-palette-input]"), pList = $("[data-palette-list]");
let sel = 0, results: Entry[] = [];
function renderResults() {
  const q = pInput!.value.trim().toLowerCase();
  results = q ? index.filter((e) => (e.title + " " + e.section).toLowerCase().includes(q)) : index;
  sel = Math.min(sel, Math.max(0, results.length - 1));
  pList!.innerHTML = "";
  if (!results.length) { pList!.innerHTML = '<li class="empty">No results.</li>'; return; }
  results.forEach((r, i) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", String(i === sel));
    const a = Object.assign(document.createElement("a"), { href: r.url, className: i === sel ? "sel" : "" });
    a.append(r.title, Object.assign(document.createElement("span"), { textContent: r.section }));
    li.append(a);
    pList!.append(li);
  });
  pList!.querySelector(".sel")?.scrollIntoView({ block: "nearest" });
}
function openSearch() { if (!palette) return; closePops(); palette.hidden = false; pInput!.value = ""; sel = 0; renderResults(); pInput!.focus(); }
function closeSearch() { if (palette && !palette.hidden) palette.hidden = true; }
for (const b of $$("[data-open-search]")) b.addEventListener("click", openSearch);
palette?.addEventListener("click", (e) => { if (e.target === palette) closeSearch(); });
pInput?.addEventListener("input", () => { sel = 0; renderResults(); });
pInput?.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, results.length - 1); renderResults(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); renderResults(); }
  else if (e.key === "Enter" && results[sel]) location.href = results[sel].url;
});

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); palette?.hidden ? openSearch() : closeSearch(); }
  else if (e.key === "/" && !(e.target as Element).closest("input, textarea, [contenteditable]")) { e.preventDefault(); openSearch(); }
  else if (e.key === "Escape") { closeSearch(); closeDrawer(); closePops(); }
});

/* ───────────── docs page helpers ───────────── */

// Example tabs (HTML / React / Vue / Svelte), remembered across examples.
const savedFw = (() => { try { return localStorage.getItem("vinui:framework") || "html"; } catch { return "html"; } })();
function showFramework(fw: string) {
  for (const tabs of $$("[data-tabs]")) {
    // A component not yet ported to that framework falls back to HTML.
    const show = $$("[data-tab]", tabs).some((t) => t.dataset.tab === fw) ? fw : "html";
    for (const t of $$("[data-tab]", tabs)) { t.setAttribute("aria-selected", String(t.dataset.tab === show)); t.tabIndex = t.dataset.tab === show ? 0 : -1; }
    for (const p of $$("[data-panel]", tabs)) p.hidden = p.dataset.panel !== show;
  }
}
showFramework(savedFw);
document.addEventListener("click", (e) => {
  const tab = (e.target as Element).closest<HTMLElement>("[data-tab]");
  if (!tab) return;
  showFramework(tab.dataset.tab!);
  try { localStorage.setItem("vinui:framework", tab.dataset.tab!); } catch {}
});

// Arrow keys move between the framework tabs.
document.addEventListener("keydown", (e) => {
  const tab = (e.target as Element).closest<HTMLElement>("[data-tabs] [data-tab]");
  if (!tab || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
  const all = $$("[data-tab]", tab.parentElement!);
  const i = all.indexOf(tab);
  const next = e.key === "Home" ? all[0] : e.key === "End" ? all[all.length - 1] : all[(i + (e.key === "ArrowRight" ? 1 : -1) + all.length) % all.length];
  e.preventDefault();
  next.click();
  next.focus();
});

// Copy buttons on code blocks.
document.addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLElement>("[data-copy]");
  if (!b) return;
  const text = b.dataset.copyText ?? b.closest(".code, .cmd")?.querySelector("pre, code")?.textContent ?? "";
  copy(text.trim());
});

// Mobile sidebar.
const menu = $("[data-menu-toggle]");
menu?.addEventListener("click", () => {
  const open = document.body.classList.toggle("nav-open");
  menu.setAttribute("aria-expanded", String(open));
});

// Highlight the current section in "On this page".
const tocLinks = $$<HTMLAnchorElement>("[data-toc-link]");
if (tocLinks.length && "IntersectionObserver" in window) {
  const byId = new Map(tocLinks.map((a) => [a.hash.slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) {
      for (const a of tocLinks) a.classList.toggle("active", a === byId.get(en.target.id));
    }
  }, { rootMargin: "-80px 0px -70% 0px" });
  for (const id of byId.keys()) { const h = document.getElementById(id); if (h) io.observe(h); }
}
