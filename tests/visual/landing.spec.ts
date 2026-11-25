import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { STYLE_IDS } from "@vinui/styles";

/* The landing hero uses real VinUI components: check it in every style, light and dark, wide and narrow. */
for (const width of [1280, 390]) {
  for (const style of STYLE_IDS) {
    for (const mode of ["light", "dark"] as const) {
      test(`landing hero · ${style} · ${mode} · ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: mode });
        await page.goto("/ui/");
        // Check the settled colours, not a frame halfway through the style change.
        await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });
        await page.locator(`[data-demo-style=${style}]`).click();
        await expect(page.locator("html")).toHaveAttribute("data-vin-style", style);
        await page.evaluate(() => document.fonts.ready);
        const demo = page.locator(".demo");
        // Nothing may stick out of the page sideways.
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        const results = await new AxeBuilder({ page }).include(".demo").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
        await expect(demo).toHaveScreenshot(`landing-${style}-${mode}-${width}.png`);
      });
    }
  }
}

test("landing hero · the components work", async ({ page }) => {
  await page.goto("/ui/");
  const demo = page.locator(".demo");
  await demo.getByRole("tab", { name: "Team" }).click();
  await expect(demo.getByRole("tab", { name: "Team" })).toHaveAttribute("aria-selected", "true");
  const sw = demo.getByRole("switch").first();
  const before = await sw.isChecked();
  await sw.click();
  expect(await sw.isChecked()).toBe(!before);
  await demo.getByRole("button", { name: /More options/ }).click();
  await expect(page.locator("#hd-more")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#hd-more")).toBeHidden();
});
