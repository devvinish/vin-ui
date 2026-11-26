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

test("docs · every component is ready: no 'soon' in the sidebar, search or component list", async ({ page }) => {
  await page.goto("/ui/components/");
  await expect(page.locator(".side-group .soon")).toHaveCount(0);
  await expect(page.getByText("Coming soon")).toHaveCount(0);
  const links = await page.locator(".side-group a[href*='/components/']").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).pathname));
  const fs = await import("node:fs");
  const specs = fs.readdirSync("spec").filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
  for (const name of specs) expect(links, `sidebar link for ${name}`).toContain(`/ui/components/${name}/`);
  for (const name of specs) {
    const res = await page.request.get(`/ui/components/${name}/`);
    expect(res.status(), name).toBe(200);
  }
});

test("header · colour mode: System by default, a choice sticks after reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/ui/docs/installation/");
  const group = page.getByRole("group", { name: "Colour mode" });
  const html = page.locator("html");
  await expect(group.getByRole("button", { name: "System" })).toHaveAttribute("aria-pressed", "true");
  await expect(html).not.toHaveAttribute("data-vin-mode", /./);
  await group.getByRole("button", { name: "Light" }).click();
  await expect(html).toHaveAttribute("data-vin-mode", "light");
  await page.reload();
  await expect(html).toHaveAttribute("data-vin-mode", "light");
  await expect(group.getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
  await group.getByRole("button", { name: "System" }).click();
  await expect(html).not.toHaveAttribute("data-vin-mode", /./);
  await page.reload();
  await expect(group.getByRole("button", { name: "System" })).toHaveAttribute("aria-pressed", "true");
});

test("header · the style name keeps one width, so the search box doesn't move", async ({ page }) => {
  await page.goto("/ui/docs/installation/");
  const trigger = page.locator('[data-pop-trigger="style"]');
  const widths = new Set<number>();
  for (const id of STYLE_IDS) {
    await trigger.click();
    await page.locator(`[data-set-style="${id}"]`).click();
    widths.add(Math.round((await trigger.boundingBox())!.width));
  }
  expect([...widths]).toHaveLength(1);
});

for (const path of ["docs/installation", "docs/theming", "docs/frameworks", "docs/cli", "docs/ai", "components/tabs", "styles"]) {
  test(`docs · ${path} passes axe (WCAG 2.2 AA) in light and dark`, async ({ page }) => {
    for (const colorScheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme });
      await page.goto(`/ui/${path}/`);
      await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).exclude(".preview").analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`), colorScheme).toEqual([]);
    }
  });
}

test("header · Docs opens the guides and stays highlighted there", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/ui/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Docs" }).click();
  await expect(page).toHaveURL(/\/ui\/docs\/installation\/$/);
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Docs" })).toHaveAttribute("aria-current", "page");
  await page.goto("/ui/components/button/");
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Components" })).toHaveAttribute("aria-current", "page");
  await page.goto("/ui/docs/");
  await expect(page).toHaveURL(/\/ui\/docs\/installation\/$/);
});

test("landing · the whole page passes axe (WCAG 2.2 AA) in light and dark, wide and narrow", async ({ page }) => {
  for (const width of [1280, 390]) {
    for (const colorScheme of ["light", "dark"] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme });
      await page.goto("/ui/");
      await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${width} ${colorScheme} overflow`).toBe(true);
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`), `${width} ${colorScheme}`).toEqual([]);
    }
  }
});

/*
 * Blocks, Charts and Create: the whole page, previews included, in every style, light and dark.
 * Also no sideways scrolling on a phone.
 */
for (const path of ["blocks", "charts", "create"]) {
  for (const style of STYLE_IDS) {
    test(`${path} · ${style} passes axe (WCAG 2.2 AA) in light and dark`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      for (const colorScheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme });
        await page.goto(`/ui/${path}/?style=${style}`);
        await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
        const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
        expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`), colorScheme).toEqual([]);
      }
    });
  }
  test(`${path} · fits a phone screen`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/ui/${path}/`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("header · on a phone, the menu button opens the main navigation on pages without a sidebar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ui/charts/");
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.locator("#mobile-nav").getByRole("link", { name: "Blocks" }).click();
  await expect(page).toHaveURL(/\/ui\/blocks\/$/);
});

test("create · picking options updates the command", async ({ page }) => {
  await page.goto("/ui/create/");
  await page.locator("[data-create-fw='svelte']").click();
  await page.locator("[data-demo-style='terminal']").click();
  await page.locator(".create [data-opt='radius'][data-val='none']").click();
  await expect(page.locator("[data-create-command]")).toHaveText('npx @vinish/ui init --framework svelte --style terminal --accent "#5b5bd6" --radius none');
  await expect(page.locator("html")).toHaveAttribute("data-vin-style", "terminal");
  await page.locator("[data-create-fw='html']").click();
  await expect(page.locator("[data-create-command]")).toContainText('href="https://vinish.dev/ui/v1/terminal.css"');
});

test("charts · the pie tooltip follows the slice under the pointer (vinui.js)", async ({ page }) => {
  await page.goto("/ui/charts/#pie-simple");
  const slice = page.locator("#pie-simple .vin-chart__slice").first();
  await slice.hover();
  await expect(page.locator("#pie-simple .vin-chart__tooltip")).toContainText("Chrome");
  await page.locator("#pie-simple .vin-chart__svg").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#pie-simple .vin-chart__tooltip")).toContainText("Safari");
});
