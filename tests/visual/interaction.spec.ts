import { test, expect, type Page } from "@playwright/test";

/*
 * Behaviour of the interactive components, for both versions:
 * HTML (driven by vinui.js) and React (hydrated islands). Same keys, same results.
 */
const ready = async (page: Page, name: string) => {
  await page.clock.setFixedTime(new Date("2026-11-25T10:00:00"));
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

    test("dialog: opens on the first field, keeps Tab off the page behind, closes with Escape, Cancel, a click outside or submit", async ({ page }) => {
      await ready(page, "dialog");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const btn = root.getByRole("button", { name: "Edit profile" });
      const dialog = page.getByRole("dialog", { name: "Edit profile" });
      await expect(dialog).toBeHidden();
      await btn.click();
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("textbox", { name: "Name", exact: true })).toBeFocused();
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press("Tab");
        // Never the page behind (the browser may take focus to its own toolbar, which is fine).
        expect(await dialog.evaluate((d) => d.contains(document.activeElement) || document.activeElement === document.body)).toBe(true);
      }
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(btn).toBeFocused();

      await btn.click();
      await dialog.getByRole("button", { name: "Cancel" }).click();
      await expect(dialog).toBeHidden();
      await btn.click();
      await expect(dialog).toBeVisible();
      await page.mouse.click(5, 5);
      await expect(dialog).toBeHidden();
      await btn.click();
      await dialog.getByRole("button", { name: "Close" }).click();
      await expect(dialog).toBeHidden();
      await btn.click();
      await dialog.getByRole("button", { name: "Save changes" }).click();
      await expect(dialog).toBeHidden();
      await expect(btn).toBeFocused();
    });

    test("alert dialog: focus starts on Cancel, a click outside doesn't close it, the answer closes it", async ({ page }) => {
      await ready(page, "alert-dialog");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const btn = root.getByRole("button", { name: "Delete project" });
      const dialog = page.getByRole("alertdialog", { name: "Delete this project?" });
      await btn.click();
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
      await page.mouse.click(5, 5);
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(btn).toBeFocused();
      await btn.click();
      await dialog.getByRole("button", { name: "Delete project" }).click();
      await expect(dialog).toBeHidden();
      if (side === "html") expect(await page.evaluate(() => (document.getElementById("adlg-delete") as HTMLDialogElement).returnValue)).toBe("delete");
    });

    test("sheet: slides in against the edge and closes with Escape", async ({ page }) => {
      await ready(page, "sheet");
      for (const [example, name, edge] of [["basic", "Filters", "right"], ["left", "Menu", "left"], ["bottom", "Share", "bottom"]] as const) {
        const btn = page.locator(`[data-fixture="${side}-${example}"]`).getByRole("button", { name });
        const sheet = page.locator("dialog[open]");
        await btn.click();
        await expect(sheet).toBeVisible();
        const vp = page.viewportSize()!;
        await expect.poll(async () => {
          const r = (await sheet.boundingBox())!;
          return edge === "right" ? Math.round(r.x + r.width) - vp.width : edge === "left" ? Math.round(r.x) : Math.round(r.y + r.height) - vp.height;
        }).toBe(0);
        await page.keyboard.press("Escape");
        await expect(sheet).toHaveCount(0);
        await expect(btn).toBeFocused();
      }
    });

    test("dropdown menu: arrows, Home/End, type-ahead, Escape; Up Arrow opens on the last item", async ({ page }) => {
      await ready(page, "dropdown-menu");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const btn = root.getByRole("button", { name: "My account" });
      const menu = root.getByRole("menu", { name: "My account" });
      const item = (name: string) => menu.getByRole("menuitem", { name });
      await expect(btn).toHaveAttribute("aria-haspopup", "menu");
      await btn.click();
      await expect(menu).toBeVisible();
      await expect(btn).toHaveAttribute("aria-expanded", "true");
      await expect(item("Profile")).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(item("Billing")).toBeFocused();
      await page.keyboard.press("End");
      await expect(item("Sign out")).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(item("Profile")).toBeFocused();
      await page.keyboard.press("ArrowUp");
      await expect(item("Sign out")).toBeFocused();
      await page.keyboard.press("ArrowUp"); // skips the disabled item
      await expect(item("Invite people")).toBeFocused();
      await page.keyboard.press("Home");
      await page.keyboard.press("s");
      await expect(item("Settings")).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(btn).toHaveAttribute("aria-expanded", "false");
      await expect(btn).toBeFocused();

      await page.keyboard.press("ArrowUp");
      await expect(menu).toBeVisible();
      await expect(item("Sign out")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(menu).toBeHidden();
      await expect(btn).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(item("Profile")).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(menu).toBeHidden();
      await expect(btn).toBeFocused();
    });

    test("dropdown menu: checkbox and radio items change without closing", async ({ page }) => {
      await ready(page, "dropdown-menu");
      const root = page.locator(`[data-fixture="${side}-checkboxes"]`);
      const btn = root.getByRole("button", { name: "View" });
      const menu = root.getByRole("menu", { name: "View" });
      await btn.click();
      const toolbar = menu.getByRole("menuitemcheckbox", { name: "Toolbar" });
      await expect(toolbar).toBeFocused();
      await expect(toolbar).toHaveAttribute("aria-checked", "true");
      await page.keyboard.press("Space");
      await expect(toolbar).toHaveAttribute("aria-checked", "false");
      await expect(menu).toBeVisible();
      await page.keyboard.press("End");
      await page.keyboard.press("Enter");
      await expect(menu.getByRole("menuitemradio", { name: "Size" })).toHaveAttribute("aria-checked", "true");
      await expect(menu.getByRole("menuitemradio", { name: "Name" })).toHaveAttribute("aria-checked", "false");
      await menu.getByRole("menuitemradio", { name: "Date modified" }).click();
      await expect(menu.getByRole("menuitemradio", { name: "Date modified" })).toHaveAttribute("aria-checked", "true");
      await expect(menu).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
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

    test("combobox: typing filters, arrows move, Enter chooses, blur restores", async ({ page }) => {
      await ready(page, "combobox");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const input = root.getByRole("combobox", { name: "Framework" });
      const active = async () => page.locator(`#${await input.getAttribute("aria-activedescendant")}`);
      await input.click();
      await expect(input).toHaveAttribute("aria-expanded", "true");
      await input.press("Escape");
      await input.pressSequentially("ne");
      await expect(input).toHaveAttribute("aria-expanded", "true");
      const list = page.getByRole("listbox", { name: "Framework" }).filter({ visible: true });
      await expect(list.getByRole("option")).toHaveText(["Next.js"]);
      await input.fill("s");
      await expect(list.getByRole("option")).toHaveText(["Astro", "Next.js", "SolidStart", "SvelteKit"]);
      await expect(await active()).toHaveText("Astro");
      await input.press("ArrowDown");
      await expect(await active()).toHaveText("Next.js");
      await input.press("End");
      await input.press("ArrowDown");
      await input.press("ArrowDown");
      await input.press("Enter");
      await expect(input).toHaveAttribute("aria-expanded", "false");
      await expect(input).toHaveValue("SvelteKit");
      await expect(root.locator('input[type="hidden"]')).toHaveValue("sveltekit");
      // Nothing matches: a status message.
      await input.fill("zzz");
      await expect(page.locator(".vin-combobox__empty").filter({ visible: true })).toHaveText("No results.");
      // Leaving restores the chosen option's text.
      await input.press("Tab");
      await expect(input).toHaveValue("SvelteKit");
      // Escape on a closed field clears it.
      await input.focus();
      await input.press("Escape");
      await expect(input).toHaveValue("");
      // Disabled options can't be chosen; groups hide when empty.
      const tz = page.locator(`[data-fixture="${side}-groups"]`).getByRole("combobox", { name: "Time zone" });
      await expect(tz).toHaveValue("London");
      await tz.fill("pa");
      const tzList = page.getByRole("listbox", { name: "Time zone" }).filter({ visible: true });
      await expect(tzList.getByRole("option")).toHaveText(["Paris", "São Paulo"]);
      await expect(tzList.getByRole("group")).toHaveCount(2);
      await tzList.getByRole("option", { name: "São Paulo" }).click();
      await expect(tz).toHaveValue("São Paulo");
      await expect(tz).toBeFocused();
    });

    test("calendar: arrows, Home/End, PageDown change the day and month; Enter chooses", async ({ page }) => {
      await ready(page, "calendar");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const grid = root.getByRole("grid");
      await expect(grid).toHaveAccessibleName("November 2026");
      const chosen = root.getByRole("button", { name: "Saturday, November 14, 2026" });
      await expect(chosen).toHaveAttribute("tabindex", "0");
      await expect(root.getByRole("button", { name: "Wednesday, November 25, 2026" })).toHaveAttribute("aria-current", "date");
      await chosen.focus();
      await page.keyboard.press("ArrowRight");
      await expect(root.getByRole("button", { name: "Sunday, November 15, 2026" })).toBeFocused();
      await page.keyboard.press("Home");
      await expect(root.getByRole("button", { name: "Monday, November 9, 2026" })).toBeFocused();
      await page.keyboard.press("End");
      await expect(root.getByRole("button", { name: "Sunday, November 15, 2026" })).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await expect(root.locator(".vin-calendar__title")).toHaveText("December 2026");
      await expect(root.getByRole("button", { name: "Sunday, December 6, 2026" })).toBeFocused();
      await page.keyboard.press("PageUp");
      await expect(root.locator(".vin-calendar__title")).toHaveText("November 2026");
      await expect(root.getByRole("button", { name: "Friday, November 6, 2026" })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(root.locator('td[aria-selected="true"]')).toHaveCount(1);
      await expect(root.locator('td[aria-selected="true"] button')).toHaveAccessibleName("Friday, November 6, 2026");
      await root.getByRole("button", { name: "Next month" }).click();
      await expect(root.locator(".vin-calendar__title")).toHaveText("December 2026");
    });

    test("calendar: a range takes two clicks; limits can't be chosen", async ({ page }) => {
      await ready(page, "calendar");
      const range = page.locator(`[data-fixture="${side}-range"]`);
      await expect(range.locator('td[aria-selected="true"]')).toHaveCount(7);
      await range.getByRole("button", { name: "Tuesday, November 17, 2026" }).click();
      await expect(range.locator('td[aria-selected="true"]')).toHaveCount(1);
      await range.getByRole("button", { name: "Friday, November 20, 2026" }).click();
      await expect(range.locator('td[aria-selected="true"]')).toHaveCount(4);
      await expect(range.locator('td[data-range="start"] button')).toHaveText("17");
      await expect(range.locator('td[data-range="end"] button')).toHaveText("20");
      const limits = page.locator(`[data-fixture="${side}-limits"]`);
      await expect(limits.locator("th").first()).toHaveText("Sun");
      const weekend = limits.getByRole("button", { name: "Saturday, November 21, 2026" });
      await expect(weekend).toHaveAttribute("aria-disabled", "true");
      await weekend.click({ force: true });
      await expect(limits.locator('td[aria-selected="true"] button')).toHaveText("18");
    });

    test("date picker: opens on the chosen day, choosing closes and updates the field", async ({ page }) => {
      await ready(page, "date-picker");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const trigger = root.locator(".vin-date-picker__trigger");
      await expect(trigger).toHaveAccessibleName("Due date Nov 14, 2026");
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: "Choose due date" }).filter({ visible: true });
      await expect(dialog).toBeVisible();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(dialog.getByRole("button", { name: "Saturday, November 14, 2026" })).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Enter");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAccessibleName("Due date Nov 15, 2026");
      await expect(root.locator('input[type="hidden"]')).toHaveValue("2026-11-15");
      // Escape closes without changing it.
      await trigger.click();
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(root.locator('input[type="hidden"]')).toHaveValue("2026-11-15");
      // A range updates the field when both ends are chosen.
      const trip = page.locator(`[data-fixture="${side}-range"]`);
      await trip.getByRole("button", { name: /Trip dates/ }).click();
      const tripDialog = page.getByRole("dialog", { name: "Choose trip dates" }).filter({ visible: true });
      await tripDialog.getByRole("button", { name: "Monday, November 2, 2026" }).click();
      await expect(tripDialog).toBeVisible();
      await tripDialog.getByRole("button", { name: "Thursday, November 5, 2026" }).click();
      await expect(tripDialog).toBeHidden();
      await expect(trip.locator(".vin-date-picker__value")).toHaveText("Nov 2 – Nov 5, 2026");
      await expect(trip.locator('input[type="hidden"]')).toHaveValue("2026-11-02/2026-11-05");
    });

    test("drawer: opens from the bottom, Escape closes and returns focus", async ({ page }) => {
      await ready(page, "drawer");
      const btn = page.locator(`[data-fixture="${side}-basic"]`).getByRole("button", { name: "Set daily goal" });
      const drawer = page.locator("dialog[open]");
      await btn.click();
      await expect(drawer).toBeVisible();
      await expect(drawer).toHaveAccessibleName("Daily goal");
      const vp = page.viewportSize()!;
      await expect.poll(async () => { const r = (await drawer.boundingBox())!; return Math.round(r.y + r.height) - vp.height; }).toBe(0);
      await page.keyboard.press("Escape");
      await expect(drawer).toHaveCount(0);
      await expect(btn).toBeFocused();
    });

    test("hover card: hover and focus show it, leaving hides it", async ({ page }) => {
      await ready(page, "hover-card");
      const link = page.locator(`[data-fixture="${side}-basic"]`).getByRole("link", { name: "@ada" });
      const card = page.locator(".vin-hover-card:popover-open");
      await link.hover();
      await expect(card).toBeVisible();
      await expect(card).toContainText("Ada Lovelace");
      await page.mouse.move(2, 2);
      await expect(card).toHaveCount(0);
      await link.focus();
      await expect(card).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(card).toHaveCount(0);
    });

    test("context menu: right-click and Shift+F10 open it; arrows move; Escape closes", async ({ page }) => {
      await ready(page, "context-menu");
      const area = page.locator(`[data-fixture="${side}-basic"] .vin-context-menu`);
      const menu = page.getByRole("menu", { name: "File actions" }).filter({ visible: true });
      await area.click({ button: "right", position: { x: 40, y: 20 } });
      await expect(menu).toBeVisible();
      await expect(menu.getByRole("menuitem", { name: "Rename" })).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(menu.getByRole("menuitem", { name: "Duplicate" })).toBeFocused();
      await page.keyboard.press("End");
      await expect(menu.getByRole("menuitem", { name: "Delete" })).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
      await expect(area).toBeFocused();
      await page.keyboard.press("Shift+F10");
      await expect(menu).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(menu).toHaveCount(0);
    });

    test("command: typing filters by label and keywords, arrows skip disabled, Enter chooses", async ({ page }) => {
      await ready(page, "command");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const input = root.getByRole("combobox", { name: "Search commands" });
      const active = async () => page.locator(`#${await input.getAttribute("aria-activedescendant")}`);
      await input.focus();
      await expect(await active()).toHaveText("Calendar");
      await page.keyboard.press("ArrowDown");
      await expect(await active()).toHaveText("Search emoji");
      await page.keyboard.press("ArrowDown");
      await expect(await active()).toHaveText(/^Profile/);
      await input.fill("invoice");
      await expect(root.getByRole("option").filter({ visible: true })).toHaveText([/^Billing/]);
      await input.fill("zzz");
      await expect(root.getByRole("option").filter({ visible: true })).toHaveCount(0);
      await expect(root.locator(".vin-command__empty")).toBeVisible();
      await input.fill("set");
      await expect(await active()).toHaveText(/^Settings/);
      await page.keyboard.press("Enter");
      await expect(root.getByRole("option", { name: /Settings/ })).toHaveAttribute("aria-selected", "true");
    });

    test("command dialog: ⌘K opens it on the search, Escape closes", async ({ page }) => {
      await ready(page, "command");
      const dialog = page.getByRole("dialog", { name: "Search docs" });
      await page.keyboard.press("Meta+k");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("combobox", { name: "Search commands" })).toBeFocused();
      await page.keyboard.type("dark");
      await expect(dialog.getByRole("option").filter({ visible: true })).toHaveText(["Dark mode"]);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      const btn = page.locator(`[data-fixture="${side}-dialog"]`).getByRole("button", { name: /Search docs/ });
      await btn.click();
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("option").filter({ visible: true })).toHaveCount(5);
      await page.keyboard.press("Escape");
      await expect(btn).toBeFocused();
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
