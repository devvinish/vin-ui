import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const spec = JSON.parse(readFileSync(new URL("../../../spec/button.json", import.meta.url), "utf8"));
const allowed = new Set([spec.baseClass]);
for (const p of ["variant", "size"]) for (const v of spec.props[p].values) allowed.add(`vin-btn--${v}`);
const dir = new URL("../src/button/", import.meta.url);

for (const file of readdirSync(dir)) {
  const html = readFileSync(new URL(file, dir), "utf8");
  test(`button/${file} uses only classes from spec/button.json`, () => {
    for (const [, cls] of html.matchAll(/class="([^"]+)"/g)) {
      for (const c of cls.split(/\s+/)) assert.ok(allowed.has(c), `unknown class "${c}"`);
    }
  });
  test(`button/${file}: every <button> has type="button" and icon buttons have a label`, () => {
    for (const [tag] of html.matchAll(/<button[^>]*>/g)) {
      assert.match(tag, /type="button"/);
      if (tag.includes("vin-btn--icon")) assert.match(tag, /aria-label="[^"]+"/);
    }
  });
}
