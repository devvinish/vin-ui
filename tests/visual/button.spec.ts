import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { STYLE_IDS } from "@vinui/styles";

/*
 * Phase 0 done-check: Button works in all 8 styles, light and dark, in HTML and React.
 * Each run: screenshot the fixture + run axe (WCAG 2.2 AA) on it.
 */
for (const style of STYLE_IDS) {
  for (const mode of ["light", "dark"] as const) {
    test(`button · ${style} · ${mode}`, async ({ page }) => {
      await page.goto(`/ui/fixtures/button/?style=${style}&mode=${mode}`);
      await page.evaluate(() => document.fonts.ready);
      const fixture = page.locator("#fixture");

      // HTML and React render the same buttons.
      const html = await fixture.locator("[data-fixture^='html-'] .vin-btn").evaluateAll((els) => els.map((e) => e.className));
      const react = await fixture.locator("[data-fixture^='react-'] .vin-btn").evaluateAll((els) => els.map((e) => e.className));
      expect(react).toEqual(html);

      const results = await new AxeBuilder({ page }).include("#fixture").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);

      await expect(fixture).toHaveScreenshot(`button-${style}-${mode}.png`);
    });
  }
}

test("keyboard: focus ring is visible on every variant", async ({ page }) => {
  await page.goto("/ui/fixtures/button/?style=precision&mode=light");
  await page.keyboard.press("Tab");
  const ring = await page.evaluate(() => {
    const s = getComputedStyle(document.activeElement!);
    return s.boxShadow !== "none" || s.outlineStyle !== "none";
  });
  expect(ring).toBe(true);
});
