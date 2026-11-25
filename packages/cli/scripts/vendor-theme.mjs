// The CLI ships with no dependencies, so it carries its own copy of the theme engine.
// This writes src/theme.mjs from packages/theme, with the style list filled in.
// A test fails if the copy is out of date: run `npm run vendor -w @vinish/ui`.
import { readFileSync, writeFileSync } from "node:fs";
import { STYLE_IDS, DEFAULT_STYLE } from "../../styles/src/styles.mjs";

export function vendoredTheme() {
  const src = readFileSync(new URL("../../theme/src/index.mjs", import.meta.url), "utf8");
  const line = 'import { STYLE_IDS, DEFAULT_STYLE } from "@vinui/styles";';
  if (!src.includes(line)) throw new Error("vendor-theme: the import line in packages/theme changed");
  return "// GENERATED from packages/theme/src/index.mjs by scripts/vendor-theme.mjs. Do not edit.\n" +
    src.replace(line, `const STYLE_IDS = ${JSON.stringify(STYLE_IDS)};\nconst DEFAULT_STYLE = ${JSON.stringify(DEFAULT_STYLE)};`);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  writeFileSync(new URL("../src/theme.mjs", import.meta.url), vendoredTheme());
  console.log("vendor-theme: wrote src/theme.mjs");
}
