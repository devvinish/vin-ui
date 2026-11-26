import { test, before } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, mkdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeRegistry } from "../../../scripts/build-registry.mjs";
import { main, parseArgs } from "../src/cli.mjs";
import { unifiedDiff, searchComponents, registry, closest } from "../src/core.mjs";
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
  await writeFile(file, (await readFile(file, "utf8")).replace("export function badgeClasses", "// tweaked\nexport function badgeClasses"));
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

test("fonts: vin.css imports the style's fonts, style switches them, --no-fonts is remembered", async () => {
  const dir = await project({ dependencies: { react: "19" } });
  const css = () => readFile(join(dir, "src/vin.css"), "utf8");
  const fontImport = async () => (await css()).match(/^@import url\("([^"]+)"\);$/m)?.[1] ?? null;
  await run(dir, "init", "--style", "clay");
  assert.ok((await css()).startsWith("/* Fonts for clay"), "the @import comes first, before any rule");
  assert.equal(await fontImport(), "https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800&display=swap");

  await run(dir, "style", "paper");
  assert.equal(await fontImport(), "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Kalam:wght@400;700&display=swap");

  await run(dir, "style", "editorial", "--no-fonts");
  assert.equal(await fontImport(), null);
  assert.equal(JSON.parse(await readFile(join(dir, "vin.json"), "utf8")).fonts, false);
  await run(dir, "style", "terminal");
  assert.equal(await fontImport(), null, "--no-fonts stays until --fonts");
  await run(dir, "style", "terminal", "--fonts");
  assert.match(await fontImport(), /family=JetBrains\+Mono/);
  assert.equal(JSON.parse(await readFile(join(dir, "vin.json"), "utf8")).fonts, undefined);

  // The font option adds its font; weights of the same family merge.
  const geist = await project({ dependencies: { vue: "3" } });
  await run(geist, "init", "--style", "precision", "--font", "geist");
  assert.match(await readFile(join(geist, "src/vin.css"), "utf8"), /family=Inter:wght@400;500;600;700&family=Geist:wght@400;500;600;700&display=swap/);
  const none = await project();
  await run(none, "init", "--no-fonts", "--framework", "html");
  assert.doesNotMatch(await readFile(join(none, "vin/vin.css"), "utf8"), /@import/);
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

test("add a block: writes it to blocks/ and adds the components it uses", async () => {
  const dir = await project({ dependencies: { react: "19" } });
  await run(dir, "init");
  await run(dir, "add", "dashboard-01", "login-01");
  assert.match(await readFile(join(dir, "src/components/vin/blocks/dashboard-01.tsx"), "utf8"), /export function Dashboard01/);
  assert.match(await readFile(join(dir, "src/components/vin/blocks/login-01.tsx"), "utf8"), /export function Login01/);
  assert.match(await readFile(join(dir, "src/components/vin/chart.tsx"), "utf8"), /export function Chart/);
  // Blocks import the components relative to themselves: a new Vite app has no "@" or "$lib" shortcut.
  const dash = await readFile(join(dir, "src/components/vin/blocks/dashboard-01.tsx"), "utf8");
  assert.match(dash, /from "\.\.\/chart"/);
  assert.doesNotMatch(dash, /@\/components/);
  for (const [deps, file, want] of [[{ vue: "3" }, "src/components/vin/blocks/dashboard-01.vue", /from "\.\.\/chart\.vue"/], [{ svelte: "5" }, "src/components/vin/blocks/dashboard-01.svelte", /from "\.\.\/chart\.svelte"/]]) {
    const p = await project({ dependencies: deps });
    await run(p, "init");
    await run(p, "add", "dashboard-01");
    const src = await readFile(join(p, file), "utf8");
    assert.match(src, want, file);
    assert.doesNotMatch(src, /(@|\$lib)\/components/, file);
  }
  const html = await project();
  await run(html, "init", "--framework", "html");
  await run(html, "add", "pricing-01");
  const cfg = JSON.parse(await readFile(join(html, "vin.json"), "utf8"));
  assert.match(await readFile(join(html, cfg.path, "pricing-01.html"), "utf8"), /Simple pricing/);
});
