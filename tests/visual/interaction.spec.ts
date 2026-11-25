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

/* Data display: Code Block, Carousel, Chart, Data Table. */
for (const side of ["html", "react"] as const) {
  test.describe(`${side} · data display`, () => {
    test("code block: copy puts the code on the clipboard and says Copied", async ({ page, context }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await ready(page, "code-block");
      const root = page.locator(`[data-fixture="${side}-lines"]`);
      const btn = root.getByRole("button", { name: "Copy code" });
      await btn.click();
      await expect(root.getByRole("status")).toHaveText("Copied");
      await expect(btn).toHaveAttribute("data-copied", "");
      const text = await page.evaluate(() => navigator.clipboard.readText());
      expect(text.split("\n")).toHaveLength(6);
      expect(text).toContain('import { Button } from "@/components/vin/button";');
      expect(text).toContain("return <Button disabled={saving}");
      expect(text).not.toMatch(/^\d/m); // line numbers are not copied
      await expect(root.getByRole("status")).toHaveText("", { timeout: 4000 });
    });

    test("carousel: next, previous, dots and arrow keys move one slide; the ends are aria-disabled", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await ready(page, "carousel");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const carousel = root.getByRole("region", { name: "Getting started" });
      const prev = root.getByRole("button", { name: "Previous slide" });
      const next = root.getByRole("button", { name: "Next slide" });
      const dot = (n: number) => root.getByRole("button", { name: `Slide ${n}`, exact: true });
      const slide = (n: number) => root.locator(`.vin-carousel__slide[aria-label="${n} of 4"]`);
      await expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
      await expect(dot(1)).toHaveAttribute("aria-current", "true");
      await expect(prev).toHaveAttribute("aria-disabled", "true");
      await expect(slide(2)).toHaveJSProperty("inert", true);

      await next.click();
      await expect(dot(2)).toHaveAttribute("aria-current", "true");
      await expect(slide(2)).toHaveJSProperty("inert", false);
      await expect(slide(1)).toHaveJSProperty("inert", true);
      await expect(prev).not.toHaveAttribute("aria-disabled");

      await next.focus();
      await page.keyboard.press("ArrowRight");
      await expect(dot(3)).toHaveAttribute("aria-current", "true");
      await page.keyboard.press("ArrowRight");
      await expect(dot(4)).toHaveAttribute("aria-current", "true");
      await expect(next).toHaveAttribute("aria-disabled", "true");
      await expect(next).toBeFocused(); // focus isn't lost at the end
      await page.keyboard.press("ArrowLeft");
      await expect(dot(3)).toHaveAttribute("aria-current", "true");

      await dot(1).click();
      await expect(dot(1)).toHaveAttribute("aria-current", "true");
      await expect(prev).toHaveAttribute("aria-disabled", "true");

      // The track itself is a scroller: scrolling it (a swipe) updates the dots too.
      await root.locator(".vin-carousel__track").evaluate((t) => t.scrollTo({ left: t.scrollWidth, behavior: "instant" }));
      await expect(dot(4)).toHaveAttribute("aria-current", "true");
    });

    test("chart: focus and arrow keys show a tooltip per category; hover follows the pointer; Escape hides it", async ({ page }) => {
      await ready(page, "chart");
      const root = page.locator(`[data-fixture="${side}-bar"]`);
      const svg = root.getByRole("img", { name: "Visitors by month, January to June (bar chart)" });
      const tip = root.locator(".vin-chart__tooltip");
      await expect(root.getByRole("table", { name: "Visitors by month, January to June" })).toHaveCount(1);
      await expect(tip).toHaveCount(0);

      await svg.focus();
      await expect(tip).toContainText("Jan");
      await expect(tip.locator(".vin-chart__tooltip-row").first()).toContainText("Desktop186");
      await expect(root.locator('.vin-chart__bar[data-i="0"][data-active]')).toHaveCount(2);
      await page.keyboard.press("ArrowRight");
      await expect(tip).toContainText("Feb");
      await expect(tip.locator(".vin-chart__tooltip-row").nth(1)).toContainText("Mobile200");
      await page.keyboard.press("End");
      await expect(tip).toContainText("Jun");
      await page.keyboard.press("Escape");
      await expect(tip).toHaveCount(0);

      await root.locator('.vin-chart__hit[data-i="3"]').hover();
      await expect(tip).toContainText("Apr");
      await expect(root.locator('.vin-chart__hit[data-i="3"]')).toHaveAttribute("data-active", "");
      await page.mouse.move(5, 5);
      await expect(tip).toHaveCount(0);
    });

    test("data table: sorts with aria-sort, filters, pages and selects rows", async ({ page }) => {
      await ready(page, "data-table");
      const root = page.locator(`[data-fixture="${side}-basic"]`);
      const visible = root.locator("tbody tr:not([hidden])");
      const firstCells = () => visible.locator("td:nth-child(2)").allTextContents();
      const status = root.locator(".vin-data-table__status");
      const pageText = root.locator(".vin-pagination__status");
      const prev = root.getByRole("button", { name: "Previous" });
      const next = root.getByRole("button", { name: "Next" });

      // Paging: five rows at a time.
      await expect(visible).toHaveCount(5);
      await expect(pageText).toHaveText("Page 1 of 3");
      await expect(prev).toBeDisabled();
      await next.click();
      await expect(pageText).toHaveText("Page 2 of 3");
      expect(await firstCells()).toEqual(["INV-1037", "INV-1036", "INV-1035", "INV-1034", "INV-1033"]);
      await next.click();
      await expect(visible).toHaveCount(2);
      await expect(next).toBeDisabled();

      // Sorting: numbers sort as numbers; a second click reverses; only one column has aria-sort.
      const amount = root.getByRole("columnheader", { name: "Amount" });
      await amount.getByRole("button").click();
      await expect(amount).toHaveAttribute("aria-sort", "ascending");
      await prev.click(); await prev.click();
      await expect(visible.first().locator("td").last()).toHaveText("₹2,350");
      await amount.getByRole("button").click();
      await expect(amount).toHaveAttribute("aria-sort", "descending");
      await expect(visible.first().locator("td").last()).toHaveText("₹18,200");
      await root.getByRole("columnheader", { name: "Customer" }).getByRole("button").click();
      await expect(amount).not.toHaveAttribute("aria-sort");
      expect(await firstCells()).toEqual(["INV-1042", "INV-1041", "INV-1040", "INV-1039", "INV-1038"]);

      // Filtering: back to page 1, and an empty state when nothing matches.
      const filter = root.getByRole("searchbox", { name: "Filter invoices" });
      await filter.fill("overdue");
      await expect(visible).toHaveCount(2);
      await expect(pageText).toHaveText("Page 1 of 1");
      await filter.fill("zzz");
      await expect(root.locator(".vin-data-table__empty")).toHaveText("No results.");
      await filter.fill("pending");
      await expect(visible).toHaveCount(3);

      // Selection: the header box selects what matches the filter and shows "mixed" for some.
      const all = root.getByRole("checkbox", { name: "Select all rows" });
      await all.check();
      await expect(status).toHaveText("3 of 12 selected");
      await filter.fill("");
      await expect(all).toHaveJSProperty("indeterminate", true);
      await root.getByRole("checkbox", { name: "Select INV-1041" }).uncheck();
      await expect(status).toHaveText("2 of 12 selected");
      await expect(root.locator("tbody tr[data-selected]")).toHaveCount(2);
      await all.click();
      await expect(status).toHaveText("12 of 12 selected");
      await expect(all).toBeChecked();
      await all.click();
      await expect(status).toHaveText("0 of 12 selected");
    });

    test("data table: starts sorted and mixed where the markup says so", async ({ page }) => {
      await ready(page, "data-table");
      const sorting = page.locator(`[data-fixture="${side}-sorting"]`);
      const commits = sorting.getByRole("columnheader", { name: "Commits" });
      await expect(commits).toHaveAttribute("aria-sort", "descending");
      await commits.getByRole("button").click();
      await expect(commits).toHaveAttribute("aria-sort", "ascending");
      await expect(sorting.locator("tbody tr").first().locator("td").first()).toHaveText("Ravi Menon");
      const joined = sorting.getByRole("columnheader", { name: "Joined" });
      await joined.getByRole("button").click();
      await expect(sorting.locator("tbody tr").first().locator("td").first()).toHaveText("Tom Okafor");

      const selection = page.locator(`[data-fixture="${side}-selection"]`);
      await expect(selection.getByRole("checkbox", { name: "Select all rows" })).toHaveJSProperty("indeterminate", true);
      await expect(selection.locator(".vin-data-table__status")).toHaveText("2 of 4 selected");
    });
  });
}
