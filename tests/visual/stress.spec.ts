import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { STYLE_IDS } from "@vinui/styles";

/*
 * Stress form: a long form in a card with errors, disabled fields and hints (/ui/fixtures/stress/),
 * in all 8 styles × light/dark. Checks what a real form needs, then screenshots it with the
 * keyboard focus on a field:
 *   - fields stand out from the card (a visible border, a different fill or an inset look),
 *   - keyboard focus shows a ring with at least 3:1 contrast against the card, on fields and buttons,
 *   - error fields are marked by more than the message (a danger-coloured border or ring),
 *   - buttons, labels, fields and hints use the style's text font (display fonts are for titles),
 *   - axe (WCAG 2.2 AA) passes.
 */

/** Runs in the page: colour helpers that work for any CSS colour (color-mix, color(), rgb…). */
const metrics = (page: Page) =>
  page.evaluate(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const cx = cv.getContext("2d", { willReadFrequently: true })!;
    type C = [number, number, number];
    const rgba = (c: string): [number, number, number, number] => {
      cx.clearRect(0, 0, 1, 1);
      cx.fillStyle = "#000";
      cx.fillStyle = c;
      cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const over = (c: string, bg: C): C => { const t = rgba(c); return [0, 1, 2].map((i) => t[i] * t[3] + bg[i] * (1 - t[3])) as C; };
    const lum = (c: C) => { const f = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
    const ratio = (a: C, b: C) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100; };
    const colors = (shadow: string) => shadow === "none" ? [] : shadow.match(/(rgba?\([^)]*\)|color\([^)]*\)|#[0-9a-f]{3,8}\b)/gi) ?? [];
    const cs = (e: Element) => getComputedStyle(e);

    const stage = over(cs(document.body).backgroundColor, [255, 255, 255]);
    const card = document.querySelector("[data-stress-card]")!;
    const cardBg = over(cs(card).backgroundColor, stage);

    /** How much a field stands out from the card: fill contrast, best border side, inset shadow. */
    const standOut = (el: Element) => {
      const s = cs(el);
      const fill = ratio(over(s.backgroundColor, cardBg), cardBg);
      const border = Math.max(0, ...(["Top", "Right", "Bottom", "Left"] as const).map((side) =>
        parseFloat(s.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0 && s.getPropertyValue(`border-${side.toLowerCase()}-style`) !== "none"
          ? ratio(over(s.getPropertyValue(`border-${side.toLowerCase()}-color`), cardBg), cardBg) : 0));
      const inset = /inset/.test(s.boxShadow);
      // An inset line (Tonal's filled field has an accent underline) counts like a border.
      const line = Math.max(0, ...s.boxShadow.split(/,(?![^(]*\))/).filter((p) => /inset/.test(p)).flatMap(colors).map((c) => ratio(over(c, cardBg), cardBg)));
      return { fill, border: Math.max(border, line), inset };
    };

    const field = document.querySelector<HTMLElement>("#s-last")!;
    const invalid = document.querySelector<HTMLElement>("#s-email")!;
    const invalidS = cs(invalid);
    const errorMark = Math.max(
      ...colors(invalidS.boxShadow).map((c) => ratio(over(c, cardBg), cardBg)),
      parseFloat(invalidS.borderBottomWidth) > 0 ? ratio(over(invalidS.borderBottomColor, cardBg), cardBg) : 0,
    );
    const textFont = cs(document.documentElement).getPropertyValue("--vin-font").split(",")[0].trim().replace(/"/g, "");
    const fonts = Object.fromEntries(
      [".vin-btn", ".vin-label", ".vin-input", ".vin-hint", ".vin-error", ".vin-choice__label"].map((sel) => [sel, cs(document.querySelector(sel)!).fontFamily.split(",")[0].trim().replace(/"/g, "")]),
    );
    return { standOut: standOut(field), errorMark, textFont, fonts };
  });

/** Keyboard-focus an element (so :focus-visible applies) and measure its ring. */
const focusRing = async (page: Page, selector: string) => {
  const before = await page.locator(selector).evaluate((e) => getComputedStyle(e).boxShadow);
  await page.keyboard.press("Shift"); // last input was the keyboard, so focus() shows the visible ring
  await page.locator(selector).evaluate((e) => (e as HTMLElement).focus());
  await page.waitForTimeout(350); // let the ring transition finish
  return page.locator(selector).evaluate((el, before) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const cx = cv.getContext("2d", { willReadFrequently: true })!;
    type C = [number, number, number];
    const rgba = (c: string) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = "#000"; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
    const over = (c: string, bg: C): C => { const t = rgba(c); return [0, 1, 2].map((i) => t[i] * t[3] + bg[i] * (1 - t[3])) as C; };
    const lum = (c: C) => { const f = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
    const ratio = (a: C, b: C) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100; };
    const colors = (shadow: string) => shadow === "none" ? [] : shadow.match(/(rgba?\([^)]*\)|color\([^)]*\)|#[0-9a-f]{3,8}\b)/gi) ?? [];
    const stage = over(getComputedStyle(document.body).backgroundColor, [255, 255, 255]);
    const cardBg = over(getComputedStyle(document.querySelector("[data-stress-card]")!).backgroundColor, stage);
    const s = getComputedStyle(el);
    // The ring is the strongest colour in the focused shadow (or the outline); focus must change the look.
    const ring = s.boxShadow !== before ? colors(s.boxShadow) : [];
    const out = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0 ? [s.outlineColor] : [];
    return { focused: document.activeElement === el, contrast: Math.max(0, ...[...ring, ...out].map((c) => ratio(over(c, cardBg), cardBg))) };
  }, before);
};

for (const style of STYLE_IDS) {
  for (const mode of ["light", "dark"] as const) {
    test(`stress form · ${style} · ${mode}`, async ({ page }) => {
      await page.goto(`/ui/fixtures/stress/?style=${style}&mode=${mode}`);
      await page.evaluate(() => document.fonts.ready);

      const m = await metrics(page);
      const { fill, border, inset } = m.standOut;
      expect(border >= 1.5 || fill >= 1.1 || (inset && fill >= 1.05), `fields should stand out from the card (fill ${fill}, border ${border}, inset ${inset})`).toBe(true);
      expect(m.errorMark, "an error field needs a visible danger border or ring").toBeGreaterThanOrEqual(3);
      for (const [sel, font] of Object.entries(m.fonts)) expect(font, `${sel} should use the text font`).toBe(m.textFont);

      for (const sel of ["[data-stress-button]", ".vin-btn--outline", "#s-last", "#s-email"]) {
        const r = await focusRing(page, sel);
        expect(r.focused, `${sel} should take focus`).toBe(true);
        expect(r.contrast, `${sel}: focus ring contrast against the card`).toBeGreaterThanOrEqual(3);
      }

      const results = await new AxeBuilder({ page }).include("#fixture").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);

      await page.locator("#s-first").evaluate((e) => (e as HTMLElement).focus());
      await page.waitForTimeout(350);
      await expect(page.locator("#fixture")).toHaveScreenshot(`stress-${style}-${mode}.png`);
    });
  }
}

/* Terminal keeps dashed cards but fields get solid borders, so a field never reads as a card. */
test("terminal: solid field borders, dashed cards", async ({ page }) => {
  await page.goto("/ui/fixtures/stress/?style=terminal&mode=light");
  const style = (sel: string) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).borderTopStyle);
  expect(await style(".vin-card")).toBe("dashed");
  for (const sel of ["#s-last", "#s-bio", "#s-country", ".vin-input-group"]) expect(await style(sel), sel).toBe("solid");
});

/* Paper: handwriting for headings and titles only. */
test("paper: Kalam on titles, Inter on buttons", async ({ page }) => {
  await page.goto("/ui/fixtures/stress/?style=paper&mode=light");
  await page.evaluate(() => document.fonts.ready);
  const font = (sel: string) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).fontFamily);
  expect(await font(".vin-card__title")).toMatch(/^"?Kalam/);
  expect(await font(".vin-btn")).toMatch(/^"?Inter/);
});
