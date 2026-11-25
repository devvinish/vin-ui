/**
 * Turns the style data in styles.mjs into CSS.
 * Pure functions only (no file system), so tests can call them directly.
 */
import { STYLES, TOKEN_NAMES, OPTIONAL_TOKENS, NEUTRAL_TOKENS, COMPONENTS } from "./styles.mjs";

/** Grey tones. Each neutral colour is mixed a few percent toward the tint. */
export const GRAYS = {
  slate: { light: { tint: "#3d5f91", pct: 6 }, dark: { tint: "#6a8fcc", pct: 8 } },
  stone: { light: { tint: "#8a6a42", pct: 6 }, dark: { tint: "#b08d5f", pct: 7 } },
};

/* ---------- colour helpers ---------- */
export function parseHex(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const toHex = (rgb) => "#" + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("");
const mixRgb = (a, b, pct) => a.map((v, i) => v + (b[i] - v) * (pct / 100));

/** Mix every hex and rgb() colour inside a CSS value toward a tint. Other text is untouched. */
export function tintValue(value, tint, pct) {
  const t = parseHex(tint);
  return value
    .replace(/#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi, (m) => toHex(mixRgb(parseHex(m), t, pct)))
    .replace(/rgb\((\d+) (\d+) (\d+)((?: \/ [\d.]+)?)\)/g, (_m, r, g, b, alpha) => {
      const [nr, ng, nb] = mixRgb([+r, +g, +b], t, pct).map(Math.round);
      return `rgb(${nr} ${ng} ${nb}${alpha})`;
    });
}

/* ---------- validation ---------- */
export function validateStyles(styles = STYLES) {
  const errors = [];
  const allowed = new Set([...TOKEN_NAMES, ...OPTIONAL_TOKENS]);
  const ids = new Set();
  for (const s of styles) {
    if (ids.has(s.id)) errors.push(`duplicate style id "${s.id}"`);
    ids.add(s.id);
    for (const t of TOKEN_NAMES) if (!(t in s.light)) errors.push(`${s.id}: light is missing token "${t}"`);
    for (const t of Object.keys(s.light)) if (!allowed.has(t)) errors.push(`${s.id}: unknown light token "${t}"`);
    for (const t of Object.keys(s.dark)) if (!allowed.has(t)) errors.push(`${s.id}: unknown dark token "${t}"`);
    for (const c of COMPONENTS) if (typeof s.tweaks?.[c] !== "string") errors.push(`${s.id}: missing tweaks.${c} (use "" if none)`);
    for (const k of ["name", "short", "description"]) if (!s[k]) errors.push(`${s.id}: missing ${k}`);
  }
  return errors;
}

/* ---------- CSS output ---------- */
const decls = (tokens, extra = "") =>
  Object.entries(tokens).map(([k, v]) => `  --vin-${k}: ${v};`).join("\n") + (extra ? `\n${extra}` : "");

const sel = (id) => `[data-vin-style="${id}"]`;

/** All selectors for one style + optional grey tone, in light, explicit dark and system dark. */
function selectors(id, gray) {
  const S = sel(id) + (gray ? `[data-vin-gray="${gray}"]` : "");
  return {
    light: S,
    dark: `${S}[data-vin-mode="dark"],\n[data-vin-mode="dark"] ${S}`,
    system: `${S}:not([data-vin-mode="light"]):not([data-vin-mode="light"] *)`,
  };
}

function block(selector, body) {
  return `${selector} {\n${body}\n}`;
}

const DARK_EXTRA = "  --vin-accent-text: var(--vin-accent-ink-dark);\n  --vin-danger-text: color-mix(in srgb, var(--vin-danger) 55%, var(--vin-fg));";

export function styleCss(style) {
  const out = [`/* ── ${style.name} ── ${style.short} */`];
  const s = selectors(style.id);
  out.push(block(s.light, decls(style.light)));
  out.push(block(s.dark, decls(style.dark, DARK_EXTRA)));
  out.push(`@media (prefers-color-scheme: dark) {\n${block(s.system, decls(style.dark, DARK_EXTRA))}\n}`);

  for (const [gray, cfg] of Object.entries(GRAYS)) {
    const g = selectors(style.id, gray);
    const lightN = {}, darkN = {};
    for (const t of NEUTRAL_TOKENS) {
      lightN[t] = tintValue(style.light[t], cfg.light.tint, cfg.light.pct);
      darkN[t] = tintValue(style.dark[t] ?? style.light[t], cfg.dark.tint, cfg.dark.pct);
    }
    out.push(block(g.light, decls(lightN)));
    out.push(block(g.dark, decls(darkN)));
    out.push(`@media (prefers-color-scheme: dark) {\n${block(g.system, decls(darkN))}\n}`);
  }
  return out.join("\n");
}

export function tweaksCss(style, components = COMPONENTS) {
  return components
    .map((c) => (style.tweaks[c] || "").trim())
    .filter(Boolean)
    .map((css) => `/* ${style.name} tweaks */\n` + css.replaceAll("&", sel(style.id)))
    .join("\n");
}

/**
 * Build a complete stylesheet.
 * @param {{ base: string, components: Record<string,string>, styles?: typeof STYLES, version?: string }} input
 */
export function buildCss({ base, components, styles = STYLES, version = "0.0.0" }) {
  const errors = validateStyles(styles);
  if (errors.length) throw new Error("Invalid styles:\n  " + errors.join("\n  "));
  const header = `/*! VinUI v${version} | MIT | vinish.dev/ui | styles: ${styles.map((s) => s.id).join(", ")} */`;
  return [
    header,
    base.trim(),
    "/* ===== Styles ===== */",
    ...styles.map(styleCss),
    "/* ===== Components ===== */",
    ...COMPONENTS.map((c) => components[c].trim()),
    "/* ===== Style tweaks ===== */",
    ...styles.map((s) => tweaksCss(s)).filter(Boolean),
  ].join("\n\n") + "\n";
}
