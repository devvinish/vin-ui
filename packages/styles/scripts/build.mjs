// Writes dist/vinui.css (all 8 styles), dist/styles/<id>.css (one style each) and dist/styles.json.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { STYLES, COMPONENTS } from "../src/styles.mjs";
import { buildCss } from "../src/generate.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const { version } = JSON.parse(read("package.json"));

const base = read("src/base.css");
const components = Object.fromEntries(COMPONENTS.map((c) => [c, read(`src/components/${c}.css`)]));

rmSync(join(root, "dist"), { recursive: true, force: true });
mkdirSync(join(root, "dist/styles"), { recursive: true });

const all = buildCss({ base, components, version });
writeFileSync(join(root, "dist/vinui.css"), all);
for (const style of STYLES) {
  writeFileSync(join(root, `dist/styles/${style.id}.css`), buildCss({ base, components, styles: [style], version }));
}
writeFileSync(
  join(root, "dist/styles.json"),
  JSON.stringify(STYLES.map(({ id, name, short, description, tags, fonts }) => ({ id, name, short, description, tags, fonts })), null, 2) + "\n",
);
console.log(`VinUI styles built: vinui.css (${(all.length / 1024).toFixed(1)} KB) + ${STYLES.length} single-style files`);
