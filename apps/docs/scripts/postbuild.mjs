// Cloudflare Pages reads _redirects from the output root (dist/), one level above the site (dist/ui/).
import { writeFileSync } from "node:fs";
import { writeRegistry } from "../../../scripts/build-registry.mjs";

writeFileSync(new URL("../dist/_redirects", import.meta.url), "/ /ui/ 302\n");
// Registry JSON for the CLI, versioned CSS, vinui.js and llms.txt.
const n = writeRegistry(new URL("../dist/ui", import.meta.url).pathname);
console.log(`postbuild: wrote dist/_redirects and ${n} registry files`);
