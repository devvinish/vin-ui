import { test, expect, devices } from "@playwright/test";
import { STYLE_IDS } from "@vinui/styles";

/*
 * iPhone Safari zooms the page in when a text field under 16px gets focus. On touch screens every
 * VinUI field must be at least 16px, in every style; on desktop the fields keep their own sizes.
 */
const PAGES = ["input", "textarea", "native-select", "combobox", "command", "input-otp", "input-group", "data-table", "questionnaire"];
const FIELDS = "main .preview :is(input:not([type=checkbox],[type=radio],[type=range],[type=color],[type=hidden],[type=file]), textarea, select)";

const sizes = (page: import("@playwright/test").Page) =>
  page.evaluate((sel) => [...document.querySelectorAll<HTMLElement>(sel)].map((e) => ({ field: e.className || e.tagName, px: parseFloat(getComputedStyle(e).fontSize) })), FIELDS);

test.describe("touch screens", () => {
  const { viewport, deviceScaleFactor, isMobile, hasTouch, userAgent } = devices["iPhone 13"];
  test.use({ viewport, deviceScaleFactor, isMobile, hasTouch, userAgent });
  for (const slug of PAGES) {
    test(`fields are at least 16px · ${slug}`, async ({ page }) => {
      await page.goto(`/ui/components/${slug}/`);
      for (const style of STYLE_IDS) {
        await page.evaluate((s) => document.documentElement.setAttribute("data-vin-style", s), style);
        const found = await sizes(page);
        expect(found.length, `${slug}: no fields found`).toBeGreaterThan(0);
        const small = found.filter((f) => f.px < 16);
        expect(small, `${slug} · ${style}: fields under 16px`).toEqual([]);
      }
    });
  }
});

test("desktop keeps the fields' own sizes", async ({ page }) => {
  await page.goto("/ui/components/input/");
  const px = (await sizes(page)).map((f) => f.px);
  expect(Math.min(...px)).toBeLessThan(16);
});
