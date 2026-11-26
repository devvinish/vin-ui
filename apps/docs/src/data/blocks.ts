/**
 * The blocks, read through Vite at build time (packages/html/blocks), with the code generators
 * from scripts/blocks.mjs. The site never reads block files from disk at run time.
 */
import list from "../../../../packages/html/blocks/blocks.json";

const raw = import.meta.glob<string>("../../../../packages/html/blocks/*.html", { eager: true, query: "?raw", import: "default" });

export type Block = { name: string; title: string; category: string; description: string; html: string };
export const BLOCKS: Block[] = list.map((b) => {
  const html = raw[`../../../../packages/html/blocks/${b.name}.html`];
  if (html === undefined) throw new Error(`VinUI docs: blocks/${b.name}.html is missing`);
  return { ...b, html };
});

export { BLOCK_CATEGORIES, blockHtml, blockReact, blockVue, blockSvelte, blockDependencies } from "../../../../scripts/blocks.mjs";
