/*
 * The parts the CLI commands and the MCP server share: reading the registry, reading and
 * writing vin.json, finding the project's framework, writing component files and diffing.
 * Everything takes a `cwd` so tests (and the MCP server) can point it anywhere.
 */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { join, dirname, resolve, relative, isAbsolute } from "node:path";
import { normalizeTheme, themeToAttributes, OPTIONS } from "./theme.mjs";
import { DEFAULT_SITE, FRAMEWORK_IDS, RegistryError, closest, makeRegistry, searchComponents } from "./shared.mjs";
export { DEFAULT_SITE, FRAMEWORK_IDS, RegistryError, closest, makeRegistry, searchComponents };
export const CONFIG_FILE = "vin.json";

const exists = (p) => access(p).then(() => true, () => false);

/* ───────────────────────── registry ───────────────────────── */

export function registry(source = process.env.VINUI_REGISTRY || DEFAULT_SITE) {
  const local = !/^https?:\/\//.test(source);
  const base = local ? resolve(source) : source.replace(/\/+$/, "");
  return makeRegistry(async (path) => {
    if (local) {
      try { return await readFile(join(base, path), "utf8"); } catch { throw new RegistryError(`Not found in the registry: ${path}`, 404); }
    }
    let res;
    try { res = await fetch(`${base}/${path}`, { headers: { "user-agent": "vinui-cli" } }); } catch (e) {
      throw new RegistryError(`Can't reach ${base}. Check your connection, or use --registry <folder> to work offline. (${e.cause?.code ?? e.message})`);
    }
    if (res.status === 404) throw new RegistryError(`Not found in the registry: ${path}`, 404);
    if (!res.ok) throw new RegistryError(`${base}/${path} answered ${res.status}. Try again in a minute.`);
    return res.text();
  }, base);
}

/* ───────────────────────── project ───────────────────────── */

/** Guess the framework from package.json. Plain HTML when there's none. */
export async function detectFramework(cwd) {
  let pkg;
  try { pkg = JSON.parse(await readFile(join(cwd, "package.json"), "utf8")); } catch { return "html"; }
  const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
  if (deps.svelte || deps["@sveltejs/kit"]) return "svelte";
  if (deps.vue || deps.nuxt) return "vue";
  if (deps.react || deps.next) return "react";
  return "html";
}

/** Where components go by default, following each framework's habits. */
export async function defaultPath(cwd, framework) {
  if (framework === "svelte") return (await exists(join(cwd, "src/lib"))) || (await exists(join(cwd, "svelte.config.js"))) ? "src/lib/components/vin" : "src/components/vin";
  if (framework === "html") return "vin";
  return (await exists(join(cwd, "src"))) ? "src/components/vin" : "components/vin";
}

export async function readConfig(cwd) {
  const file = join(cwd, CONFIG_FILE);
  let raw;
  try { raw = await readFile(file, "utf8"); } catch {
    throw new RegistryError(`No ${CONFIG_FILE} here. Run \`npx @vinish/ui init\` first.`);
  }
  let data;
  try { data = JSON.parse(raw); } catch { throw new RegistryError(`${CONFIG_FILE} isn't valid JSON. Fix it or run \`npx @vinish/ui init --force\`.`); }
  if (!FRAMEWORK_IDS.includes(data.framework)) throw new RegistryError(`${CONFIG_FILE} has an unknown framework "${data.framework}". Use one of: ${FRAMEWORK_IDS.join(", ")}.`);
  return { framework: data.framework, path: data.path ?? "src/components/vin", css: data.css ?? "vin.css", theme: normalizeTheme(data), components: data.components ?? {} };
}

export async function writeConfig(cwd, cfg) {
  const t = normalizeTheme(cfg.theme);
  const themeOut = { style: t.style, accent: t.accent };
  for (const k of Object.keys(OPTIONS)) if (k !== "style" && k !== "mode" && t[k] !== OPTIONS[k].default) themeOut[k] = t[k];
  if (t.font === "custom") themeOut.fontFamily = t.fontFamily;
  const data = {
    $schema: `${DEFAULT_SITE}/r/vin.schema.json`,
    framework: cfg.framework, ...themeOut, path: cfg.path, css: cfg.css,
    components: Object.fromEntries(Object.entries(cfg.components ?? {}).sort()),
  };
  await writeFile(join(cwd, CONFIG_FILE), JSON.stringify(data, null, 2) + "\n");
  return data;
}

/** vin.css: the style's CSS, then the theme's accent and options. */
export async function buildCss(reg, theme) {
  const t = normalizeTheme(theme);
  const css = await reg.css(t.style);
  const { attrs, vars } = themeToAttributes(t);
  const attrList = Object.entries(attrs).filter(([, v]) => v !== null).map(([k, v]) => `${k}="${v}"`).join(" ");
  return `${css.trimEnd()}\n\n/* ── Your theme (written by npx @vinish/ui; run \`npx @vinish/ui style <name>\` to switch) ──\n   Put these on <html>: ${attrList} */\n:root {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}\n`;
}

/**
 * Put the theme's data attributes on the <html> tag of the files a framework renders it from
 * (Vite's index.html, Next's app/layout.tsx, SvelteKit's src/app.html). Returns the files changed.
 */
export async function applyHtmlAttributes(cwd, theme) {
  const { attrs } = themeToAttributes(theme);
  const candidates = ["index.html", "src/app.html", "app/layout.tsx", "src/app/layout.tsx", "app/layout.jsx", "src/app/layout.jsx", "app.vue"];
  const changed = [];
  for (const rel of candidates) {
    const file = join(cwd, rel);
    if (!(await exists(file))) continue;
    const src = await readFile(file, "utf8");
    const m = src.match(/<html\b[^>]*>/);
    if (!m) continue;
    let tag = m[0].replace(/\s+data-vin-[a-z]+=("[^"]*"|\{[^}]*\})/g, "");
    const add = Object.entries(attrs).filter(([, v]) => v !== null).map(([k, v]) => ` ${k}="${v}"`).join("");
    tag = tag.replace(/^<html/, "<html" + add);
    if (tag !== m[0]) { await writeFile(file, src.replace(m[0], tag)); changed.push(rel); }
  }
  return changed;
}

/* ───────────────────────── components ───────────────────────── */

/** A component plus everything it needs, dependencies first. */
export async function resolveWithDeps(reg, framework, names) {
  const order = [];
  const seen = new Set();
  async function visit(name, chain) {
    if (seen.has(name)) return;
    if (chain.includes(name)) throw new RegistryError(`Circular dependency: ${[...chain, name].join(" → ")}`);
    const entry = await reg.component(framework, name);
    for (const dep of entry.dependencies ?? []) await visit(dep, [...chain, name]);
    seen.add(name);
    order.push(entry);
  }
  for (const n of names) await visit(n.toLowerCase().trim(), []);
  return order;
}

/** Files to write for one registry entry, relative to the project. */
export function filesFor(entry, cfg) {
  if (cfg.framework !== "html") return entry.files.map((f) => ({ path: join(cfg.path, f.path), content: f.content }));
  // Plain HTML: every example in one file, ready to copy from.
  const body = entry.examples.map((ex) => `<!-- ${entry.title}: ${ex.title}. ${ex.description} -->\n${ex.code.trimEnd()}\n`).join("\n");
  return [{ path: join(cfg.path, `${entry.name}.html`), content: `<!-- VinUI ${entry.title}. Docs: ${entry.docs} -->\n\n${body}` }];
}

/** Keep writes inside the project. */
export function safeJoin(cwd, rel) {
  const full = resolve(cwd, rel);
  const r = relative(cwd, full);
  if (r.startsWith("..") || isAbsolute(r)) throw new RegistryError(`Refusing to write outside the project: ${rel}`);
  return full;
}

/**
 * Add components. `decide(path, old, next)` is asked when a file already exists with
 * different content and returns true to overwrite. Returns what happened to each file.
 */
export async function addComponents({ cwd, reg, names, overwrite = false, decide }) {
  const cfg = await readConfig(cwd);
  const entries = await resolveWithDeps(reg, cfg.framework, names);
  const results = [];
  let needsScript = false;
  for (const entry of entries) {
    needsScript ||= !!entry.needsScript;
    for (const f of filesFor(entry, cfg)) {
      const full = safeJoin(cwd, f.path);
      let old = null;
      try { old = await readFile(full, "utf8"); } catch {}
      if (old === f.content) { results.push({ name: entry.name, path: f.path, status: "unchanged" }); continue; }
      if (old !== null && !overwrite && !(decide && (await decide(f.path, old, f.content)))) {
        results.push({ name: entry.name, path: f.path, status: "skipped" });
        continue;
      }
      await mkdir(dirname(full), { recursive: true });
      await writeFile(full, f.content);
      results.push({ name: entry.name, path: f.path, status: old === null ? "added" : "updated" });
    }
    cfg.components[entry.name] = (await reg.index().catch(() => ({ version: "0.0.0" }))).version;
  }
  if (cfg.framework === "html" && needsScript) {
    const rel = join(cfg.path, "vinui.js");
    const full = safeJoin(cwd, rel);
    const js = await reg.script();
    let old = null;
    try { old = await readFile(full, "utf8"); } catch {}
    if (old !== js) { await mkdir(dirname(full), { recursive: true }); await writeFile(full, js); results.push({ name: "vinui.js", path: rel, status: old === null ? "added" : "updated" }); }
  }
  await writeConfig(cwd, cfg);
  return { results, framework: cfg.framework };
}

/* ───────────────────────── diff ───────────────────────── */

/** A unified diff (3 lines of context) between two texts, or "" when equal. */
export function unifiedDiff(a, b, fromName = "yours", toName = "VinUI") {
  if (a === b) return "";
  const x = a.split("\n"), y = b.split("\n");
  const n = x.length, m = y.length;
  // LCS table; files are small (a few hundred lines).
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const ops = [];
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && x[i] === y[j]) { ops.push([" ", x[i], i, j]); i++; j++; }
    else if (i < n && (j === m || L[i + 1][j] >= L[i][j + 1])) { ops.push(["-", x[i], i, j]); i++; }
    else { ops.push(["+", y[j], i, j]); j++; }
  }
  const out = [`--- ${fromName}`, `+++ ${toName}`];
  const C = 3;
  for (let k = 0; k < ops.length;) {
    if (ops[k][0] === " ") { k++; continue; }
    let start = Math.max(0, k - C), end = k;
    while (end < ops.length) {
      if (ops[end][0] !== " ") { end++; continue; }
      let run = 0;
      while (end + run < ops.length && ops[end + run][0] === " ") run++;
      if (end + run >= ops.length || run > C * 2) { end = Math.min(ops.length, end + C); break; }
      end += run;
    }
    const hunk = ops.slice(start, end);
    const aStart = hunk[0][2] + 1, bStart = hunk[0][3] + 1;
    const aLen = hunk.filter((o) => o[0] !== "+").length, bLen = hunk.filter((o) => o[0] !== "-").length;
    out.push(`@@ -${aStart},${aLen} +${bStart},${bLen} @@`, ...hunk.map((o) => o[0] + o[1]));
    k = end;
  }
  return out.join("\n") + "\n";
}

/** Compare the project's copy of each component with the registry's. */
export async function diffComponents({ cwd, reg, names }) {
  const cfg = await readConfig(cwd);
  const list = names?.length ? names : Object.keys(cfg.components);
  const out = [];
  for (const name of list) {
    const entry = await reg.component(cfg.framework, name);
    for (const f of filesFor(entry, cfg)) {
      let mine = null;
      try { mine = await readFile(safeJoin(cwd, f.path), "utf8"); } catch {}
      out.push({ name, path: f.path, missing: mine === null, diff: mine === null ? "" : unifiedDiff(mine, f.content, `${f.path} (yours)`, `${f.path} (VinUI)`) });
    }
  }
  return out;
}
