// Cloudflare Pages reads _redirects from the output root (dist/), one level above the site (dist/ui/).
import { writeFileSync } from "node:fs";
writeFileSync(new URL("../dist/_redirects", import.meta.url), "/ /ui/ 302\n");
console.log("postbuild: wrote dist/_redirects");
