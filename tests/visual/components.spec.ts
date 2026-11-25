import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync, readFileSync } from "node:fs";
import { STYLE_IDS } from "@vinui/styles";

/*
 * The style contract, checked: every component, in all 8 styles, light and dark, HTML and React.
 * Each run: HTML/React parity + axe (WCAG 2.2 AA) + a screenshot.
 */
const specDir = new URL("../../spec/", import.meta.url);
const components = readdirSync(specDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(new URL(f, specDir), "utf8")).name as string);

for (const name of components) {
  for (const style of STYLE_IDS) {
    for (const mode of ["light", "dark"] as const) {
      test(`${name} · ${style} · ${mode}`, async ({ page }) => {
        await page.goto(`/ui/fixtures/${name}/?style=${style}&mode=${mode}`);
        await page.evaluate(() => document.fonts.ready);
        const fixture = page.locator("#fixture");

        const classesIn = (side: string) =>
          fixture.locator(`[data-fixture^='${side}-'] [class*='vin-']`).evaluateAll((els) => els.map((e) => `${e.tagName}.${[...e.classList].filter((c) => c.startsWith("vin-")).sort().join(".")}`));
        expect(await classesIn("react")).toEqual(await classesIn("html"));

        const results = await new AxeBuilder({ page }).include("#fixture").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);

        await expect(fixture).toHaveScreenshot(`${name}-${style}-${mode}.png`);
      });
    }
  }
}

test("keyboard: the first button shows a focus ring", async ({ page }) => {
  await page.goto("/ui/fixtures/button/?style=precision&mode=light");
  await page.keyboard.press("Tab");
  const ring = await page.evaluate(() => {
    const s = getComputedStyle(document.activeElement!);
    return s.boxShadow !== "none" || s.outlineStyle !== "none";
  });
  expect(ring).toBe(true);
});
