/*
 * The parts with no Node.js imports: the registry reader and component search.
 * Keep this file free of node: imports, so it also runs in a browser.
 */
export const DEFAULT_SITE = "https://vinish.dev/ui";
export const FRAMEWORK_IDS = ["react", "vue", "svelte", "html"];

export class RegistryError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

/** The nearest name by edit distance, if it's close enough to be a typo. */
export function closest(word, words) {
  const d = (a, b) => {
    const m = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) m[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return m[a.length][b.length];
  };
  let best = null, score = Infinity;
  for (const w of words) { const s = d(word, w); if (s < score) { score = s; best = w; } }
  return score <= Math.max(2, Math.floor(word.length / 3)) ? best : null;
}

/**
 * A registry reader over any text loader: `load(path)` returns the file's text, or throws a
 * RegistryError with status 404 when it doesn't exist.
 */
export function makeRegistry(load, source = "") {
  const cache = new Map();
  const text = (path) => { if (!cache.has(path)) cache.set(path, load(path).catch((e) => { cache.delete(path); throw e; })); return cache.get(path); };
  const json = async (path) => JSON.parse(await text(path));
  return {
    source,
    index: () => json("r/index.json"),
    styles: () => json("r/styles.json"),
    component: async (framework, name) => {
      try { return await json(`r/${framework}/${name}.json`); } catch (e) {
        if (e.status !== 404) throw e;
        const idx = await json("r/index.json").catch(() => null);
        const known = idx?.components.find((c) => c.name === name);
        if (known) throw new RegistryError(`${known.title} isn't available for ${framework} yet. It is for: ${known.frameworks.join(", ")}.`);
        const near = idx ? closest(name, idx.components.map((c) => c.name)) : null;
        throw new RegistryError(`There is no component called "${name}".${near ? ` Did you mean "${near}"?` : ""} Run \`npx @vinish/ui list\` to see them all.`);
      }
    },
    css: (style) => text(`v1/${style}.css`),
    script: () => text("v1/vinui.js"),
  };
}

/* ───────────────────────── search ───────────────────────── */

const SYNONYMS = {
  modal: ["dialog", "alert-dialog", "sheet"], popup: ["popover", "dialog", "dropdown-menu"], confirm: ["alert-dialog"],
  drawer: ["sheet", "drawer"], sidebar: ["sheet", "sidebar"], panel: ["sheet", "collapsible"],
  dropdown: ["dropdown-menu", "select", "native-select", "combobox"], menu: ["dropdown-menu", "context-menu", "menubar", "navigation-menu"],
  notification: ["toast", "alert"], snackbar: ["toast"], message: ["toast", "alert", "message", "bubble"], banner: ["alert"],
  hint: ["tooltip"], help: ["tooltip", "popover"], faq: ["accordion"], expand: ["accordion", "collapsible"],
  toggle: ["switch", "toggle", "toggle-group"], checkbox: ["checkbox"], radio: ["radio-group"], range: ["slider"],
  loading: ["spinner", "skeleton", "progress"], loader: ["spinner"], placeholder: ["skeleton", "empty"], code: ["input-otp", "kbd", "code-block"],
  otp: ["input-otp"], pin: ["input-otp"], date: ["calendar", "date-picker"], grid: ["table", "data-table"], list: ["item", "table"],
  user: ["avatar"], profile: ["avatar"], tag: ["badge"], chip: ["badge"], label: ["badge", "input"], divider: ["separator"],
  pages: ["pagination"], nav: ["breadcrumb", "navigation-menu", "tabs"], chat: ["message", "bubble", "message-scroller"],
  search: ["combobox", "command", "input-group"], palette: ["command"], form: ["input", "field"], text: ["typography", "input", "textarea"],
};

/** Components that match a free-text query, best first. */
export function searchComponents(components, query) {
  const words = String(query).toLowerCase().split(/[^a-z0-9-]+/).filter(Boolean);
  const scored = components.map((c) => {
    const hay = `${c.name} ${c.title} ${c.category} ${c.description}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (c.name === w || c.title.toLowerCase() === w) score += 10;
      else if (c.name.includes(w)) score += 5;
      if (hay.includes(w)) score += 2;
      const syn = SYNONYMS[w] ?? SYNONYMS[w.replace(/s$/, "")];
      if (syn?.includes(c.name)) score += 6 - syn.indexOf(c.name);
    }
    return { c, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).map((s) => s.c);
}
