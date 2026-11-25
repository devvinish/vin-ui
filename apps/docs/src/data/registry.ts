/**
 * Everything a component docs page needs, read from the repo at build time:
 * spec/<name>.json, the HTML snippets and the React examples (source + component).
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
export type Example = Spec["examples"][number] & { html: string; react: string; Component: ComponentType };

const specs = import.meta.glob<Spec>("../../../../spec/*.json", { eager: true, import: "default" });
const htmlRaw = import.meta.glob<string>("../../../../packages/html/src/*/*.html", { eager: true, query: "?raw", import: "default" });
const tsxRaw = import.meta.glob<string>("../../../../packages/react/examples/*/*.tsx", { eager: true, query: "?raw", import: "default" });
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
    return { ...ex, html, react, Component: Object.values(mod)[0] };
  });
}
