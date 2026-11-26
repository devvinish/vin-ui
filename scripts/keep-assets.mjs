/*
 * Run right before `wrangler deploy`. File names in /ui/_astro change with every build, and the
 * WordPress pages point at them, so a deploy must not remove the files the published pages still use.
 * This copies every /ui/_astro file from earlier builds (kept in workers/site/kept/_astro) into the
 * build being deployed, then adds this build's files to the kept set. Old files cost nothing to keep.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const built = path.join(ROOT, "apps/docs/dist/ui/_astro");
const kept = path.join(ROOT, "workers/site/kept/_astro");
fs.mkdirSync(kept, { recursive: true });
let restored = 0, added = 0;
for (const f of fs.readdirSync(kept)) if (!fs.existsSync(path.join(built, f))) { fs.copyFileSync(path.join(kept, f), path.join(built, f)); restored++; }
for (const f of fs.readdirSync(built)) if (!fs.existsSync(path.join(kept, f))) { fs.copyFileSync(path.join(built, f), path.join(kept, f)); added++; }
console.log(`keep-assets: ${restored} earlier files added to the deploy, ${added} new files kept`);
