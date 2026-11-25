import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";

// Every HTML snippet: only classes that some spec defines, safe buttons, labelled controls.
const specDir = new URL("../../../spec/", import.meta.url);
const specs = readdirSync(specDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(new URL(f, specDir), "utf8")));
const allowed = new Set(specs.flatMap((s) => s.classes));

for (const spec of specs) {
  const dir = new URL(`../src/${spec.name}/`, import.meta.url);
  test(`${spec.name}: has an HTML snippet for every example in the spec`, () => {
    for (const ex of spec.examples) assert.ok(existsSync(new URL(`${ex.id}.html`, dir)), `missing src/${spec.name}/${ex.id}.html`);
  });
  for (const ex of spec.examples) {
    const file = new URL(`${ex.id}.html`, dir);
    if (!existsSync(file)) continue;
    const html = readFileSync(file, "utf8");
    test(`${spec.name}/${ex.id}.html uses only spec classes`, () => {
      for (const [, cls] of html.matchAll(/class="([^"]+)"/g)) {
        for (const c of cls.split(/\s+/)) assert.ok(allowed.has(c), `unknown class "${c}"`);
      }
    });
    test(`${spec.name}/${ex.id}.html: buttons are type="button", icon buttons and inputs are labelled`, () => {
      for (const [tag] of html.matchAll(/<button[^>]*>/g)) {
        assert.match(tag, /type="(button|submit)"/);
        if (tag.includes("vin-btn--icon")) assert.match(tag, /aria-label(ledby)?="[^"]+"/);
      }
      for (const [tag] of html.matchAll(/<(input|textarea|select)\b[^>]*>/g)) {
        if (/type="(hidden|submit|button)"/.test(tag)) continue;
        const id = tag.match(/\sid="([^"]+)"/)?.[1];
        const labelled = /aria-label(ledby)?="/.test(tag) || (id && html.includes(`for="${id}"`));
        assert.ok(labelled, `unlabelled control: ${tag}`);
      }
    });
  }
}
