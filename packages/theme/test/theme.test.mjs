import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_THEME, normalizeTheme, diffFromDefault, themeToAttributes, applyTheme,
  serializeTheme, parseTheme, themeToQuery, themeFromQuery, themeToCli, themeToHtml,
  textOn, inkFor, contrast, normalizeHex, ACCENTS, OPTIONS,
} from "../src/index.mjs";

test("normalizeTheme fills defaults and drops invalid values", () => {
  assert.deepEqual(normalizeTheme(), { ...DEFAULT_THEME });
  const t = normalizeTheme({ style: "clay", accent: "0D9", radius: "huge", mode: "dark" });
  assert.equal(t.style, "clay");
  assert.equal(t.accent, "#00dd99");
  assert.equal(t.radius, "default");
  assert.equal(t.mode, "dark");
});

test("custom font without a family falls back to default; family is sanitised", () => {
  assert.equal(normalizeTheme({ font: "custom" }).font, "default");
  const t = normalizeTheme({ font: "custom", fontFamily: 'Poppins;}<script>' });
  assert.equal(t.font, "custom");
  assert.equal(t.fontFamily, "Poppinsscript");
});

test("themeToAttributes only sets attributes that differ from the style default", () => {
  const { attrs, vars } = themeToAttributes({ style: "tactile", radius: "lg", accent: "#0d9488" });
  assert.equal(attrs["data-vin-style"], "tactile");
  assert.equal(attrs["data-vin-radius"], "lg");
  assert.equal(attrs["data-vin-mode"], null);
  assert.equal(attrs["data-vin-gray"], null);
  assert.equal(vars["--vin-accent"], "#0d9488");
  assert.equal(vars["--vin-accent-fg"], "#111111", "teal: dark text reads better (5.3:1 vs 3.7:1)");
  assert.equal(themeToAttributes({ accent: "#5b5bd6" }).vars["--vin-accent-fg"], "#ffffff");
});

test("applyTheme sets and removes attributes on an element", () => {
  const attrs = new Map([["data-vin-radius", "sm"]]);
  const props = new Map();
  const el = {
    setAttribute: (k, v) => attrs.set(k, v),
    removeAttribute: (k) => attrs.delete(k),
    style: { setProperty: (k, v) => props.set(k, v), removeProperty: (k) => props.delete(k) },
  };
  applyTheme(el, { style: "bento", mode: "dark" });
  assert.equal(attrs.get("data-vin-style"), "bento");
  assert.equal(attrs.get("data-vin-mode"), "dark");
  assert.equal(attrs.has("data-vin-radius"), false, "old radius removed");
  assert.equal(props.get("--vin-accent"), DEFAULT_THEME.accent);
});

test("export → import round-trips every option", () => {
  const theme = { style: "terminal", accent: "#e11d48", mode: "dark", radius: "none", gray: "stone", font: "mono", density: "compact", motion: "reduced" };
  const file = serializeTheme(theme, "Hacker");
  const json = JSON.parse(file);
  assert.equal(json.vinTheme, 1);
  assert.equal(json.name, "Hacker");
  const { theme: back, name, warnings } = parseTheme(file);
  assert.equal(name, "Hacker");
  assert.deepEqual(warnings, []);
  assert.deepEqual(back, normalizeTheme(theme));
});

test("import gives clear errors and warnings", () => {
  assert.throws(() => parseTheme("not json"), /not valid JSON/);
  assert.throws(() => parseTheme('{"style":"clay"}'), /missing "vinTheme"/);
  assert.throws(() => parseTheme('{"vinTheme":99}'), /newer VinUI/);
  const { theme, warnings } = parseTheme('{"vinTheme":1,"style":"glass","accent":"blue"}');
  assert.equal(theme.style, DEFAULT_THEME.style);
  assert.equal(warnings.length, 2);
});

test("share links carry only non-default settings and never the light/dark mode", () => {
  assert.equal(themeToQuery({}), "");
  const q = themeToQuery({ style: "tactile", accent: "#0d9488", mode: "dark", radius: "lg" });
  assert.equal(q, "?style=tactile&accent=0d9488&radius=lg");
  assert.deepEqual(themeFromQuery(q), { style: "tactile", accent: "#0d9488", radius: "lg" });
  assert.deepEqual(themeFromQuery("?style=nope&utm_source=x"), {});
});

test("copy targets", () => {
  assert.equal(themeToCli({ style: "clay", accent: "#d97706", radius: "full" }), 'npx @vinish/ui init --style clay --accent "#d97706" --radius full');
  assert.match(themeToHtml({ style: "paper", mode: "dark" }), /^<html data-vin-style="paper" data-vin-mode="dark" style='--vin-accent: #5b5bd6'>$/);
});

test("text on every preset accent is readable (WCAG AA for large/bold UI text, 3:1+)", () => {
  for (const { name, hex } of ACCENTS) {
    assert.ok(contrast(hex, textOn(hex)) >= 3, `${name}: ${contrast(hex, textOn(hex)).toFixed(2)}`);
  }
  assert.equal(textOn("#ffd60a"), "#111111", "yellow gets dark text");
});

test("inkFor makes light accents readable as text on white and dark surfaces", () => {
  for (const surface of ["#ffffff", "#111113"]) {
    for (const hex of ["#ffd60a", "#65a30d", "#5b5bd6", "#1e1b4b"]) {
      assert.ok(contrast(inkFor(hex, surface), surface) >= 4.5, `${hex} on ${surface}`);
    }
  }
  assert.equal(inkFor("#1e1b4b", "#ffffff"), "#1e1b4b", "already dark enough: unchanged");
});

test("helpers", () => {
  assert.equal(normalizeHex("ABC"), "#aabbcc");
  assert.equal(normalizeHex("#12345"), null);
  assert.equal(diffFromDefault({ style: DEFAULT_THEME.style }).style, undefined);
  assert.equal(OPTIONS.style.values.length, 8);
});
