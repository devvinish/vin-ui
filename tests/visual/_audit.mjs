import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const STYLES = ["precision","tactile","clay","tonal","editorial","terminal","paper","bento"];
const PAGES = ["button","badge","card","input"];
const b = await chromium.launch();
const problems = [];
for (const width of [1440, 375]) {
  const ctx = await b.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  for (const name of PAGES) {
    await page.goto(`http://localhost:4330/ui/components/${name}/`);
    await page.evaluate(() => document.querySelectorAll("[data-panel]").forEach((p) => (p.hidden = false)));
    for (const style of STYLES) for (const mode of ["light","dark"]) {
      await page.evaluate(([s, m]) => { const d = document.documentElement; d.setAttribute("data-vin-style", s); d.setAttribute("data-vin-mode", m); d.setAttribute("data-vin-motion", "off"); }, [style, mode]);
      await page.waitForTimeout(30);
      const found = await page.evaluate(() => {
        const out = [];
        const docOverflow = document.documentElement.scrollWidth > innerWidth + 1;
        if (docOverflow) out.push(`page scrolls sideways (${document.documentElement.scrollWidth}px)`);
        for (const prev of document.querySelectorAll(".example .preview")) {
          const ex = prev.closest(".example").id + "/" + prev.closest("[data-panel]").dataset.panel;
          const pr = prev.getBoundingClientRect();
          const all = [...prev.querySelectorAll("*")].filter((e) => e.getBoundingClientRect().width > 0);
          for (const e of all) {
            const r = e.getBoundingClientRect();
            if (r.right > pr.right + 1 || r.left < pr.left - 1) { out.push(`${ex}: ${e.className || e.tagName} spills out of the preview`); break; }
          }
          for (const e of prev.querySelectorAll(".vin-btn, .vin-badge, .vin-label, .vin-card__title")) {
            if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== "visible") out.push(`${ex}: text clipped in ${e.className}`);
          }
          // top-level items of the example
          const root = prev.firstElementChild;
          const items = [...(getComputedStyle(root).display === "contents" ? root.children : [root])].flatMap((e) => getComputedStyle(e).display === "contents" ? [...e.children] : [e]);
          const rects = items.map((e) => ({ e, r: e.getBoundingClientRect() }));
          for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
            const a = rects[i].r, c = rects[j].r;
            const ov = Math.min(a.right, c.right) - Math.max(a.left, c.left), ovy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
            if (ov > 1 && ovy > 1) out.push(`${ex}: items overlap (${rects[i].e.className} / ${rects[j].e.className})`);
            const sameRow = ovy > 0 && Math.abs(a.top - c.top) > 2;
            const blocky = (x) => x.matches(".vin-field, .vin-card, div");
            if (sameRow && blocky(rects[i].e) && blocky(rects[j].e)) out.push(`${ex}: side-by-side blocks don't line up at the top (${Math.round(Math.abs(a.top - c.top))}px)`);
          }
        }
        return out;
      });
      for (const f of found) problems.push(`${width}px ${name} ${style} ${mode}: ${f}`);
      if (width === 1440 && mode === "light") {
        const previews = await page.locator("[data-panel='html'] .preview").all();
        for (let i = 0; i < previews.length; i++) await previews[i].screenshot({ path: `${OUT}/${name}-${i}-${style}.png` });
      }
    }
  }
  await ctx.close();
}
await b.close();
console.log(problems.length ? [...new Set(problems)].join("\n") : "no layout problems found");
