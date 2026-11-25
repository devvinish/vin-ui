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
    const svelte = svelteRaw[`../../../../packages/svelte/examples/${name}/${ex.id}.svelte`];
    return { ...ex, html, react, vue, svelte, Component: Object.values(mod)[0] };
  });
}
