import { test, before } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, mkdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeRegistry } from "../../../scripts/build-registry.mjs";
import { main, parseArgs } from "../src/cli.mjs";
import { unifiedDiff, searchComponents, registry, closest } from "../src/core.mjs";
import { createServer } from "../src/mcp.mjs";
import { vendoredTheme } from "../scripts/vendor-theme.mjs";

let REG;
const quiet = async (fn) => { const log = console.log; console.log = () => {}; try { return await fn(); } finally { console.log = log; } };
const project = async (pkg) => {
  const dir = await mkdtemp(join(tmpdir(), "vinui-"));
  if (pkg) { await writeFile(join(dir, "package.json"), JSON.stringify(pkg)); await mkdir(join(dir, "src")); }
  return dir;
};
const run = (dir, ...args) => quiet(() => main([...args, "--cwd", dir, "--registry", REG, "--yes"]));

before(async () => {
  REG = await mkdtemp(join(tmpdir(), "vinui-reg-"));
  writeRegistry(REG);
});

test("the vendored theme engine matches packages/theme", () => {
  assert.equal(readFileSync(new URL("../src/theme.mjs", import.meta.url), "utf8"), vendoredTheme(), "run: npm run vendor -w @vinish/ui");
});

test("parseArgs reads flags, values and positionals", () => {
  assert.deepEqual(parseArgs(["add", "button", "--accent", "#fff", "--font-family=Inter Tight", "-y"]), { _: ["add", "button"], accent: "#fff", fontFamily: "Inter Tight", yes: true });
});

test("init (React): detects the framework, writes vin.json and vin.css, tags <html>", async () => {
  const dir = await project({ dependencies: { react: "19" } });
  await writeFile(join(dir, "index.html"), "<!doctype html>\n<html lang=\"en\">\n<body></body></html>\n");
  await run(dir, "init", "--style", "tactile", "--accent", "#0d9488", "--radius", "lg");
  const cfg = JSON.parse(await readFile(join(dir, "vin.json"), "utf8"));
  assert.equal(cfg.framework, "react");
  assert.equal(cfg.style, "tactile");
  assert.equal(cfg.accent, "#0d9488");
  assert.equal(cfg.radius, "lg");
  assert.equal(cfg.path, "src/components/vin");
  const css = await readFile(join(dir, "src/vin.css"), "utf8");
  assert.match(css, /styles: tactile/);
  assert.match(css, /--vin-accent: #0d9488;/);
  assert.match(await readFile(join(dir, "index.html"), "utf8"), /<html data-vin-style="tactile" data-vin-radius="lg" lang="en">/);
  await assert.rejects(run(dir, "init"), /already exists/);
});

test("add: writes the component and what it needs; keeps local edits unless --overwrite", async () => {
  const dir = await project({ dependencies: { react: "19" } });
  await run(dir, "init");
  await run(dir, "add", "sheet");
  const sheet = await readFile(join(dir, "src/components/vin/sheet.tsx"), "utf8");
  assert.match(sheet, /from "\.\/dialog"/);
  assert.match(await readFile(join(dir, "src/components/vin/dialog.tsx"), "utf8"), /export function Dialog/);
  const cfg = JSON.parse(await readFile(join(dir, "vin.json"), "utf8"));
  assert.deepEqual(Object.keys(cfg.components), ["dialog", "sheet"]);

  await writeFile(join(dir, "src/components/vin/dialog.tsx"), "// mine\n");
  await run(dir, "add", "dialog");
  assert.equal(await readFile(join(dir, "src/components/vin/dialog.tsx"), "utf8"), "// mine\n");
  await run(dir, "add", "dialog", "--overwrite");
  assert.match(await readFile(join(dir, "src/components/vin/dialog.tsx"), "utf8"), /export function Dialog/);
});

test("Svelte: add writes the parts and the components it imports, into src/lib", async () => {
  const dir = await project({ dependencies: { svelte: "^5.30.0", "@sveltejs/kit": "^2" } });
  await mkdir(join(dir, "src/lib"));
  await run(dir, "init");
  assert.equal(JSON.parse(await readFile(join(dir, "vin.json"), "utf8")).framework, "svelte");
  await run(dir, "add", "toggle-group", "alert-dialog");
  const base = join(dir, "src/lib/components/vin");
  for (const f of ["toggle-group.svelte", "toggle-group-item.svelte", "alert-dialog.svelte", "dialog.svelte"]) {
    assert.ok(await readFile(join(base, f), "utf8"), f);
  }
  // A shorter name's files don't come along: toggle-group-item belongs to toggle-group, not toggle.
  await run(dir, "add", "toggle");
  const toggle = JSON.parse(readFileSync(join(REG, "r/svelte/toggle.json"), "utf8"));
  assert.deepEqual(toggle.files.map((f) => f.path), ["toggle.svelte"]);
});

test("Vue: add writes .vue files", async () => {
  const dir = await project({ dependencies: { vue: "^3.5.0" } });
  await run(dir, "init");
  await run(dir, "add", "sheet");
  assert.match(await readFile(join(dir, "src/components/vin/sheet.vue"), "utf8"), /from "\.\/dialog\.vue"/);
  assert.ok(await readFile(join(dir, "src/components/vin/dialog.vue"), "utf8"));
});

test("add: a typo gets a suggestion", async () => {
  const dir = await project({ dependencies: { react: "19" } });
  await run(dir, "init");
  await assert.rejects(run(dir, "add", "buton"), /Did you mean "button"/);
});

test("diff: shows the user's changes against VinUI", async () => {
  const dir = await project({ dependencies: { react: "19" } });
  await run(dir, "init");
  await run(dir, "add", "badge");
  const file = join(dir, "src/components/vin/badge.tsx");
  await writeFile(file, (await readFile(file, "utf8")).replace("export function Badge", "// tweaked\nexport function Badge"));
  const out = [];
  const log = console.log;
  console.log = (s) => out.push(String(s));
  try { await main(["diff", "--cwd", dir, "--registry", REG]); } finally { console.log = log; process.exitCode = 0; }
  assert.ok(out.some((l) => l.includes("-// tweaked")), out.join("\n"));
});

test("style: switches the CSS and keeps the accent", async () => {
  const dir = await project({ dependencies: { vue: "3" } });
  await run(dir, "init", "--accent", "#e11d48");
  await run(dir, "style", "paper");
  const css = await readFile(join(dir, "src/vin.css"), "utf8");
  assert.match(css, /styles: paper/);
  assert.match(css, /--vin-accent: #e11d48;/);
  assert.equal(JSON.parse(await readFile(join(dir, "vin.json"), "utf8")).style, "paper");
  await assert.rejects(run(dir, "style", "papr"), /Did you mean "paper"/);
});

test("plain HTML: add writes the examples and vinui.js when needed", async () => {
  const dir = await project();
  await run(dir, "init");
  await run(dir, "add", "card");
  assert.match(await readFile(join(dir, "vin/card.html"), "utf8"), /class="vin-card"/);
  await assert.rejects(readFile(join(dir, "vin/vinui.js")));
  await run(dir, "add", "select");
  assert.match(await readFile(join(dir, "vin/vinui.js"), "utf8"), /window.VinUI/);
});

test("unifiedDiff: equal is empty; a change shows - and + lines in a hunk", () => {
  assert.equal(unifiedDiff("a\nb", "a\nb"), "");
  const d = unifiedDiff("1\n2\n3\n4\n5\n6\n7\n8\n9", "1\n2\n3\n4\nfive\n6\n7\n8\n9");
  assert.match(d, /@@ -2,7 \+2,7 @@/);
  assert.match(d, /\n-5\n\+five\n/);
});

test("search: plain words find the right component", async () => {
  const idx = await registry(REG).index();
  assert.equal(searchComponents(idx.components, "modal")[0].name, "dialog");
  assert.equal(searchComponents(idx.components, "notification")[0].name, "toast");
  assert.equal(closest("dialgo", ["dialog", "drawer"]), "dialog");
});

test("MCP: initialize, list tools, get code, add files", async () => {
  const dir = await project({ dependencies: { react: "19" } });
  await run(dir, "init", "--style", "bento");
  const handle = createServer({ cwd: dir, registrySource: REG });
  const init = await handle({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "1" } } });
  assert.equal(init.result.protocolVersion, "2025-06-18");
  assert.equal(await handle({ jsonrpc: "2.0", method: "notifications/initialized" }), null);
  const list = await handle({ jsonrpc: "2.0", id: 2, method: "tools/list" });
  assert.deepEqual(list.result.tools.map((t) => t.name), ["list_components", "search_components", "get_component", "list_styles", "get_theme", "add_component"]);
  const get = await handle({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_component", arguments: { name: "button" } } });
  assert.match(get.result.content[0].text, /bento style/);
  assert.match(get.result.content[0].text, /export function Button/);
  const add = await handle({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "add_component", arguments: { names: ["alert-dialog"] } } });
  assert.match(add.result.content[0].text, /added: src\/components\/vin\/dialog.tsx/);
  const bad = await handle({ jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "get_component", arguments: { name: "nope" } } });
  assert.equal(bad.result.isError, true);
  const unknown = await handle({ jsonrpc: "2.0", id: 6, method: "nope" });
  assert.equal(unknown.error.code, -32601);
});
