// Run after `npm run build:live`, before `wrangler deploy`.
// - Leaves the test-only pages (/ui/fixtures) out of the upload (.assetsignore).
// - Writes /ui/sitemap.xml with the real pages.
// - Checks the result: every real page has the Mediavine tag (live build) and nothing else is off.
import fs from "node:fs";
import path from "node:path";

const dist = new URL("../apps/docs/dist/", import.meta.url).pathname;
const ui = path.join(dist, "ui");
const SITE = "https://vinish.dev";
const SKIP = [/^fixtures\//, /^404\.html$/, /^docs\/index\.html$/]; // test pages, the 404 page, the /docs/ forwarder

fs.writeFileSync(path.join(dist, ".assetsignore"), "# Test-only pages: built for the test suite, never uploaded.\nui/fixtures/\n");

const pages = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) pages.push(path.relative(ui, p));
  }
};
walk(ui);
const real = pages.filter((p) => !SKIP.some((r) => r.test(p))).sort();

const problems = [];
for (const p of real) {
  const html = fs.readFileSync(path.join(ui, p), "utf8");
  if (!html.includes("scripts.mediavine.com/tags/")) problems.push(`${p}: no Mediavine tag (build with npm run build:live)`);
  if (/name="robots" content="noindex"/.test(html)) problems.push(`${p}: marked noindex`);
}
if (!fs.existsSync(path.join(ui, "404.html"))) problems.push("404.html is missing");
if (problems.length) { console.error("Not ready to deploy:\n- " + problems.join("\n- ")); process.exit(1); }

const url = (p) => `${SITE}/ui/${p.replace(/index\.html$/, "")}`;
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${real.map((p) => `  <url><loc>${url(p)}</loc></url>`).join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(ui, "sitemap.xml"), xml);

console.log(`Ready: ${real.length} pages in the sitemap, ${pages.length - real.length} left out of it (test pages, 404, /docs/ forwarder); fixtures won't be uploaded.`);
