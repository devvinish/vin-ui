import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBlocks, generatedBlockFiles, BLOCK_CATEGORIES, blockHtml } from "../../../scripts/blocks.mjs";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));

test("every block has a known category, a description and ids that start with its name", () => {
  for (const b of loadBlocks()) {
    assert.ok(BLOCK_CATEGORIES.includes(b.category), `${b.name}: category ${b.category}`);
    assert.ok(b.description.length > 20, b.name);
    const prefix = b.name.replace(/-password/, "");
    for (const [, id] of blockHtml(b.html).matchAll(/\sid="([^"]+)"/g)) assert.ok(id.startsWith(prefix), `${b.name}: id "${id}" should start with "${prefix}" so blocks can share a page`);
  }
});

test("the React, Vue and Svelte blocks are up to date (run node scripts/blocks.mjs)", () => {
  for (const [path, code] of Object.entries(generatedBlockFiles())) {
    assert.ok(existsSync(join(ROOT, path)), `${path} is missing`);
    assert.equal(readFileSync(join(ROOT, path), "utf8"), code, `${path} is out of date`);
  }
});
