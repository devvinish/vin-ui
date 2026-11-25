/**
 * VinUI styles: the single source of truth for all 8 styles.
 *
 * Each style is plain data:
 *   - meta (name, description, tags) used by the docs site, the CLI and the MCP server
 *   - `light` and `dark` token values (CSS custom properties without the `--vin-` prefix)
 *   - `tweaks`: small, documented per-component CSS overrides, keyed by component name.
 *     Every style MUST have an entry for every component (an empty string is allowed),
 *     so nobody adds a component without deciding how each style draws it.
 *
 * The build script (scripts/build.mjs) turns this into CSS. Inside `tweaks`, the
 * placeholder `&` is replaced with the style selector, e.g. `[data-vin-style="tactile"]`.
 */

/** Token names every style must define in `light`. `dark` may override any subset. */
export const TOKEN_NAMES = [
  "font", "stage", "stage-img", "surface", "fg", "muted", "border",
  "primary-bg", "primary-fg", "secondary", "secondary-fg",
  "danger", "success", "warning", "input-bg", "track",
  "radius", "radius-lg", "pill", "bw", "btn-border",
  "shadow", "shadow-soft", "shadow-lg", "input-shadow", "outline-shadow",
  "weight", "title-weight", "focus", "ease",
];

/** Optional tokens a style may set when the defaults don't work for it. */
export const OPTIONAL_TOKENS = ["danger-fg"];

/** Neutral tokens that the "grey tone" option (slate / stone) tints at build time. */
export const NEUTRAL_TOKENS = ["stage", "surface", "fg", "muted", "border", "secondary", "secondary-fg", "input-bg", "track"];

/** Components that currently exist. Each style needs a `tweaks` entry for each. */
export const COMPONENTS = ["button", "badge", "card", "input", "checkbox", "switch", "native-select", "select", "tabs", "radio-group", "textarea", "toggle", "button-group", "toggle-group", "input-group", "input-otp", "slider", "avatar", "kbd", "separator", "skeleton", "spinner", "progress", "alert", "typography", "item", "table", "empty", "aspect-ratio", "breadcrumb", "pagination", "accordion", "collapsible", "tooltip", "popover", "toast", "dialog", "alert-dialog", "sheet", "dropdown-menu", "combobox", "calendar", "date-picker", "drawer", "hover-card", "context-menu", "command"];

const accent = "var(--vin-accent)";
const onAccent = "var(--vin-accent-fg)";
const mix = (pct, other) => `color-mix(in srgb, var(--vin-accent) ${pct}%, ${other})`;

export const STYLES = [
  /* 1 ─────────────────────────────────────────────────────────────── */
  {
    id: "precision",
    name: "Precision",
    short: "Crisp hairlines, quiet depth",
    description: "Sharp 1px borders, subtle inner highlights and tight type. The calm, professional look of today's best developer tools.",
    tags: ["dev tools", "SaaS", "dashboards"],
    fonts: ["Inter:wght@400;500;600;700"],
    light: {
      font: '"Inter", system-ui, sans-serif',
      stage: "#fbfbfc", "stage-img": "none", surface: "#ffffff", fg: "#111113", muted: "#6b6b76", border: "#e7e7ec",
      "primary-bg": `linear-gradient(180deg, ${mix(86, "#fff")}, ${accent})`, "primary-fg": onAccent,
      secondary: "#f4f4f6", "secondary-fg": "#111113",
      danger: "#ce4145", success: "#30a46c", warning: "#f76b15", "input-bg": "#ffffff", track: "#e4e4e9",
      radius: "8px", "radius-lg": "12px", pill: "999px", bw: "1px", "btn-border": mix(72, "#000"),
      shadow: "inset 0 1px 0 rgb(255 255 255 / .18), 0 1px 2px rgb(16 16 20 / .12)",
      "shadow-soft": "0 1px 2px rgb(16 16 20 / .06)",
      "shadow-lg": "0 1px 2px rgb(16 16 20 / .04), 0 12px 32px -16px rgb(16 16 20 / .16)",
      "input-shadow": "0 1px 2px rgb(16 16 20 / .04)", "outline-shadow": "none",
      weight: "500", "title-weight": "600",
      focus: `0 0 0 3px ${mix(30, "transparent")}`, ease: "cubic-bezier(.2, .8, .2, 1)",
    },
    dark: {
      stage: "#08090a", surface: "#101113", fg: "#f7f8f8", muted: "#8a8f98", border: "#23252a",
      secondary: "#1a1b1e", "secondary-fg": "#f7f8f8", "input-bg": "#0c0d0e", track: "#2a2c31",
      "shadow-soft": "none",
      "shadow-lg": "inset 0 1px 0 rgb(255 255 255 / .04), 0 16px 32px -16px rgb(0 0 0 / .7)",
      "input-shadow": "none",
    },
    tweaks: {
      button: "",
      badge: "",
      card: `
& .vin-card__title { letter-spacing: -.015em; }`,
      input: "",
      checkbox: "",
      switch: "",
      "native-select": "",
      select: "",
      tabs: "",
      "radio-group": "",
      textarea: "",
      toggle: "",
      "button-group": "",
      "toggle-group": "",
      "input-group": "",
      "input-otp": "",
      slider: "",
      avatar: "",
      kbd: "",
      separator: "",
      skeleton: "",
      spinner: "",
      progress: "",
      alert: "",
      typography: `
& :is(.vin-h1, .vin-h2, .vin-prose :is(h1, h2)) { letter-spacing: -.03em; }`,
      item: "",
      table: "",
      empty: "",
      "aspect-ratio": "",
      breadcrumb: "",
      pagination: "",
      accordion: "",
      collapsible: "",
      tooltip: "",
      popover: "",
      toast: "",
      dialog: "",
      "alert-dialog": "",
      sheet: "",
      "dropdown-menu": "",
      combobox: "",
      calendar: `
& .vin-calendar__title { letter-spacing: -.01em; }`,
      "date-picker": "",
      drawer: "",
      "hover-card": "",
      "context-menu": "",
      command: "",
    },
  },

  /* 2 ─────────────────────────────────────────────────────────────── */
  {
    id: "tactile",
    name: "Tactile",
    short: "Physical, pressable buttons",
    description: "Soft gradients and light from above make every control feel like a real button you can press. Modern skeuomorphism, done with restraint.",
    tags: ["productivity", "desktop-style apps", "tools"],
    fonts: ["Inter:wght@400;500;600;700"],
    light: {
      font: '"Inter", system-ui, sans-serif',
      stage: "#e9ebef", "stage-img": "none", surface: "linear-gradient(180deg, #ffffff, #f7f8fa)",
      fg: "#1d1f24", muted: "#5f6571", border: "rgb(15 20 30 / .11)",
      "primary-bg": `linear-gradient(180deg, ${mix(76, "#fff")} 0%, ${accent} 55%, ${mix(86, "#000")} 100%)`, "primary-fg": onAccent,
      secondary: "linear-gradient(180deg, #ffffff, #eef0f3)", "secondary-fg": "#1d1f24",
      danger: "#d33a3a", success: "#2f9e5b", warning: "#e07b12", "input-bg": "#f6f7f9", track: "#dde0e6",
      radius: "10px", "radius-lg": "14px", pill: "999px", bw: "1px", "btn-border": mix(62, "#000"),
      shadow: "inset 0 1px 0 rgb(255 255 255 / .38), inset 0 -1px 0 rgb(0 0 0 / .12), 0 1px 1px rgb(0 0 0 / .12), 0 3px 6px -2px rgb(0 0 0 / .18)",
      "shadow-soft": "inset 0 1px 0 rgb(255 255 255 / .6), 0 1px 2px rgb(0 0 0 / .1)",
      "shadow-lg": "inset 0 1px 0 #fff, 0 1px 2px rgb(15 20 30 / .08), 0 10px 24px -10px rgb(15 20 30 / .22)",
      "input-shadow": "inset 0 1px 2px rgb(15 20 30 / .10), 0 1px 0 rgb(255 255 255 / .9)", "outline-shadow": "none",
      weight: "600", "title-weight": "650",
      focus: `0 0 0 3px ${mix(35, "transparent")}`, ease: "cubic-bezier(.2, .8, .2, 1)",
    },
    dark: {
      stage: "#141518", surface: "linear-gradient(180deg, #25272c, #1d1f23)",
      fg: "#eceef2", muted: "#9aa0ab", border: "rgb(255 255 255 / .08)",
      secondary: "linear-gradient(180deg, #2e3137, #25272c)", "secondary-fg": "#eceef2",
      "input-bg": "#16171a", track: "#0f1012",
      "shadow-soft": "inset 0 1px 0 rgb(255 255 255 / .07), 0 1px 2px rgb(0 0 0 / .5)",
      "shadow-lg": "inset 0 1px 0 rgb(255 255 255 / .06), 0 1px 2px rgb(0 0 0 / .4), 0 12px 28px -12px rgb(0 0 0 / .8)",
      "input-shadow": "inset 0 1px 3px rgb(0 0 0 / .55), 0 1px 0 rgb(255 255 255 / .05)",
    },
    tweaks: {
      button: `
& .vin-btn:active { transform: translateY(1px); box-shadow: inset 0 2px 4px rgb(0 0 0 / .28); filter: none; }`,
      badge: `
& .vin-badge--primary { box-shadow: inset 0 1px 0 rgb(255 255 255 / .3); }`,
      card: "",
      input: "",
      checkbox: "",
      switch: "",
      "native-select": "",
      select: "",
      tabs: "",
      "radio-group": "",
      textarea: "",
      toggle: "",
      "button-group": "",
      "toggle-group": "",
      "input-group": "",
      "input-otp": "",
      slider: "",
      avatar: "",
      kbd: "",
      separator: "",
      skeleton: "",
      spinner: "",
      progress: "",
      alert: "",
      typography: "",
      item: "",
      table: "",
      empty: "",
      "aspect-ratio": "",
      breadcrumb: "",
      pagination: "",
      accordion: "",
      collapsible: "",
      tooltip: "",
      popover: "",
      toast: "",
      dialog: "",
      "alert-dialog": "",
      sheet: "",
      "dropdown-menu": "",
      combobox: "",
      calendar: "",
      "date-picker": "",
      drawer: "",
      "hover-card": "",
      "context-menu": "",
      command: "",
    },
  },

  /* 3 ─────────────────────────────────────────────────────────────── */
  {
    id: "clay",
    name: "Clay",
    short: "Puffy, friendly, inflated",
    description: "Inflated shapes with soft inner shading, big radii and rounded type. Warm and playful without being childish.",
    tags: ["onboarding", "education", "consumer apps"],
    fonts: ["Nunito:wght@600;700;800"],
    light: {
      font: '"Nunito", system-ui, sans-serif',
      stage: mix(9, "#fbf7f4"), "stage-img": "none", surface: "#fffdfb", fg: "#2a2433", muted: "#6f6679", border: "transparent",
      "primary-bg": accent, "primary-fg": onAccent,
      secondary: mix(11, "#fff"), "secondary-fg": mix(55, "#2a2433"),
      danger: "#d23958", success: "#1a9a6c", warning: "#d98a06", "input-bg": mix(5, "#f5f1ed"), track: mix(14, "#ebe5df"),
      radius: "16px", "radius-lg": "28px", pill: "999px", bw: "0px", "btn-border": "transparent",
      shadow: `inset 2px 2px 4px rgb(255 255 255 / .45), inset -3px -4px 6px rgb(0 0 0 / .18), 0 8px 16px -6px ${mix(55, "transparent")}`,
      "shadow-soft": "inset 2px 2px 4px rgb(255 255 255 / .7), inset -3px -3px 6px rgb(60 40 80 / .1)",
      "shadow-lg": `inset 6px 6px 12px rgb(255 255 255 / .9), inset -8px -8px 16px rgb(60 40 80 / .07), 0 26px 40px -22px ${mix(45, "rgb(0 0 0 / .4)")}`,
      "input-shadow": "inset 3px 3px 6px rgb(60 40 80 / .10), inset -3px -3px 6px rgb(255 255 255 / .85)",
      "outline-shadow": "inset 2px 2px 4px rgb(255 255 255 / .7), inset -3px -3px 6px rgb(60 40 80 / .1)",
      weight: "700", "title-weight": "800",
      focus: `0 0 0 4px ${mix(30, "transparent")}`, ease: "cubic-bezier(.34, 1.56, .64, 1)",
    },
    dark: {
      stage: mix(10, "#16141b"), surface: "#27242f", fg: "#f3eff8", muted: "#aba3b7",
      secondary: mix(22, "#27242f"), "secondary-fg": "#f3eff8", "input-bg": "#1f1c26", track: "#3a3545",
      "shadow-soft": "inset 2px 2px 4px rgb(255 255 255 / .06), inset -3px -3px 6px rgb(0 0 0 / .3)",
      "outline-shadow": "inset 2px 2px 4px rgb(255 255 255 / .06), inset -3px -3px 6px rgb(0 0 0 / .3)",
      "shadow-lg": "inset 4px 4px 10px rgb(255 255 255 / .05), inset -6px -6px 12px rgb(0 0 0 / .35), 0 26px 40px -22px rgb(0 0 0 / .8)",
      "input-shadow": "inset 3px 3px 6px rgb(0 0 0 / .35), inset -2px -2px 5px rgb(255 255 255 / .04)",
    },
    tweaks: {
      button: `
& .vin-btn--outline { background: var(--vin-secondary); }
& .vin-btn:hover { filter: none; transform: translateY(-2px); }
& .vin-btn:active { transform: scale(.96); }`,
      badge: `
& .vin-badge:not(.vin-badge--outline) { border-color: transparent; }`,
      card: "",
      input: "",
      checkbox: "",
      switch: "",
      "native-select": "",
      select: "",
      tabs: "",
      "radio-group": "",
      textarea: "",
      toggle: "",
      "button-group": "",
      "toggle-group": "",
      "input-group": "",
      "input-otp": "",
      slider: "",
      avatar: "",
      kbd: "",
      separator: "",
      skeleton: "",
      spinner: "",
      progress: "",
      alert: "",
      typography: "",
      item: "",
      table: "",
      empty: "",
      "aspect-ratio": "",
      breadcrumb: "",
      pagination: "",
      accordion: "",
      collapsible: "",
      tooltip: "",
      popover: "",
      toast: "",
      dialog: "",
      "alert-dialog": "",
      sheet: "",
      "dropdown-menu": "",
      combobox: "",
      calendar: "",
      "date-picker": "",
      drawer: "",
      "hover-card": "",
      "context-menu": "",
      command: "",
    },
  },

  /* 4 ─────────────────────────────────────────────────────────────── */
  {
    id: "tonal",
    name: "Tonal",
    short: "Colour-led, pill shapes, springy",
    description: "Surfaces are tinted from your accent colour, buttons are pills that morph when pressed, and motion is springy. Expressive and modern.",
    tags: ["mobile-first", "consumer", "personal apps"],
    fonts: ["Outfit:wght@400;500;600"],
    light: {
      font: '"Outfit", system-ui, sans-serif',
      stage: mix(5, "#fdfcff"), "stage-img": "none", surface: mix(8, "#fffbff"), fg: "#1b1b21", muted: "#5a5867", border: "transparent",
      "primary-bg": accent, "primary-fg": onAccent,
      secondary: mix(20, "#fff"), "secondary-fg": mix(72, "#000"),
      danger: "#ba1a1a", success: "#006d3b", warning: "#8c5000", "input-bg": mix(13, "#fff"), track: mix(22, "#e6e1ea"),
      radius: "14px", "radius-lg": "28px", pill: "999px", bw: "0px", "btn-border": "transparent",
      shadow: "none", "shadow-soft": "none", "shadow-lg": "none", "input-shadow": "none",
      "outline-shadow": "inset 0 0 0 1px rgb(27 27 33 / .28)",
      weight: "500", "title-weight": "600",
      focus: `0 0 0 3px ${mix(45, "transparent")}`, ease: "cubic-bezier(.34, 1.56, .64, 1)",
    },
    dark: {
      stage: mix(4, "#121216"), surface: mix(12, "#1b1b20"), fg: "#e6e1e9", muted: "#aaa6b4",
      secondary: mix(30, "#1b1b20"), "secondary-fg": mix(25, "#fff"),
      "input-bg": mix(16, "#1b1b20"), track: mix(20, "#2a2a30"),
      danger: "#ffb4ab", "danger-fg": "#690005", success: "#6fdba0", warning: "#ffb870",
      "outline-shadow": "inset 0 0 0 1px rgb(230 225 233 / .3)",
    },
    tweaks: {
      button: `
& .vin-btn { border-radius: var(--vin-pill); transition: border-radius calc(var(--vin-dur) * 2.4) var(--vin-ease), transform var(--vin-dur), filter var(--vin-dur); }
& .vin-btn:active { border-radius: var(--vin-radius); transform: none; }`,
      badge: "",
      card: "",
      input: `
& .vin-input { border-radius: 12px 12px 4px 4px; box-shadow: inset 0 -2px 0 color-mix(in srgb, var(--vin-accent) 55%, transparent); }
& :is(.vin-input:focus, .vin-input.vin-input-group:focus-within, .vin-input.vin-otp__slot[data-active]) { box-shadow: inset 0 -3px 0 var(--vin-accent); }
& :is(.vin-input[aria-invalid="true"], .vin-input-group:has(> [aria-invalid="true"]), .vin-otp:has(> [aria-invalid="true"]) .vin-otp__slot) { box-shadow: inset 0 -2px 0 var(--vin-danger); }`,
      checkbox: "",
      switch: "",
      "native-select": "",
      select: "",
      tabs: "",
      "radio-group": "",
      textarea: "",
      toggle: "",
      "button-group": "",
      "toggle-group": "",
      "input-group": "",
      "input-otp": "",
      slider: "",
      avatar: "",
      kbd: "",
      separator: "",
      skeleton: "",
      spinner: "",
      progress: "",
      alert: "",
      typography: "",
      item: "",
      table: "",
      empty: "",
      "aspect-ratio": "",
      breadcrumb: "",
      pagination: "",
      accordion: "",
      collapsible: "",
      tooltip: "",
      popover: "",
      toast: "",
      dialog: "",
      "alert-dialog": "",
      sheet: "",
      "dropdown-menu": "",
      combobox: "",
      calendar: "",
      "date-picker": "",
      drawer: "",
      "hover-card": "",
      "context-menu": "",
      command: "",
    },
  },

  /* 5 ─────────────────────────────────────────────────────────────── */
  {
    id: "editorial",
    name: "Editorial",
    short: "Typographic, airy, magazine",
    description: "Serif headlines, thin rules, underlined inputs and uppercase labels. Feels like a well-designed magazine.",
    tags: ["blogs", "portfolios", "content sites"],
    fonts: ["Inter:wght@400;500;600", "Instrument+Serif"],
    light: {
      font: '"Inter", system-ui, sans-serif',
      stage: "#f7f5f0", "stage-img": "none", surface: "#fffefa", fg: "#1a1916", muted: "#67635a", border: "#dcd8ce",
      "primary-bg": accent, "primary-fg": onAccent,
      secondary: "transparent", "secondary-fg": "#1a1916",
      danger: "#b42318", success: "#1f7a4d", warning: "#a15c07", "input-bg": "transparent", track: "#dcd8ce",
      radius: "2px", "radius-lg": "2px", pill: "2px", bw: "1px", "btn-border": "transparent",
      shadow: "none", "shadow-soft": "none", "shadow-lg": "none", "input-shadow": "none", "outline-shadow": "none",
      weight: "500", "title-weight": "400",
      focus: `0 0 0 2px ${mix(55, "transparent")}`, ease: "cubic-bezier(.2, .8, .2, 1)",
    },
    dark: {
      stage: "#11110f", surface: "#161613", fg: "#ecebe6", muted: "#a29e93", border: "#302e29",
      "secondary-fg": "#ecebe6", track: "#302e29",
    },
    tweaks: {
      button: `
& .vin-btn { text-transform: uppercase; font-size: calc(var(--vin-text-md) - 2.5px); letter-spacing: .1em; }
& .vin-btn--secondary { border-color: var(--vin-fg); }
& .vin-btn--ghost { text-decoration: underline; text-underline-offset: 4px; }`,
      badge: `
& .vin-badge { text-transform: uppercase; font-size: 10px; letter-spacing: .1em; }`,
      card: `
& .vin-card { border-top: 2px solid var(--vin-fg); }
& .vin-card__title { font-family: "Instrument Serif", Georgia, serif; font-weight: 400; font-size: calc(var(--vin-text-md) + 10px); line-height: 1.1; }`,
      input: `
& :is(.vin-label, .vin-radio-group__legend) { text-transform: uppercase; font-size: 10.5px; letter-spacing: .12em; color: var(--vin-muted); }
& .vin-input { border-width: 0 0 1px; border-radius: 0; padding-left: 0; background-color: transparent; }
& :is(.vin-input:focus, .vin-input.vin-input-group:focus-within, .vin-input.vin-otp__slot[data-active]) { box-shadow: inset 0 -1px 0 var(--vin-fg); }
& textarea.vin-input { border-width: 1px; padding-left: 10px; }`,
      checkbox: "",
      switch: "",
      "native-select": "",
      select: "",
      tabs: "",
      "radio-group": "",
      textarea: "",
      toggle: "",
      "button-group": "",
      "toggle-group": "",
      "input-group": "",
      "input-otp": "",
      slider: "",
      avatar: "",
      kbd: "",
      separator: "",
      skeleton: "",
      spinner: "",
      progress: "",
      alert: "",
      typography: `
& :is(.vin-h1, .vin-h2, .vin-h3, .vin-prose :is(h1, h2, h3)) { font-family: "Instrument Serif", Georgia, serif; font-weight: 400; letter-spacing: -.01em; }
& :is(.vin-h1, .vin-prose h1) { font-size: 44px; line-height: 1; }
& :is(.vin-h2, .vin-prose h2) { font-size: 32px; line-height: 1.05; }
& :is(.vin-h3, .vin-prose h3) { font-size: 24px; }
& :is(.vin-h4, .vin-prose h4) { text-transform: uppercase; font-size: 11.5px; letter-spacing: .14em; }
& :is(.vin-blockquote, .vin-prose blockquote) { font-family: "Instrument Serif", Georgia, serif; font-size: 22px; line-height: 1.35; border-color: var(--vin-fg); border-inline-start-width: 1px; }`,
      item: "",
      table: `
& .vin-table thead th { text-transform: uppercase; font-size: 10.5px; letter-spacing: .12em; }`,
      empty: "",
      "aspect-ratio": "",
      breadcrumb: "",
      pagination: `
& .vin-pagination__page { text-decoration: none; }`,
      accordion: `
& .vin-accordion__trigger { font-family: "Instrument Serif", Georgia, serif; font-weight: 400; font-size: 21px; letter-spacing: -.01em; }
& .vin-accordion--outline .vin-accordion__item { border-top: 2px solid var(--vin-fg); }`,
      collapsible: "",
      tooltip: "",
      popover: "",
      toast: "",
      dialog: `
& .vin-dialog__title { font-family: "Instrument Serif", Georgia, serif; font-weight: 400; font-size: calc(var(--vin-text-md) + 12px); line-height: 1.1; }
& .vin-dialog:not(.vin-sheet) { border-top: 2px solid var(--vin-fg); }`,
      "alert-dialog": "",
      sheet: "",
      "dropdown-menu": `
& .vin-menu__label { text-transform: uppercase; letter-spacing: .08em; font-size: 11px; font-weight: 500; }`,
      combobox: "",
      calendar: `
& .vin-calendar__title { font-family: "Instrument Serif", Georgia, serif; font-weight: 400; font-size: calc(var(--vin-text-md) + 6px); }
& .vin-calendar__grid th { font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; }`,
      "date-picker": "",
      drawer: "",
      "hover-card": "",
      "context-menu": "",
      command: "",
    },
  },

  /* 6 ─────────────────────────────────────────────────────────────── */
  {
    id: "terminal",
    name: "Terminal",
    short: "Developer-native, monospace",
    description: "Monospace everything, dashed outlines, [bracketed] buttons and $ prompts. Made for developers, which fits vinish.dev.",
    tags: ["dev blogs", "CLI docs", "side projects"],
    fonts: ["JetBrains+Mono:wght@400;500;700"],
    light: {
      font: '"JetBrains Mono", ui-monospace, monospace',
      stage: "#f4f4ef", "stage-img": "none", surface: "#fbfbf7", fg: "#1c1f1c", muted: "#5f665f", border: "#8f998f",
      "primary-bg": accent, "primary-fg": onAccent,
      secondary: "transparent", "secondary-fg": "#1c1f1c",
      danger: "#c62828", success: "#2e7d32", warning: "#9a5c00", "input-bg": "transparent", track: "transparent",
      radius: "3px", "radius-lg": "4px", pill: "3px", bw: "1px", "btn-border": "transparent",
      shadow: "none", "shadow-soft": "none", "shadow-lg": "none", "input-shadow": "none", "outline-shadow": "none",
      weight: "500", "title-weight": "700",
      focus: "0 0 0 2px var(--vin-accent)", ease: "linear",
    },
    dark: {
      stage: "#0a0d0b", surface: "#0e1210", fg: "#d7e0d8", muted: "#86938a", border: "#46544a",
      "secondary-fg": "#d7e0d8",
    },
    tweaks: {
      button: `
& .vin-btn { font-size: calc(var(--vin-text-md) - 1px); }
& :is(.vin-btn--outline, .vin-btn--secondary, .vin-btn--ghost) { gap: .4em; border-style: dashed; }
& :is(.vin-btn--outline, .vin-btn--secondary, .vin-btn--ghost):not(.vin-btn--icon)::before { content: "["; color: var(--vin-accent-text); }
& :is(.vin-btn--outline, .vin-btn--secondary, .vin-btn--ghost):not(.vin-btn--icon)::after { content: "]"; color: var(--vin-accent-text); }`,
      badge: `
& .vin-badge { text-transform: lowercase; border-style: dashed; }`,
      card: `
& .vin-card { border-style: dashed; }
& .vin-card__title::before { content: "# "; color: var(--vin-accent-text); }`,
      input: `
& .vin-input { border-style: dashed; }
& :is(.vin-label, .vin-radio-group__legend)::before { content: "$ "; color: var(--vin-accent-text); }`,
      checkbox: "",
      switch: "",
      "native-select": "",
      select: "",
      tabs: "",
      "radio-group": "",
      textarea: "",
      toggle: "",
      "button-group": `
& .vin-btn-group > .vin-btn::after, & .vin-btn-group > :is(.vin-btn--outline, .vin-btn--secondary, .vin-btn--ghost)::before { content: none; }`,
      "toggle-group": "",
      "input-group": "",
      "input-otp": "",
      slider: "",
      avatar: "",
      kbd: "",
      separator: "",
      skeleton: "",
      spinner: "",
      progress: "",
      alert: "",
      typography: `
& :is(.vin-h1, .vin-prose h1)::before { content: "# "; color: var(--vin-accent-text); }
& :is(.vin-h2, .vin-prose h2)::before { content: "## "; color: var(--vin-accent-text); }
& :is(.vin-h3, .vin-prose h3)::before { content: "### "; color: var(--vin-accent-text); }
& :is(.vin-h1, .vin-h2, .vin-h3, .vin-h4, .vin-prose :is(h1, h2, h3, h4)) { letter-spacing: 0; }
& :is(.vin-h1, .vin-prose h1) { font-size: 26px; }
& :is(.vin-h2, .vin-prose h2) { font-size: 20px; }
& :is(.vin-h3, .vin-prose h3) { font-size: 17px; }
& :is(.vin-blockquote, .vin-prose blockquote) { font-style: normal; border-inline-start-style: dashed; }
& :is(.vin-list, .vin-prose ul) { list-style: "- "; }`,
      item: `
& :is(.vin-item--outline, .vin-item-group) { border-style: dashed; }
& .vin-item-group > .vin-item + .vin-item { border-top-style: dashed; }`,
      table: `
& .vin-table-wrap { border-style: dashed; }
& .vin-table :is(tbody tr + tr > *, tfoot > tr > *, .vin-table__caption) { border-top-style: dashed; }
& .vin-table thead th { border-bottom-style: dashed; }`,
      empty: `
& .vin-empty__media { border: 1px dashed var(--vin-border); background: transparent; }`,
      "aspect-ratio": "",
      breadcrumb: "",
      pagination: `
& .vin-pagination__page:not([aria-current])::before, & .vin-pagination__page:not([aria-current])::after { content: none; }
& .vin-pagination__page[aria-current] { padding: 0 2px; }`,
      accordion: `
& .vin-accordion__trigger::after { content: "+"; width: auto; height: auto; border: 0; transform: none; color: var(--vin-accent-text); }
& .vin-accordion__item[open] > .vin-accordion__trigger::after { content: "-"; transform: none; }
& .vin-accordion__item { border-bottom-style: dashed; }
& .vin-accordion--outline .vin-accordion__item { border-style: dashed; }`,
      collapsible: `
& .vin-collapsible__trigger::before { content: ">"; width: auto; height: auto; border: 0; transform: none; color: var(--vin-accent-text); transition: none; }
& .vin-collapsible[open] > .vin-collapsible__trigger::before { content: "v"; transform: none; }`,
      tooltip: "",
      popover: `
& .vin-popover { border-style: dashed; }`,
      toast: `
& .vin-toast { border-style: dashed; }`,
      dialog: `
& .vin-dialog { border-style: dashed; }
& .vin-dialog__title::before { content: "# "; color: var(--vin-accent-text); }`,
      "alert-dialog": `
& .vin-alert-dialog__icon { border-radius: 0; }`,
      sheet: "",
      "dropdown-menu": `
& .vin-menu { border-style: dashed; }
& .vin-menu__item:focus, & .vin-menu__item:hover { background: var(--vin-fg); color: var(--vin-surface); }
& .vin-menu__item:focus > svg, & .vin-menu__item:hover > svg, & .vin-menu__item:focus .vin-menu__shortcut, & .vin-menu__item:hover .vin-menu__shortcut { color: inherit; }
& .vin-menu__item--danger:focus, & .vin-menu__item--danger:hover { background: var(--vin-danger); color: #fff; }
& .vin-menu__separator { height: 0; background: none; border-top: 1px dashed color-mix(in srgb, var(--vin-border), var(--vin-fg) 25%); }`,
      combobox: "",
      calendar: "",
      "date-picker": "",
      drawer: "",
      "hover-card": "",
      "context-menu": "",
      command: "",
    },
  },

  /* 7 ─────────────────────────────────────────────────────────────── */
  {
    id: "paper",
    name: "Paper",
    short: "Warm, hand-made, human",
    description: "Warm paper tones, a dotted texture, hand-drawn edges and handwritten labels. Personal and approachable.",
    tags: ["personal sites", "notes", "creative tools"],
    fonts: ["Inter:wght@400;500;600", "Kalam:wght@400;700"],
    light: {
      font: '"Inter", system-ui, sans-serif',
      stage: "#f3ecdf", "stage-img": "radial-gradient(rgb(120 90 50 / .09) 1px, transparent 1.2px)",
      surface: "#fffaf0", fg: "#2b2520", muted: "#6f6356", border: "rgb(43 37 32 / .55)",
      "primary-bg": accent, "primary-fg": onAccent,
      secondary: "#f6eedf", "secondary-fg": "#2b2520",
      danger: "#c0392b", success: "#3c8d4f", warning: "#b06f0c", "input-bg": "#fffdf7", track: "#e8dcc8",
      radius: "10px", "radius-lg": "18px", pill: "999px", bw: "1.5px", "btn-border": "rgb(43 37 32 / .55)",
      shadow: "0 2px 5px -1px rgb(80 50 20 / .22)", "shadow-soft": "0 2px 5px -1px rgb(80 50 20 / .16)",
      "shadow-lg": "0 1px 2px rgb(80 50 20 / .08), 0 16px 30px -16px rgb(80 50 20 / .35)",
      "input-shadow": "inset 0 1px 2px rgb(80 50 20 / .08)", "outline-shadow": "none",
      weight: "600", "title-weight": "700",
      focus: `0 0 0 3px ${mix(35, "transparent")}`, ease: "cubic-bezier(.2, .8, .2, 1)",
    },
    dark: {
      stage: "#1c1814", "stage-img": "radial-gradient(rgb(255 230 200 / .05) 1px, transparent 1.2px)",
      surface: "#26211b", fg: "#efe6d8", muted: "#b5a796", border: "rgb(239 230 216 / .4)",
      secondary: "#2e2821", "secondary-fg": "#efe6d8", "input-bg": "#201c17", track: "#3a3229",
      "btn-border": "rgb(239 230 216 / .4)",
      shadow: "0 2px 6px -1px rgb(0 0 0 / .5)", "shadow-soft": "0 2px 6px -1px rgb(0 0 0 / .4)",
      "shadow-lg": "0 18px 30px -16px rgb(0 0 0 / .8)",
    },
    tweaks: {
      button: `
& .vin-btn { font-family: "Kalam", "Inter", cursive; font-size: calc(var(--vin-text-md) + 2px); font-weight: 700; border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px; }
& .vin-btn:hover { filter: none; transform: rotate(-1deg); }`,
      badge: `
& .vin-badge { font-family: "Kalam", "Inter", cursive; font-size: 13px; border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px; }`,
      card: `
& .vin-card { border-radius: 18px 6px 20px 8px / 8px 20px 6px 18px; }
& .vin-card__title { font-family: "Kalam", "Inter", cursive; font-size: calc(var(--vin-text-md) + 6px); }`,
      input: `
& .vin-input { border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px; }
& textarea.vin-input { border-radius: 18px 6px 20px 8px / 8px 20px 6px 18px; }`,
      checkbox: "",
      switch: "",
      "native-select": "",
      select: "",
      tabs: "",
      "radio-group": "",
      textarea: "",
      toggle: "",
      "button-group": "",
      "toggle-group": "",
      "input-group": "",
      "input-otp": "",
      slider: "",
      avatar: "",
      kbd: "",
      separator: "",
      skeleton: "",
      spinner: "",
      progress: "",
      alert: "",
      typography: `
& :is(.vin-h1, .vin-h2, .vin-h3, .vin-prose :is(h1, h2, h3)) { font-family: "Kalam", "Inter", cursive; font-weight: 700; letter-spacing: 0; }
& :is(.vin-h1, .vin-prose h1) { font-size: 36px; }
& :is(.vin-h2, .vin-prose h2) { font-size: 27px; }
& :is(.vin-h3, .vin-prose h3) { font-size: 21px; }`,
      item: "",
      table: "",
      empty: `
& .vin-empty__title { font-family: "Kalam", "Inter", cursive; font-size: calc(var(--vin-text-md) + 5px); }
& .vin-empty--outline { border-radius: 18px 6px 20px 8px / 8px 20px 6px 18px; }`,
      "aspect-ratio": "",
      breadcrumb: "",
      pagination: "",
      accordion: `
& .vin-accordion__trigger { font-family: "Kalam", "Inter", cursive; font-size: calc(var(--vin-text-md) + 3px); }
& .vin-accordion--outline .vin-accordion__item { border-radius: 18px 6px 20px 8px / 8px 20px 6px 18px; }`,
      collapsible: "",
      tooltip: "",
      popover: `
& .vin-popover { border-radius: 18px 6px 20px 8px / 8px 20px 6px 18px; }`,
      toast: `
& .vin-toast { border-radius: 18px 6px 20px 8px / 8px 20px 6px 18px; }`,
      dialog: `
& .vin-dialog:not(.vin-sheet) { border-radius: 22px 8px 24px 10px / 10px 24px 8px 22px; }
& .vin-dialog__title { font-family: "Kalam", "Inter", cursive; font-size: calc(var(--vin-text-md) + 8px); }`,
      "alert-dialog": "",
      sheet: "",
      "dropdown-menu": `
& .vin-menu { border-radius: 18px 6px 20px 8px / 8px 20px 6px 18px; }`,
      combobox: "",
      calendar: `
& .vin-calendar__title { font-family: "Kalam", "Inter", cursive; font-size: calc(var(--vin-text-md) + 4px); }`,
      "date-picker": "",
      drawer: "",
      "hover-card": "",
      "context-menu": "",
      command: "",
    },
  },

  /* 8 ─────────────────────────────────────────────────────────────── */
  {
    id: "bento",
    name: "Bento",
    short: "Calm, layered, borderless",
    description: "No borders: just soft grey layers, generous 24px radii and iOS-like controls. Clean, premium and familiar.",
    tags: ["product sites", "settings", "mobile"],
    fonts: ["Inter:wght@400;500;600;700"],
    light: {
      font: '"Inter", system-ui, sans-serif',
      stage: "#f2f2f5", "stage-img": "none", surface: "#ffffff", fg: "#1d1d1f", muted: "#6a6a70", border: "transparent",
      "primary-bg": accent, "primary-fg": onAccent,
      secondary: "rgb(29 29 31 / .07)", "secondary-fg": "#1d1d1f",
      danger: "#d9332a", success: "#23913c", warning: "#c77700", "input-bg": "rgb(29 29 31 / .06)", track: "#e3e3e8",
      radius: "12px", "radius-lg": "24px", pill: "999px", bw: "0px", "btn-border": "transparent",
      shadow: "none", "shadow-soft": "none",
      "shadow-lg": "0 1px 2px rgb(0 0 0 / .04), 0 8px 24px -8px rgb(0 0 0 / .08)", "input-shadow": "none",
      "outline-shadow": "inset 0 0 0 1px #d2d2d7",
      weight: "600", "title-weight": "650",
      focus: `0 0 0 4px ${mix(30, "transparent")}`, ease: "cubic-bezier(.25, .1, .25, 1)",
    },
    dark: {
      stage: "#000000", surface: "#1c1c1e", fg: "#f5f5f7", muted: "#98989d",
      secondary: "#2c2c2e", "secondary-fg": "#f5f5f7", "input-bg": "#2c2c2e", track: "#3a3a3c",
      "shadow-lg": "none", "outline-shadow": "inset 0 0 0 1px #48484a",
    },
    tweaks: {
      button: "",
      badge: "",
      card: "",
      input: "",
      checkbox: "",
      switch: "",
      "native-select": "",
      select: "",
      tabs: "",
      "radio-group": "",
      textarea: "",
      toggle: "",
      "button-group": "",
      "toggle-group": "",
      "input-group": "",
      "input-otp": "",
      slider: "",
      avatar: "",
      kbd: "",
      separator: "",
      skeleton: "",
      spinner: "",
      progress: "",
      alert: "",
      typography: "",
      item: "",
      table: "",
      empty: "",
      "aspect-ratio": "",
      breadcrumb: "",
      pagination: "",
      accordion: "",
      collapsible: "",
      tooltip: "",
      popover: "",
      toast: "",
      dialog: "",
      "alert-dialog": "",
      sheet: "",
      "dropdown-menu": "",
      combobox: "",
      calendar: "",
      "date-picker": "",
      drawer: "",
      "hover-card": "",
      "context-menu": "",
      command: "",
    },
  },
];

export const STYLE_IDS = STYLES.map((s) => s.id);
export const DEFAULT_STYLE = "precision";

/** Google Fonts stylesheet URL that loads every font the given styles need. */
export function googleFontsHref(styles = STYLES) {
  const families = [...new Set(styles.flatMap((s) => s.fonts))];
  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
}
