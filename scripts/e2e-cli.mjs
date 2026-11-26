#!/usr/bin/env node
/*
 * End-to-end test of the CLI in real, new projects: what a user does on day one.
 *
 * For each case it creates a fresh Vite app (React 19, React 18, Vue, Svelte) or an empty folder (HTML), runs
 * `init`, adds every component and every block, uses a block and a component from App, switches the style,
 * then runs the app's own type-check and build with the template's default (strict) settings. On React 18 it
 * also mounts the components in a DOM (packages/react/test/dom.test.tsx, pointed at the installed files) to
 * check that refs and the popover attributes work there.
 *
 *   node scripts/e2e-cli.mjs                 all cases
 *   node scripts/e2e-cli.mjs react18 svelte  some cases
 *   KEEP=1 node scripts/e2e-cli.mjs ...      keep the projects (their folder is printed)
 *
 * Needs the network (npm). Uses the registry from this checkout, so build the site first: npm run build.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeRegistry } from "./build-registry.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CLI = join(ROOT, "packages/cli/bin/vinui.mjs");
const CREATE_VITE = "vite@9.4.0"; // npm create vite@9.4.0 runs create-vite 9.4.0
const work = mkdtempSync(join(tmpdir(), "vinui-e2e-"));
const REG = join(work, "registry");
writeRegistry(REG);
const index = JSON.parse(readFileSync(join(REG, "r/index.json"), "utf8"));

const sh = (cwd, cmd, args, opts = {}) => {
  try {
    return execFileSync(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", env: { ...process.env, NO_COLOR: "1", CI: "1" }, ...opts });
  } catch (e) {
    throw new Error(`${cmd} ${args.join(" ")} failed in ${cwd}\n${e.stdout ?? ""}${e.stderr ?? ""}`.slice(0, 6000));
  }
};
const vin = (cwd, ...args) => sh(cwd, "node", [CLI, ...args, "--registry", REG]);
const names = (fw) => index.components.filter((c) => c.frameworks.includes(fw)).map((c) => c.name);
const blocks = index.components.filter((c) => c.category === "Blocks").map((c) => c.name);
const read = (f) => readFileSync(f, "utf8");
const check = (ok, msg) => { if (!ok) throw new Error(msg); };

function vite(name, template) {
  sh(work, "npm", ["create", CREATE_VITE, name, "--", "--template", template, "--no-interactive"]);
  return join(work, name);
}

/** init with Paper, add everything, switch to Clay: fonts and relative imports must be right. */
function setUp(dir, fw) {
  vin(dir, "init", "--style", "paper", "--yes");
  const cfg = JSON.parse(read(join(dir, "vin.json")));
  check(cfg.framework === fw, `detected ${cfg.framework}, expected ${fw}`);
  check(/@import url\("https:\/\/fonts\.googleapis\.com\/css2\?family=Inter[^"]*family=Kalam/.test(read(join(dir, cfg.css))), "vin.css should import Paper's fonts");
  vin(dir, "add", ...names(fw), "--yes");
  vin(dir, "style", "clay");
  const css = read(join(dir, cfg.css));
  check(/@import url\("https:\/\/fonts\.googleapis\.com\/css2\?family=Nunito/.test(css) && !/Kalam/.test(css.slice(0, 400)), "style clay should switch the font import to Nunito");
  const dash = read(join(dir, cfg.path, "blocks", "dashboard-01" + { react: ".tsx", vue: ".vue", svelte: ".svelte" }[fw]));
  check(!/(@|\$lib)\/components\/vin/.test(dash), "blocks should import with relative paths");
  return cfg;
}

const CASES = {
  async react19() {
    const dir = vite("react19", "react-ts");
    sh(dir, "npm", ["install", "--no-audit", "--no-fund"]);
    react(dir);
  },
  async react18() {
    const dir = vite("react18", "react-ts");
    sh(dir, "npm", ["install", "--no-audit", "--no-fund"]);
    sh(dir, "npm", ["install", "--no-audit", "--no-fund", "react@^18.3.1", "react-dom@^18.3.1", "@types/react@^18.3", "@types/react-dom@^18.3"]);
    react(dir);
    // Mount the installed components with React 18: refs, popover attributes, no warnings.
    sh(dir, "npm", ["install", "--no-audit", "--no-fund", "-D", "vitest@4.1.12", "jsdom@25.0.1"]);
    mkdirSync(join(dir, "e2e"), { recursive: true });
    writeFileSync(join(dir, "e2e/dom.test.tsx"), read(join(ROOT, "packages/react/test/dom.test.tsx")).replaceAll('"../src/', '"../src/components/vin/'));
    const out = sh(dir, "npx", ["vitest", "run", "e2e", "--environment", "jsdom"]);
    check(/React 18\.3\.1/.test(out) || /passed/.test(out), out);
    console.log("   " + (out.match(/Tests\s+.*$/m)?.[0] ?? "").trim());
  },
  async vue() {
    const dir = vite("vue", "vue-ts");
    sh(dir, "npm", ["install", "--no-audit", "--no-fund"]);
    setUp(dir, "vue");
    writeFileSync(join(dir, "src/App.vue"), `<script setup lang="ts">\nimport Button from "./components/vin/button.vue";\nimport Dashboard01 from "./components/vin/blocks/dashboard-01.vue";\n</script>\n\n<template>\n  <Button>Save</Button>\n  <Dashboard01 />\n</template>\n`);
    writeFileSync(join(dir, "src/main.ts"), `import { createApp } from "vue";\nimport "./vin.css";\nimport App from "./App.vue";\n\ncreateApp(App).mount("#app");\n`);
    sh(dir, "npm", ["run", "build"]);
  },
  async svelte() {
    const dir = vite("svelte", "svelte-ts");
    sh(dir, "npm", ["install", "--no-audit", "--no-fund"]);
    // The Svelte template has src/lib, so the CLI uses src/lib/components/vin.
    const at = "./" + setUp(dir, "svelte").path.replace(/^src\//, "");
    writeFileSync(join(dir, "src/App.svelte"), `<script lang="ts">\n  import Button from "${at}/button.svelte";\n  import Dashboard01 from "${at}/blocks/dashboard-01.svelte";\n</script>\n\n<Button>Save</Button>\n<Dashboard01 />\n`);
    const main = read(join(dir, "src/main.ts"));
    writeFileSync(join(dir, "src/main.ts"), main.replace(/import ['"]\.\/app\.css['"];?\n?/, 'import "./vin.css";\n'));
    sh(dir, "npm", ["run", "check"]);
    sh(dir, "npm", ["run", "build"]);
  },
  async html() {
    const dir = join(work, "html");
    mkdirSync(dir);
    vin(dir, "init", "--style", "editorial", "--yes");
    vin(dir, "add", "card", "select", "pricing-01", "--yes");
    check(/@import url\("https:\/\/fonts\.googleapis\.com\/css2\?family=Inter[^"]*Instrument\+Serif/.test(read(join(dir, "vin/vin.css"))), "editorial fonts");
    check(existsSync(join(dir, "vin/vinui.js")) && existsSync(join(dir, "vin/pricing-01.html")), "html files");
  },
};

function react(dir) {
  setUp(dir, "react");
  writeFileSync(join(dir, "src/App.tsx"), `import { useRef } from "react";\nimport { Button } from "./components/vin/button";\nimport { Input } from "./components/vin/input";\nimport { Dashboard01 } from "./components/vin/blocks/dashboard-01";\n\nexport default function App() {\n  const ref = useRef<HTMLInputElement>(null);\n  return (\n    <>\n      <Input ref={ref} aria-label="Name" />\n      <Button onClick={() => ref.current?.focus()}>Focus</Button>\n      <Dashboard01 />\n    </>\n  );\n}\n`);
  writeFileSync(join(dir, "src/main.tsx"), `import { StrictMode } from "react";\nimport { createRoot } from "react-dom/client";\nimport "./vin.css";\nimport App from "./App.tsx";\n\ncreateRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);\n`);
  sh(dir, "npm", ["run", "build"]);
}

const pick = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const run = pick.length ? pick : Object.keys(CASES);
let failed = 0;
console.log(`VinUI CLI end-to-end in ${work}`);
for (const name of run) {
  if (!CASES[name]) { console.log(`✗ ${name}: unknown case (${Object.keys(CASES).join(", ")})`); failed++; continue; }
  const t = Date.now();
  try { await CASES[name](); console.log(`✓ ${name} (${Math.round((Date.now() - t) / 1000)}s)`); }
  catch (e) { failed++; console.log(`✗ ${name}\n${String(e.message).replace(/^/gm, "   ")}`); }
}
if (!process.env.KEEP) rmSync(work, { recursive: true, force: true });
else console.log(`kept: ${work}`);
process.exitCode = failed ? 1 : 0;
