import { test, expect, type Page } from "@playwright/test";

/*
 * Behaviour of the interactive components, for both versions:
 * HTML (driven by vinui.js) and React (hydrated islands). Same keys, same results.
 */
const ready = async (page: Page, name: string) => {
  await page.goto(`/ui/fixtures/${name}/?style=precision&mode=light`);
  await page.waitForFunction(() => !document.querySelector("astro-island[ssr]"));
};

for (const side of ["html", "react"] as const) {
  test.describe(`${side}`, () => {
    test("select: keyboard opens, moves, types ahead, chooses and closes", async ({ page }) => {
      await ready(page, "select");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const trigger = root.getByRole("combobox", { name: "Framework" });
      const list = page.getByRole("listbox", { name: "Framework" }).filter({ visible: true });

      await trigger.focus();
      await page.keyboard.press("ArrowDown");
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(list).toBeVisible();
      // Opens on the chosen option, then moves.
      await expect(page.locator(`#${await trigger.getAttribute("aria-activedescendant")}`)).toHaveText("Astro");
      await page.keyboard.press("ArrowDown");
      await expect(page.locator(`#${await trigger.getAttribute("aria-activedescendant")}`)).toHaveText("Next.js");
      await page.keyboard.press("End");
      await expect(page.locator(`#${await trigger.getAttribute("aria-activedescendant")}`)).toHaveText("SvelteKit");
      await page.keyboard.press("r");
      await expect(page.locator(`#${await trigger.getAttribute("aria-activedescendant")}`)).toHaveText("Remix");
      await page.keyboard.press("Enter");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(trigger).toHaveText("Remix");
      await expect(trigger).toBeFocused();
      await expect(root.locator('input[type="hidden"]')).toHaveValue("remix");

      // Escape closes without changing the value; a click outside closes too.
      await page.keyboard.press("Enter");
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("Escape");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(trigger).toHaveText("Remix");
      await trigger.click();
      await expect(list).toBeVisible();
      await page.mouse.click(860, 20);
      await expect(trigger).toHaveAttribute("aria-expanded", "false");

      // Mouse: click an option.
      await trigger.click();
      await list.getByRole("option", { name: "Nuxt" }).click();
      await expect(trigger).toHaveText("Nuxt");
    });

    test("select: disabled options are skipped, disabled selects don't open", async ({ page }) => {
      await ready(page, "select");
      const root = page.locator(`[data-fixture="${side}-states"]`);
      const tz = root.getByRole("combobox", { name: "Time zone" });
      await tz.focus();
      await page.keyboard.press("ArrowDown"); // India (first)
      await page.keyboard.press("ArrowDown"); // London
      await page.keyboard.press("ArrowDown"); // skips Los Angeles
      await page.keyboard.press("Enter");
      await expect(tz).toHaveText("Tokyo (JST)");
      const cur = root.getByRole("combobox", { name: "Currency" });
      await expect(cur).toBeDisabled();
    });

    test("tabs: arrows, Home/End and clicks switch panels; disabled tabs are skipped", async ({ page }) => {
      await ready(page, "tabs");
      const root = page.locator(`[data-fixture="${side}-line"]`);
      const tab = (n: string) => root.getByRole("tab", { name: n });
      await tab("Overview").focus();
      await page.keyboard.press("ArrowRight");
      await expect(tab("Activity")).toBeFocused();
      await expect(tab("Activity")).toHaveAttribute("aria-selected", "true");
      await expect(root.getByRole("tabpanel")).toHaveText("Latest changes from your team.");
      await page.keyboard.press("End");
      await expect(tab("Files")).toBeFocused(); // Archive is disabled
      await page.keyboard.press("ArrowRight");
      await expect(tab("Overview")).toBeFocused(); // wraps
      await page.keyboard.press("Tab");
      await expect(root.getByRole("tabpanel")).toBeFocused();
      await tab("Files").click();
      await expect(root.getByRole("tabpanel")).toHaveText("Shared documents and images.");
      await expect(tab("Overview")).toHaveAttribute("tabindex", "-1");
    });

    test("checkbox and switch toggle with the label and Space", async ({ page }) => {
      await ready(page, "switch");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const sw = root.getByRole("switch", { name: "Bluetooth" });
      await expect(sw).not.toBeChecked();
      await root.getByText("Bluetooth").click();
      await expect(sw).toBeChecked();
      await page.keyboard.press("Space");
      await expect(sw).not.toBeChecked();
      await ready(page, "checkbox");
      const cb = page.locator(`[data-fixture="${side}-basic"]`).getByRole("checkbox", { name: "Accept the terms" });
      await cb.focus();
      await page.keyboard.press("Space");
      await expect(cb).toBeChecked();
    });
  });
}
