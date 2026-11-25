import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync, readFileSync } from "node:fs";
import { STYLE_IDS } from "@vinui/styles";

/*
 * The style contract, checked: every component, in all 8 styles, light and dark, HTML and React.
 * Each run: HTML/React parity + axe (WCAG 2.2 AA) + a screenshot.
 */
const specDir = new URL("../../spec/", import.meta.url);
// Date components mark today, so every page sees the same day.
test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(new Date("2026-11-25T10:00:00")); });

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

/*
 * Overlays, open: the first HTML example's trigger is clicked, then the whole screen is checked
 * (axe + a screenshot), because the panel sits in the top layer, outside the fixture.
 */
const OPEN: Record<string, string | [role: "button" | "combobox", name: string]> = {
  dialog: "Edit profile", "alert-dialog": "Delete project", sheet: "Filters", "dropdown-menu": "My account", popover: "Dimensions",
  combobox: ["combobox", "Framework"], "date-picker": "Due date",
};
for (const [name, opener] of Object.entries(OPEN)) {
  const [role, trigger] = typeof opener === "string" ? (["button", opener] as const) : opener;
  for (const style of STYLE_IDS) {
    for (const mode of ["light", "dark"] as const) {
      test(`${name} open · ${style} · ${mode}`, async ({ page }) => {
        await page.goto(`/ui/fixtures/${name}/?style=${style}&mode=${mode}`);
        await page.evaluate(() => document.fonts.ready);
        await page.locator("[data-fixture^='html-']").getByRole(role, { name: trigger }).first().click();
        const panel = page.locator("dialog[open], [popover]:popover-open").first();
        await expect(panel).toBeVisible();
        await page.waitForTimeout(400); // let the open transition finish
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
        await expect(page).toHaveScreenshot(`${name}-open-${style}-${mode}.png`);
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
