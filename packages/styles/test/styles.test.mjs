import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { STYLES, COMPONENTS } from "../src/styles.mjs";
import { validateStyles, buildCss, tintValue, parseHex } from "../src/generate.mjs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const base = read("../src/base.css");
const components = Object.fromEntries(COMPONENTS.map((c) => [c, read(`../src/components/${c}.css`)]));

test("there are exactly 8 styles and they are all valid", () => {
  assert.equal(STYLES.length, 8);
  assert.deepEqual(validateStyles(), []);
});

test("validation catches a missing token and a missing tweak", () => {
  const broken = structuredClone(STYLES[0]);
  delete broken.light.fg;
  delete broken.tweaks.button;
  const errors = validateStyles([broken]);
  assert.ok(errors.some((e) => e.includes('missing token "fg"')));
  assert.ok(errors.some((e) => e.includes("missing tweaks.button")));
});

test("the full stylesheet has light, dark, system-dark and grey blocks for every style", () => {
  const css = buildCss({ base, components });
  for (const s of STYLES) {
    assert.ok(css.includes(`[data-vin-style="${s.id}"] {`), `${s.id} light`);
    assert.ok(css.includes(`[data-vin-mode="dark"] [data-vin-style="${s.id}"]`), `${s.id} dark`);
    assert.ok(css.includes(`[data-vin-style="${s.id}"]:not([data-vin-mode="light"])`), `${s.id} system dark`);
    assert.ok(css.includes(`[data-vin-style="${s.id}"][data-vin-gray="slate"]`), `${s.id} slate`);
    assert.ok(css.includes(`[data-vin-style="${s.id}"][data-vin-gray="stone"]`), `${s.id} stone`);
  }
  assert.ok(!css.includes("&"), "tweak placeholders must all be replaced");
});

/* Every component has a spec and a stylesheet, and every class in the spec is styled. */
const specDir = new URL("../../../spec/", import.meta.url);
const specs = readdirSync(specDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(new URL(f, specDir), "utf8")));

test("COMPONENTS matches the spec folder", () => {
  assert.deepEqual([...COMPONENTS].sort(), specs.map((s) => s.name).sort());
});

for (const spec of specs) {
  test(`${spec.name}: every class in spec/${spec.name}.json exists in ${spec.name}.css`, () => {
    const css = components[spec.name];
    for (const cls of spec.classes) assert.ok(new RegExp(`\\.${cls}(?![\\w-])`).test(css), `missing .${cls}`);
  });
}

test("tintValue shifts hex and rgb colours but leaves other text alone", () => {
  assert.equal(tintValue("#ffffff", "#000000", 50), "#808080");
  assert.equal(tintValue("rgb(255 255 255 / .5)", "#000000", 50), "rgb(128 128 128 / .5)");
  assert.equal(tintValue("var(--x)", "#000000", 50), "var(--x)");
});

/* ---------- contrast: text tokens must be readable on their surfaces ---------- */
const lum = (hex) => {
  const c = parseHex(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const firstHex = (v) => (v.match(/#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/i) || [])[0];
const isPlainHex = (v) => /^#(?:[0-9a-f]{6}|[0-9a-f]{3})$/i.test(v.trim());

for (const s of STYLES) {
  for (const mode of ["light", "dark"]) {
    const t = { ...s.light, ...(mode === "dark" ? s.dark : {}) };
    test(`${s.id} ${mode}: text meets WCAG AA (4.5:1) on its surfaces`, () => {
      for (const fgKey of ["fg", "muted"]) {
        if (!isPlainHex(t[fgKey])) continue;
        for (const bgKey of ["surface", "stage"]) {
          const bg = firstHex(t[bgKey]);
          if (!bg || t[bgKey].includes("color-mix")) continue;
          const r = ratio(t[fgKey], bg);
          assert.ok(r >= 4.5, `${fgKey} ${t[fgKey]} on ${bgKey} ${bg} is ${r.toFixed(2)}:1`);
        }
      }
    });
  }
}

/* Danger buttons: their label (danger-fg, white by default) must read at 4.5:1. Found by the axe run. */
for (const s of STYLES) {
  for (const mode of ["light", "dark"]) {
    const t = { ...s.light, ...(mode === "dark" ? s.dark : {}) };
    test(`${s.id} ${mode}: danger button text meets WCAG AA`, () => {
      if (!isPlainHex(t.danger)) return;
      const fg = t["danger-fg"] ?? "#ffffff";
      const r = ratio(fg, t.danger);
      assert.ok(r >= 4.5, `danger-fg ${fg} on danger ${t.danger} is ${r.toFixed(2)}:1`);
    });
  }
}
