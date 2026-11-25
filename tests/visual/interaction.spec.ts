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

    test("radio group: arrow keys move the choice; disabled options are skipped", async ({ page }) => {
      await ready(page, "radio-group");
      const root = page.locator(`[data-fixture="${side}-horizontal"]`);
      const m = root.getByRole("radio", { name: "M", exact: true });
      await m.focus();
      await page.keyboard.press("ArrowRight");
      await expect(root.getByRole("radio", { name: "L", exact: true })).toBeChecked();
      await page.keyboard.press("ArrowRight"); // XL is disabled: wraps to S
      await expect(root.getByRole("radio", { name: "S", exact: true })).toBeChecked();
      const cards = page.locator(`[data-fixture="${side}-cards"]`);
      // The label stretches over the whole card: a click anywhere on it (here, on the description) selects.
      const box = (await cards.getByText("Single sign-on and priority support.").boundingBox())!;
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(cards.getByRole("radio", { name: "Enterprise" })).toBeChecked();
    });

    test("textarea: the count follows the text and marks the limit", async ({ page }) => {
      await ready(page, "textarea");
      const root = page.locator(`[data-fixture="${side}-count"]`);
      const ta = root.getByRole("textbox", { name: "Bio" });
      const count = root.locator(".vin-textarea__count");
      await expect(count).toHaveText("32 / 160");
      await ta.fill("Hi");
      await expect(count).toHaveText("2 / 160");
      await expect(count).not.toHaveAttribute("data-over");
      await ta.fill("x".repeat(160));
      await expect(count).toHaveText("160 / 160");
      await expect(count).toHaveAttribute("data-over", "");
      const auto = page.locator(`[data-fixture="${side}-auto"]`).getByRole("textbox", { name: "Notes" });
      const h0 = await auto.evaluate((e) => e.getBoundingClientRect().height);
      await auto.fill("one\ntwo\nthree\nfour\nfive");
      const h1 = await auto.evaluate((e) => e.getBoundingClientRect().height);
      expect(h1).toBeGreaterThan(h0 + 30);
    });

    test("toggle: click and Space flip aria-pressed; disabled stays put", async ({ page }) => {
      await ready(page, "toggle");
      const root = page.locator(`[data-fixture="${side}-icons"]`);
      const italic = root.getByRole("button", { name: "Italic" });
      await expect(italic).toHaveAttribute("aria-pressed", "false");
      await italic.click();
      await expect(italic).toHaveAttribute("aria-pressed", "true");
      await page.keyboard.press("Space");
      await expect(italic).toHaveAttribute("aria-pressed", "false");
      await expect(page.locator(`[data-fixture="${side}-outline"]`).getByRole("button", { name: "Locked" })).toBeDisabled();
    });

    test("toggle group: single moves and chooses with arrows; multiple toggles with Space", async ({ page }) => {
      await ready(page, "toggle-group");
      const single = page.locator(`[data-fixture="${side}-single"]`);
      const grid = single.getByRole("radio", { name: "Grid" });
      await expect(grid).toHaveAttribute("aria-checked", "true");
      await grid.focus();
      await page.keyboard.press("ArrowRight");
      const board = single.getByRole("radio", { name: "Board" });
      await expect(board).toBeFocused();
      await expect(board).toHaveAttribute("aria-checked", "true");
      await expect(grid).toHaveAttribute("aria-checked", "false");
      await expect(single.locator('[tabindex="0"]')).toHaveCount(1);
      const multi = page.locator(`[data-fixture="${side}-multiple"]`);
      const bold = multi.getByRole("button", { name: "Bold" });
      await bold.focus();
      await page.keyboard.press("ArrowRight");
      const italic = multi.getByRole("button", { name: "Italic" });
      await expect(italic).toBeFocused();
      await expect(italic).toHaveAttribute("aria-pressed", "false");
      await page.keyboard.press("Space");
      await expect(italic).toHaveAttribute("aria-pressed", "true");
      await expect(bold).toHaveAttribute("aria-pressed", "true");
    });

    test("input otp: typing fills the boxes, letters are ignored, paste works", async ({ page }) => {
      await ready(page, "input-otp");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const input = root.getByRole("textbox", { name: "Verification code" });
      const slots = root.locator(".vin-otp__slot");
      await input.focus();
      await expect(slots.nth(0)).toHaveAttribute("data-active", "");
      await page.keyboard.type("12a3");
      await expect(input).toHaveValue("123");
      await expect(slots.nth(2)).toHaveText("3");
      await expect(slots.nth(3)).toHaveAttribute("data-active", "");
      await page.keyboard.press("Backspace");
      await expect(slots.nth(2)).toHaveText("");
      await input.fill("987654321");
      await expect(input).toHaveValue("987654");
      await expect(slots.nth(5)).toHaveText("4");
      await expect(root.getByRole("textbox", { name: "Verification code" })).toHaveAttribute("autocomplete", "one-time-code");
    });

    test("slider: keys move the value, the fill and the shown value; range thumbs can't cross", async ({ page }) => {
      await ready(page, "slider");
      const basic = page.locator(`[data-fixture="${side}-basic"]`);
      const vol = basic.getByRole("slider", { name: "Volume" });
      await vol.focus();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await expect(vol).toHaveValue("42");
      await expect(basic.locator("output")).toHaveText("42");
      expect(await vol.evaluate((e) => e.style.getPropertyValue("--vin-fill"))).toBe("42%");
      const range = page.locator(`[data-fixture="${side}-range"]`);
      const lo = range.getByRole("slider", { name: "Minimum price" });
      await lo.focus();
      for (let i = 0; i < 14; i++) await page.keyboard.press("ArrowRight");
      await expect(lo).toHaveAttribute("aria-valuenow", "700"); // stopped at the other thumb
      await expect(range.locator("output")).toHaveText("₹700 – ₹700");
      await page.keyboard.press("Home");
      await expect(lo).toHaveAttribute("aria-valuenow", "0");
      await expect(lo).toHaveAttribute("aria-valuetext", "₹0");
      await expect(range.locator("output")).toHaveText("₹0 – ₹700");
      await expect(range.locator('input[name="price-min"]')).toHaveValue("0");
      // Click near the right end of the track: the nearer thumb (Maximum) jumps there.
      const hi = range.getByRole("slider", { name: "Maximum price" });
      const box = (await range.locator(".vin-range").boundingBox())!;
      await page.mouse.click(box.x + box.width - 4, box.y + box.height / 2);
      await expect(hi).toHaveAttribute("aria-valuenow", "1000");
      await expect(hi).toBeFocused();
    });

    test("alert: the close button removes the alert and focus moves on", async ({ page }) => {
      await ready(page, "alert");
      const root = page.locator(`[data-fixture="${side}-actions"]`);
      await expect(root.locator(".vin-alert")).toHaveCount(1);
      await root.getByRole("button", { name: "Dismiss" }).focus();
      await page.keyboard.press("Enter");
      await expect(root.locator(".vin-alert")).toHaveCount(0);
      await expect(page.locator("body")).not.toBeFocused();
    });

    test("avatar: a picture that fails to load shows the initials", async ({ page }) => {
      await ready(page, "avatar");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const ada = root.getByRole("img", { name: "Ada Lovelace" });
      await expect(ada.locator("img")).toBeVisible();
      await ada.locator("img").evaluate((img: HTMLImageElement) => (img.src = "/ui/avatars/missing.svg"));
      await expect(ada.locator("img")).toBeHidden();
      await expect(ada.locator(".vin-avatar__fallback")).toHaveText("AL");
    });

    test("accordion: one at a time opens and closes the others; Enter toggles", async ({ page }) => {
      await ready(page, "accordion");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const items = root.locator("details");
      await expect(items.nth(0)).toHaveAttribute("open", "");
      await root.getByText("Do I need React?").click();
      await expect(items.nth(1)).toHaveAttribute("open", "");
      await expect(items.nth(0)).not.toHaveAttribute("open");
      await root.getByText("Can I change the colours?").focus();
      await page.keyboard.press("Enter");
      await expect(items.nth(2)).toHaveAttribute("open", "");
      await expect(items.nth(1)).not.toHaveAttribute("open");
      const multi = page.locator(`[data-fixture="${side}-multiple"] details`);
      await page.locator(`[data-fixture="${side}-multiple"]`).getByText("Warranty").click();
      await expect(multi.locator("[open]")).toHaveCount(0);
      await expect(page.locator(`[data-fixture="${side}-multiple"] details[open]`)).toHaveCount(3);
    });

    test("collapsible: the trigger shows and hides the content", async ({ page }) => {
      await ready(page, "collapsible");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const text = root.getByText("2 items · Ships in 2 days · Free delivery");
      await expect(text).toBeHidden();
      await root.getByText("Order details").click();
      await expect(text).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(text).toBeHidden();
    });

    test("tooltip: keyboard focus shows it, Escape hides it, hover shows it", async ({ page }) => {
      await ready(page, "tooltip");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const btn = root.getByRole("button", { name: "Save" });
      const tip = root.getByRole("tooltip");
      await expect(btn).toHaveAccessibleDescription("Add to your library");
      await btn.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(tip).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(tip).toBeHidden();
      await expect(btn).toBeFocused();
      await btn.hover();
      await expect(tip).toBeVisible();
      const t = (await tip.boundingBox())!, b = (await btn.boundingBox())!;
      expect(t.y + t.height).toBeLessThanOrEqual(b.y);
      await page.mouse.move(5, 5);
      await expect(tip).toBeHidden();
      const icons = page.locator(`[data-fixture="${side}-icons"]`);
      await expect(icons.getByRole("button", { name: "Align centre" })).toBeVisible();
    });

    test("popover: the trigger opens it next to the button; Escape closes and returns focus", async ({ page }) => {
      await ready(page, "popover");
      const root = page.locator(`[data-fixture="${side}-form"]`);
      const btn = root.getByRole("button", { name: "Dimensions" });
      const dialog = root.getByRole("dialog", { name: "Dimensions" });
      await expect(dialog).toBeHidden();
      await btn.click();
      await expect(dialog).toBeVisible();
      await expect(btn).toHaveAttribute("aria-expanded", "true");
      const b = (await btn.boundingBox())!;
      // Wait for the open animation (a 4px slide) to finish, then check it sits 6px under the button.
      await expect.poll(async () => Math.abs((await dialog.boundingBox())!.y - (b.y + b.height + 6))).toBeLessThan(1);
      await dialog.getByRole("textbox", { name: "Width" }).focus();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(btn).toHaveAttribute("aria-expanded", "false");
      await expect(btn).toBeFocused();
      await btn.click();
      await expect(dialog).toBeVisible();
      await page.mouse.click(5, 5);
      await expect(dialog).toBeHidden();
    });

    test("toast: a button shows a toast that can be closed", async ({ page }) => {
      await ready(page, "toast");
      await page.locator(`[data-fixture="${side}-variants"]`).getByRole("button", { name: "Success" }).click();
      const t = page.locator(".vin-toaster .vin-toast").filter({ hasText: "Payment received" });
      await expect(t).toHaveCount(1);
      await expect(t).toHaveAttribute("role", "status");
      await expect(t).toContainText("We've emailed your receipt.");
      await t.getByRole("button", { name: "Close" }).click();
      await expect(t).toHaveCount(0);
      await page.locator(`[data-fixture="${side}-variants"]`).getByRole("button", { name: "Error" }).click();
      await expect(page.locator(".vin-toaster").getByRole("alert")).toContainText("Upload failed");
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
