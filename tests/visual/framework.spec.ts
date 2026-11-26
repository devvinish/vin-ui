import { test, expect } from "@playwright/test";

/* One framework setting for the site: picking it in Customize ("Code in"), in a code tab or on Create applies everywhere. */
const selected = (page: import("@playwright/test").Page) => page.locator("[data-tabs] [data-tab][aria-selected=true]").first();

test("Customize 'Code in' sets the code tabs on every page and on Create", async ({ page }) => {
  await page.goto("/ui/components/button/");
  await expect(selected(page)).toHaveAttribute("data-tab", "html");
  await page.click("[data-open-customize]");
  await page.click("[data-code-in=vue]");
  await expect(page.locator("[data-code-in=vue]")).toHaveAttribute("aria-pressed", "true");
  await expect(selected(page)).toHaveAttribute("data-tab", "vue");

  await page.goto("/ui/blocks/");
  await expect(selected(page)).toHaveAttribute("data-tab", "vue");
  await page.goto("/ui/create/");
  await expect(page.locator("[data-create-fw=vue]")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-create-command]")).toContainText("--framework vue");
});

test("a code tab and Create change the same setting", async ({ page }) => {
  await page.goto("/ui/create/");
  await page.click("[data-create-fw=svelte]");
  await expect(page.locator("[data-create-command]")).toContainText("--framework svelte");
  await page.goto("/ui/components/card/");
  await expect(selected(page)).toHaveAttribute("data-tab", "svelte");
  await page.locator("[data-tab=react]").first().click();
  await page.click("[data-open-customize]");
  await expect(page.locator("[data-code-in=react]")).toHaveAttribute("aria-pressed", "true");
  await page.goto("/ui/create/");
  await expect(page.locator("[data-create-fw=react]")).toHaveAttribute("aria-pressed", "true");
});

test("Create's old saved choice is carried over", async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem("seeded")) { localStorage.setItem("vinui:create-framework", "vue"); sessionStorage.setItem("seeded", "1"); } });
  await page.goto("/ui/components/button/");
  await expect(selected(page)).toHaveAttribute("data-tab", "vue");
});
