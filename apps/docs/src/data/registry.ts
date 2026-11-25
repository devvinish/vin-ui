/**
 * Everything a component docs page needs, read from the repo at build time:
 * spec/<name>.json, the HTML snippets, the React examples (source + component) and the Vue and Svelte example sources.
 * Adding a component = adding its files; no docs code changes.
 */
import type { ComponentType } from "react";

export type Spec = {
  name: string; title: string; category: string; description: string; baseClass: string;
  classes: string[]; thumb?: string;
  props: Record<string, { values?: string[]; type?: string; default?: unknown; class?: string; html?: string; description?: string }>;
  react: { components: string[]; helpers?: string[] };
  examples: { id: string; title: string; description: string }[];
  a11y: string[];
};
export type Example = Spec["examples"][number] & { html: string; react: string; vue?: string; svelte?: string; Component: ComponentType };

const specs = import.meta.glob<Spec>("../../../../spec/*.json", { eager: true, import: "default" });
const htmlRaw = import.meta.glob<string>("../../../../packages/html/src/*/*.html", { eager: true, query: "?raw", import: "default" });
const tsxRaw = import.meta.glob<string>("../../../../packages/react/examples/*/*.tsx", { eager: true, query: "?raw", import: "default" });
const vueRaw = import.meta.glob<string>("../../../../packages/vue/examples/*/*.vue", { eager: true, query: "?raw", import: "default" });
const svelteRaw = import.meta.glob<string>("../../../../packages/svelte/examples/*/*.svelte", { eager: true, query: "?raw", import: "default" });
const tsxMods = import.meta.glob<Record<string, ComponentType>>("../../../../packages/react/examples/*/*.tsx", { eager: true });

export const SPECS: Spec[] = Object.values(specs).sort((a, b) => a.title.localeCompare(b.title));
export const getSpec = (name: string) => SPECS.find((s) => s.name === name);

export function getExamples(name: string): Example[] {
  const spec = getSpec(name);
  if (!spec) return [];
  return spec.examples.map((ex) => {
    const html = htmlRaw[`../../../../packages/html/src/${name}/${ex.id}.html`];
    const react = tsxRaw[`../../../../packages/react/examples/${name}/${ex.id}.tsx`];
    const mod = tsxMods[`../../../../packages/react/examples/${name}/${ex.id}.tsx`];
    if (html === undefined || react === undefined || !mod) throw new Error(`VinUI docs: ${name}/${ex.id} is missing its HTML snippet or React example`);
    const vue = vueRaw[`../../../../packages/vue/examples/${name}/${ex.id}.vue`];
    // SvelteKit projects keep components in src/lib, so show the $lib path the CLI's default folder uses.
    const svelte = svelteRaw[`../../../../packages/svelte/examples/${name}/${ex.id}.svelte`]?.replaceAll('"@/components/vin/', '"$lib/components/vin/');
    return { ...ex, html, react, vue, svelte, Component: Object.values(mod)[0] };
  });
}

/* ───────── Install details for a component page ───────── */

const vueIndex = import.meta.glob<string>("../../../../packages/vue/src/index.ts", { eager: true, query: "?raw", import: "default" });
const svelteIndex = import.meta.glob<string>("../../../../packages/svelte/src/index.ts", { eager: true, query: "?raw", import: "default" });
const vinuiJs = import.meta.glob<string>("../../../../packages/html/vinui.js", { eager: true, query: "?raw", import: "default" });
const one = (g: Record<string, string>) => Object.values(g)[0] ?? "";

/** Value exports of an index.ts, by file: { "card.vue": { def: "Card", named: ["CardHeader", …] } }. */
function exportsByFile(src: string) {
  const out = new Map<string, { def?: string; named: string[] }>();
  for (const m of src.matchAll(/^export \{([^}]+)\} from "\.\/([^"]+)";/gm)) {
    const entry = out.get(m[2]) ?? { named: [] };
    for (const part of m[1].split(",").map((s) => s.trim()).filter(Boolean)) {
      const d = part.match(/^default as (\w+)$/);
      if (d) entry.def = d[1]; else entry.named.push(part);
    }
    out.set(m[2], entry);
  }
  return out;
}
const importLine = (def: string | undefined, named: string[], from: string) =>
  `import ${[def, named.length ? `{ ${named.join(", ")} }` : ""].filter(Boolean).join(", ")} from "${from}";`;

/** The component a file belongs to: its own name, or the longest component name it starts with (card-header → card). */
function owner(base: string) {
  if (getSpec(base)) return base;
  return SPECS.map((s) => s.name).filter((n) => base.startsWith(`${n}-`)).sort((a, b) => b.length - a.length)[0];
}

/** Import lines for Vue and Svelte, read from each package's index.ts so they never drift. */
export function getImports(name: string): { vue?: string; svelte?: string } {
  const lines = (src: string, ext: string, dir: string) => {
    const found = [...exportsByFile(src)].filter(([file]) => file.endsWith(`.${ext}`) && owner(file.slice(0, -(ext.length + 1))) === name);
    found.sort(([a], [b]) => (a === `${name}.${ext}` ? -1 : b === `${name}.${ext}` ? 1 : a.localeCompare(b)));
    return found.map(([file, e]) => importLine(e.def, e.named, `${dir}/${file}`)).join("\n") || undefined;
  };
  return {
    vue: lines(one(vueIndex), "vue", "@/components/vin"),
    svelte: lines(one(svelteIndex), "svelte", "$lib/components/vin"),
  };
}

/** True when a component's HTML uses an attribute that vinui.js wires up. */
export function needsScript(name: string) {
  const attrs = [...one(vinuiJs).matchAll(/"(data-vin-[a-z-]+)": init/g)].map((m) => m[1]);
  return getExamples(name).some((ex) => attrs.some((a) => ex.html.includes(a)));
}
