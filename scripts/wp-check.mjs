/*
 * Checks the WordPress export (wp/preview, see scripts/wp-export.mjs) against the tested site:
 * every element of every page must have the same computed styles and position, at 1280 and 390,
 * the page must not scroll sideways, and axe (WCAG 2.2 AA) must pass. This is what proves the theme
 * doesn't change VinUI and VinUI doesn't change the theme, before anything goes to WordPress.
 *
 * Needs both servers:
 *   python3 -m http.server 4342 --directory apps/docs/dist     (the tested site)
 *   node scripts/wp-preview-server.mjs 4350                    (the WordPress version)
 * `node scripts/wp-check.mjs [path-filter]`   DARK=1 for dark mode, FIRST=1 to list the first differences per page.
 */
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import fs from "node:fs";
const pages = JSON.parse(fs.readFileSync(new URL("../wp/out/pages.json", import.meta.url),"utf8")).pages;
const only = process.argv[2] ? pages.filter(p=>p.path.includes(process.argv[2])) : pages;
const PROPS = ["font-family","font-size","font-weight","line-height","color","background-color","margin-top","margin-bottom","margin-left","padding-top","padding-left","border-top-width","border-top-color","border-radius","display","text-decoration-line","letter-spacing","box-shadow"];
const grab = ([sel, props]) => {
  const out = [];
  for (const root of document.querySelectorAll(sel)) for (const el of [root, ...root.querySelectorAll("*")]) {
    if (["SCRIPT","STYLE","path","svg","g","rect","circle","line","polyline"].includes(el.tagName)) continue;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    out.push({ tag: el.tagName.replace("MAIN","DIV"), cls: String(el.className).slice(0,50), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), s: props.map(p => cs.getPropertyValue(p)) });
  }
  return out;
};
const b = await chromium.launch();
const summary = {};
for (const width of [1280, 390]) {
  const ctx = await b.newContext({ viewport: { width, height: 900 }, colorScheme: process.env.DARK ? "dark" : "light" });
  const pa = await ctx.newPage(), pw = await ctx.newPage();
  for (const p of only) {
    await pa.goto("http://localhost:4342" + (p.path === "/ui" ? "/ui/" : p.path + "/"), { waitUntil: "networkidle" });
    await pw.goto("http://localhost:4350" + p.path, { waitUntil: "networkidle" });
    for (const pg of [pa, pw]) await pg.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
    const A = await pa.evaluate(grab, [".site-header, #sidebar, main#main, .site-footer", PROPS]), W = await pw.evaluate(grab, [".vinui-site .site-header, .vinui-site #sidebar, #vinui-main, .vinui-site .site-footer", PROPS]);
    const diffs = [];
    if (A.length !== W.length) diffs.push(`element count ${A.length} vs ${W.length}`);
    for (let i = 0; i < Math.min(A.length, W.length); i++) {
      const a = A[i], w = W[i];
      if (a.tag !== w.tag) { diffs.push(`#${i} tag ${a.tag} vs ${w.tag}`); break; }
      PROPS.forEach((pr, k) => { if (a.s[k] !== w.s[k]) diffs.push(`${a.tag}.${a.cls} ${pr}: ${a.s[k]} → ${w.s[k]}`); });
      for (const k of ["x","y","w","h"]) if (Math.abs(a[k]-w[k]) > 1) { diffs.push(`${a.tag}.${a.cls} ${k}: ${a[k]} → ${w[k]}`); break; }
    }
    const ov = await pw.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (ov) diffs.unshift("OVERFLOW");
    const { violations } = await new AxeBuilder({ page: pw }).include(".vinui-site").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    for (const v of violations) diffs.unshift(`AXE ${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`);
    const firsts = diffs.slice(0, 3); if (process.env.FIRST) for (const d of firsts) console.log(width, p.path, d.slice(0,160));
    for (const d of diffs) summary[`${width} ${d}`] = (summary[`${width} ${d}`] || []).concat(p.path);
  }
  await ctx.close();
}
await b.close();
const rows = Object.entries(summary).sort((a,b)=>b[1].length-a[1].length);
console.log(rows.length ? `${rows.length} distinct differences` : "wp-check: no differences, no overflow, axe passes");
for (const [d, ps] of rows.slice(0, 60)) console.log(String(ps.length).padStart(3), d.slice(0,170), ps.length < 4 ? ps.join(" ") : "");
process.exitCode = rows.length ? 1 : 0;
