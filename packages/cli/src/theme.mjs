// GENERATED from packages/theme/src/index.mjs by scripts/vendor-theme.mjs. Do not edit.
/**
 * VinUI theme engine.
 * Framework-free: works in the docs site, in users' apps, and in the CLI.
 *
 * A theme is a small plain object:
 *   { style, accent, mode, radius, gray, font, density, motion }
 * It is applied to ONE "theme root" element (usually <html>) as data attributes
 * plus a few CSS variables for the accent colour.
 */
const STYLE_IDS = ["precision","tactile","clay","tonal","editorial","terminal","paper","bento"];
const DEFAULT_STYLE = "precision";

export const THEME_VERSION = 1;

/** Every option, its allowed values and its default. "default" means "use the style's own value". */
export const OPTIONS = {
  style:   { values: STYLE_IDS, default: DEFAULT_STYLE },
  mode:    { values: ["system", "light", "dark"], default: "system" },
  radius:  { values: ["default", "none", "sm", "md", "lg", "full"], default: "default" },
  gray:    { values: ["neutral", "slate", "stone"], default: "neutral" },
  font:    { values: ["default", "inter", "geist", "system", "mono", "custom"], default: "default" },
  density: { values: ["compact", "default", "comfortable"], default: "default" },
  motion:  { values: ["full", "reduced", "off"], default: "full" },
};

export const ACCENTS = [
  { name: "Indigo", hex: "#5b5bd6" }, { name: "Blue", hex: "#2563eb" }, { name: "Sky", hex: "#0284c7" },
  { name: "Teal", hex: "#0d9488" }, { name: "Emerald", hex: "#059669" }, { name: "Lime", hex: "#65a30d" },
  { name: "Amber", hex: "#d97706" }, { name: "Orange", hex: "#ea580c" }, { name: "Rose", hex: "#e11d48" },
  { name: "Violet", hex: "#7c3aed" },
];

export const DEFAULT_THEME = Object.freeze({
  style: DEFAULT_STYLE,
  accent: "#5b5bd6",
  mode: "system",
  radius: "default",
  gray: "neutral",
  font: "default",
  fontFamily: "",
  density: "default",
  motion: "full",
});

/* ───────────────────────── colour maths ───────────────────────── */

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** "#ABC" / "abc" / "#aabbcc" → "#aabbcc", or null when invalid. */
export function normalizeHex(input) {
  const m = String(input ?? "").trim().match(HEX_RE);
  if (!m) return null;
  let h = m[1].toLowerCase();
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return "#" + h;
}
const rgbOf = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const hexOf = (rgb) => "#" + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("");

export function luminance(hex) {
  const c = rgbOf(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/** Black or white, whichever reads better on the given background. */
export function textOn(bg) {
  return contrast(bg, "#ffffff") >= contrast(bg, "#111111") ? "#ffffff" : "#111111";
}

/**
 * The accent shade to use for text/outlines on a given surface: the accent itself if it
 * already reaches `min` contrast, otherwise mixed step by step toward black or white.
 */
export function inkFor(accent, surface, min = 4.5) {
  if (contrast(accent, surface) >= min) return accent;
  const target = luminance(surface) > 0.5 ? [0, 0, 0] : [255, 255, 255];
  const a = rgbOf(accent);
  for (let pct = 5; pct <= 100; pct += 5) {
    const c = hexOf(a.map((v, i) => v + (target[i] - v) * (pct / 100)));
    if (contrast(c, surface) >= min) return c;
  }
  return hexOf(target);
}

/* ───────────────────────── theme objects ───────────────────────── */

/** Fill in defaults and drop anything invalid. Never throws. */
export function normalizeTheme(input = {}) {
  const t = { ...DEFAULT_THEME };
  for (const [key, opt] of Object.entries(OPTIONS)) {
    if (opt.values.includes(input[key])) t[key] = input[key];
  }
  t.accent = normalizeHex(input.accent) ?? DEFAULT_THEME.accent;
  t.fontFamily = typeof input.fontFamily === "string" ? input.fontFamily.replace(/[;{}<>]/g, "").slice(0, 120) : "";
  if (t.font === "custom" && !t.fontFamily) t.font = "default";
  return t;
}

/** Only the settings that differ from the defaults. */
export function diffFromDefault(theme) {
  const t = normalizeTheme(theme);
  return Object.fromEntries(Object.entries(t).filter(([k, v]) => v !== DEFAULT_THEME[k]));
}

/** Data attributes + CSS variables for a theme root. `null` means "remove this attribute". */
export function themeToAttributes(theme) {
  const t = normalizeTheme(theme);
  const attrs = {
    "data-vin-style": t.style,
    "data-vin-mode": t.mode === "system" ? null : t.mode,
    "data-vin-radius": t.radius === "default" ? null : t.radius,
    "data-vin-gray": t.gray === "neutral" ? null : t.gray,
    "data-vin-font": t.font === "default" ? null : t.font,
    "data-vin-density": t.density === "default" ? null : t.density,
    "data-vin-motion": t.motion === "full" ? null : t.motion,
  };
  const vars = {
    "--vin-accent": t.accent,
    "--vin-accent-fg": textOn(t.accent),
    "--vin-accent-ink-light": inkFor(t.accent, "#ffffff"),
    "--vin-accent-ink-dark": inkFor(t.accent, "#111113"),
  };
  if (t.font === "custom") vars["--vin-font"] = `"${t.fontFamily}", system-ui, sans-serif`;
  return { attrs, vars };
}

/** Apply a theme to an element (anything with setAttribute/removeAttribute/style.setProperty). */
export function applyTheme(el, theme) {
  const { attrs, vars } = themeToAttributes(theme);
  for (const [k, v] of Object.entries(attrs)) v === null ? el.removeAttribute(k) : el.setAttribute(k, v);
  el.style.removeProperty("--vin-font");
  for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
  return normalizeTheme(theme);
}

/* ───────────────────────── export / import ───────────────────────── */

/** The vin-theme.json file content. */
export function serializeTheme(theme, name = "My theme") {
  const t = normalizeTheme(theme);
  const { fontFamily, ...rest } = t;
  return JSON.stringify({ vinTheme: THEME_VERSION, name: String(name).slice(0, 60), ...rest, ...(t.font === "custom" ? { fontFamily } : {}) }, null, 2) + "\n";
}

/**
 * Read a vin-theme.json file. Returns { theme, name, warnings } or throws an Error
 * with a message a person can act on.
 */
export function parseTheme(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error("This file is not valid JSON. Export a fresh theme from vinish.dev/ui and try again."); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("This file doesn't contain a VinUI theme.");
  if (data.vinTheme === undefined) throw new Error('This file is missing "vinTheme": 1, so it is not a VinUI theme file.');
  if (data.vinTheme > THEME_VERSION) throw new Error(`This theme was made by a newer VinUI (format ${data.vinTheme}). Update the CLI or reload the site.`);
  const theme = normalizeTheme(data);
  const warnings = [];
  for (const key of Object.keys(OPTIONS)) {
    if (data[key] !== undefined && data[key] !== theme[key]) warnings.push(`Ignored unknown ${key} "${data[key]}"; using "${theme[key]}".`);
  }
  if (data.accent !== undefined && normalizeHex(data.accent) === null) warnings.push(`Ignored invalid accent "${data.accent}".`);
  return { theme, name: typeof data.name === "string" ? data.name : "Imported theme", warnings };
}

/* ───────────────────────── share links ───────────────────────── */

/** "?style=tactile&accent=0d9488&radius=lg" — only non-default values. */
export function themeToQuery(theme) {
  const d = diffFromDefault(theme);
  if (d.accent) d.accent = d.accent.slice(1);
  delete d.mode; // a shared link never forces the viewer's light/dark choice
  const qs = new URLSearchParams(d).toString();
  return qs ? "?" + qs : "";
}

/** Read a theme from a query string. Returns only the keys that were present and valid. */
export function themeFromQuery(search) {
  const p = new URLSearchParams(search);
  const raw = Object.fromEntries(p.entries());
  if (raw.accent && !raw.accent.startsWith("#")) raw.accent = "#" + raw.accent;
  const t = normalizeTheme(raw);
  const out = {};
  for (const key of [...Object.keys(OPTIONS), "accent", "fontFamily"]) {
    if (p.has(key) && t[key] !== DEFAULT_THEME[key]) out[key] = t[key];
  }
  return out;
}

/* ───────────────────────── copy targets ───────────────────────── */

/** The theme as attributes for <html>, ready to paste. */
export function themeToHtml(theme) {
  const { attrs, vars } = themeToAttributes(theme);
  const a = Object.entries(attrs).filter(([, v]) => v !== null).map(([k, v]) => `${k}="${v}"`);
  const style = `--vin-accent: ${vars["--vin-accent"]}` + (vars["--vin-font"] ? `; --vin-font: ${vars["--vin-font"]}` : "");
  return `<html ${a.join(" ")} style='${style}'>`;
}

/** The theme as a CSS snippet (for people who prefer a stylesheet over attributes). */
export function themeToCss(theme) {
  const { vars } = themeToAttributes(theme);
  return `/* VinUI theme: add data-vin-style="${normalizeTheme(theme).style}" to <html> */\n:root {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}\n`;
}

/** CLI command that sets up a project with this theme. */
export function themeToCli(theme) {
  const d = diffFromDefault(theme);
  delete d.mode;
  const t = normalizeTheme(theme);
  const flags = [`--style ${t.style}`, `--accent "${t.accent}"`];
  for (const k of ["radius", "gray", "font", "density", "motion"]) if (d[k]) flags.push(`--${k} ${d[k]}`);
  if (d.fontFamily) flags.push(`--font-family "${d.fontFamily}"`);
  return `npx @vinish/ui init ${flags.join(" ")}`;
}

/* ───────────────────────── browser storage ───────────────────────── */

export const STORAGE_KEY = "vinui:theme";
export const SAVED_KEY = "vinui:saved-themes";

function storage() { try { return globalThis.localStorage ?? null; } catch { return null; } }

export function loadTheme(key = STORAGE_KEY) {
  try { const raw = storage()?.getItem(key); return raw ? normalizeTheme(JSON.parse(raw)) : normalizeTheme(); }
  catch { return normalizeTheme(); }
}
export function saveTheme(theme, key = STORAGE_KEY) {
  try { storage()?.setItem(key, JSON.stringify(diffFromDefault(theme))); return true; } catch { return false; }
}

/** "My themes": a named list kept in the browser. */
export function listSavedThemes() {
  try { const raw = storage()?.getItem(SAVED_KEY); const list = raw ? JSON.parse(raw) : []; return Array.isArray(list) ? list.map((x) => ({ name: String(x.name), theme: normalizeTheme(x.theme) })) : []; }
  catch { return []; }
}
export function saveNamedTheme(name, theme) {
  const list = listSavedThemes().filter((x) => x.name !== name);
  list.unshift({ name: String(name).slice(0, 60), theme: diffFromDefault(theme) });
  try { storage()?.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 20))); return true; } catch { return false; }
}
export function deleteNamedTheme(name) {
  const list = listSavedThemes().filter((x) => x.name !== name);
  try { storage()?.setItem(SAVED_KEY, JSON.stringify(list)); return true; } catch { return false; }
}
