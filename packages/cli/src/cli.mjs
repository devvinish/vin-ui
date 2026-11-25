/*
 * npx @vinish/ui <command>
 *   init      set up a project: framework, style, accent, folder (writes vin.json + vin.css)
 *   add       add components (and what they need)
 *   style     switch the project's style (rewrites vin.css)
 *   diff      show what changed upstream since you added a component
 *   list      list the components
 *   mcp       start the MCP server for AI tools
 */
import { readFile, writeFile, access, mkdir } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { createInterface } from "node:readline/promises";
import {
  registry, detectFramework, defaultPath, readConfig, writeConfig, buildCss, applyHtmlAttributes,
  addComponents, diffComponents, FRAMEWORK_IDS, CONFIG_FILE, RegistryError, closest,
} from "./core.mjs";
import { normalizeTheme, normalizeHex, OPTIONS, ACCENTS, parseTheme } from "./theme.mjs";

const VERSION = "0.1.0";
const exists = (p) => access(p).then(() => true, () => false);

/** Tiny argv parser: --flag value, --flag=value, --bool, -y, positionals. */
export function parseArgs(argv) {
  const out = { _: [] };
  const bools = new Set(["yes", "force", "overwrite", "help", "version", "json"]);
  const alias = { y: "yes", f: "force", h: "help", v: "version", o: "overwrite" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      let [k, v] = a.slice(2).split(/=(.*)/s);
      k = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (v === undefined) v = bools.has(k) || argv[i + 1] === undefined || argv[i + 1].startsWith("-") ? true : argv[++i];
      out[k] = v;
    } else if (/^-[a-z]$/.test(a)) out[alias[a[1]] ?? a[1]] = true;
    else out._.push(a);
  }
  return out;
}

const tty = () => process.stdin.isTTY && process.stdout.isTTY;
const color = (code) => (s) => (process.stdout.isTTY && !process.env.NO_COLOR ? `\x1b[${code}m${s}\x1b[0m` : s);
const bold = color(1), dim = color(2), green = color(32), yellow = color(33), red = color(31), cyan = color(36);

async function ask(rl, question, fallback) {
  const a = (await rl.question(`${question} ${dim(`(${fallback})`)} `)).trim();
  return a || fallback;
}
async function choose(rl, question, values, fallback) {
  for (;;) {
    const a = (await ask(rl, `${question} [${values.join(" / ")}]`, fallback)).toLowerCase();
    if (values.includes(a)) return a;
    const near = closest(a, values);
    console.log(yellow(`  "${a}" isn't one of them${near ? `; did you mean ${near}?` : "."}`));
  }
}

export const HELP = `${bold("VinUI")} ${VERSION}: components in 8 styles, in your accent colour.

${bold("Usage")}  npx @vinish/ui <command> [options]

${bold("Commands")}
  init                 Set up this project (asks for framework, style, accent and folder)
  add <names…>         Add components, e.g. add button dialog
  style <name>         Switch the style (rewrites vin.css)
  diff [names…]        Show what changed in VinUI since you added a component
  list                 List the components
  mcp                  Start the MCP server for AI tools (Claude Code, Cursor, VS Code…)

${bold("init options")}
  --framework <react|vue|svelte|html>   --style <${OPTIONS.style.values.join("|")}>
  --accent "#0d9488"   --path src/components/vin   --css src/vin.css
  --radius, --gray, --font, --density, --motion, --font-family "Name"
  --theme vin-theme.json   use a theme exported from vinish.dev/ui
  -y, --yes            don't ask, use the defaults   --force   replace an existing vin.json

${bold("Everywhere")}
  --registry <url|folder>   where components come from (default https://vinish.dev/ui)
  --cwd <folder>            run in another folder

Docs: https://vinish.dev/ui/docs/cli/`;

/* ───────────────────────── commands ───────────────────────── */

async function init(args, cwd, reg) {
  const cfgPath = join(cwd, CONFIG_FILE);
  if ((await exists(cfgPath)) && !args.force) throw new RegistryError(`${CONFIG_FILE} already exists. Use \`npx @vinish/ui style <name>\` to switch styles, or add --force to start over.`);

  let theme = {};
  if (args.theme) {
    const parsed = parseTheme(await readFile(join(cwd, args.theme), "utf8"));
    for (const w of parsed.warnings) console.log(yellow("  " + w));
    theme = parsed.theme;
    console.log(dim(`Using the theme "${parsed.name}" from ${args.theme}.`));
  }
  for (const k of ["style", "radius", "gray", "font", "density", "motion"]) if (args[k]) theme[k] = String(args[k]).toLowerCase();
  if (args.fontFamily) { theme.font = "custom"; theme.fontFamily = args.fontFamily; }
  if (args.accent) {
    const hex = normalizeHex(args.accent);
    if (!hex) throw new RegistryError(`"${args.accent}" isn't a colour. Use a hex value like "#0d9488".`);
    theme.accent = hex;
  }
  for (const k of ["style", "radius", "gray", "font", "density", "motion"]) {
    if (theme[k] !== undefined && !OPTIONS[k].values.includes(theme[k])) {
      const near = closest(theme[k], OPTIONS[k].values);
      throw new RegistryError(`Unknown ${k} "${theme[k]}".${near ? ` Did you mean "${near}"?` : ""} Choose from: ${OPTIONS[k].values.join(", ")}.`);
    }
  }

  let framework = args.framework ? String(args.framework).toLowerCase() : await detectFramework(cwd);
  if (!FRAMEWORK_IDS.includes(framework)) throw new RegistryError(`Unknown framework "${framework}". Use one of: ${FRAMEWORK_IDS.join(", ")}.`);
  let path = args.path ?? (await defaultPath(cwd, framework));
  let css = args.css ?? (framework === "html" ? join(path, "vin.css") : (await exists(join(cwd, "src"))) ? "src/vin.css" : "vin.css");

  if (tty() && !args.yes) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    try {
      console.log(`${bold("VinUI setup")} ${dim("(press Enter for the suggestion in brackets)")}`);
      if (!args.framework) framework = await choose(rl, "Framework", FRAMEWORK_IDS, framework);
      if (!theme.style) theme.style = await choose(rl, "Style", OPTIONS.style.values, OPTIONS.style.default);
      if (!theme.accent) {
        console.log(dim(`  Accents: ${ACCENTS.map((a) => `${a.name} ${a.hex}`).join(", ")}`));
        for (;;) {
          const a = await ask(rl, "Accent colour (hex or a name above)", "#5b5bd6");
          const named = ACCENTS.find((x) => x.name.toLowerCase() === a.toLowerCase());
          const hex = named ? named.hex : normalizeHex(a);
          if (hex) { theme.accent = hex; break; }
          console.log(yellow(`  "${a}" isn't a colour. Try "#0d9488" or "Teal".`));
        }
      }
      if (!args.path) path = await ask(rl, "Folder for components", await defaultPath(cwd, framework));
      if (!args.css) css = await ask(rl, "Where to write the CSS", framework === "html" ? join(path, "vin.css") : css);
    } finally { rl.close(); }
  }

  const t = normalizeTheme(theme);
  const cssText = await buildCss(reg, t);
  await mkdir(dirname(join(cwd, css)), { recursive: true });
  await writeFile(join(cwd, css), cssText);
  await writeConfig(cwd, { framework, theme: t, path, css, components: {} });
  const touched = await applyHtmlAttributes(cwd, t);

  console.log(`${green("✓")} Wrote ${bold(CONFIG_FILE)} and ${bold(css)} ${dim(`(${t.style}, ${t.accent})`)}`);
  if (touched.length) console.log(`${green("✓")} Added data-vin-style="${t.style}" to <html> in ${touched.join(", ")}`);
  console.log(`\n${bold("Next")}`);
  if (framework === "html") {
    console.log(`  1. In your page: <link rel="stylesheet" href="${css}"> and <html data-vin-style="${t.style}">`);
  } else {
    console.log(`  1. Import the CSS once, in your app's entry file: import "./${css.replace(/^src\//, "")}";`);
    if (!touched.length) console.log(`  2. Put data-vin-style="${t.style}" on your <html> tag.`);
  }
  console.log(`  ${touched.length || framework === "html" ? 2 : 3}. Add components: ${cyan("npx @vinish/ui add button card dialog")}`);
}

async function add(args, cwd, reg) {
  const names = args._;
  if (!names.length) throw new RegistryError("Name at least one component, e.g. `npx @vinish/ui add button`. See them all with `npx @vinish/ui list`.");
  let rl = null;
  const decide = tty() && !args.yes ? async (path) => {
    rl ??= createInterface({ input: process.stdin, output: process.stdout });
    const a = (await rl.question(`${yellow("?")} ${path} has your own changes. Replace it? ${dim("(y/N)")} `)).trim().toLowerCase();
    return a === "y" || a === "yes";
  } : null;
  try {
    const { results } = await addComponents({ cwd, reg, names, overwrite: !!args.overwrite, decide });
    for (const r of results) {
      const mark = { added: green("+"), updated: cyan("~"), unchanged: dim("="), skipped: yellow("!") }[r.status];
      console.log(`${mark} ${r.path} ${dim(r.status === "skipped" ? "kept yours (use --overwrite to replace)" : r.status)}`);
    }
  } finally { rl?.close(); }
}

async function style(args, cwd, reg) {
  const name = (args._[0] ?? "").toLowerCase();
  if (!OPTIONS.style.values.includes(name)) {
    const near = closest(name, OPTIONS.style.values);
    throw new RegistryError(`${name ? `Unknown style "${name}".` : "Name a style."}${near ? ` Did you mean "${near}"?` : ""} Choose from: ${OPTIONS.style.values.join(", ")}.`);
  }
  const cfg = await readConfig(cwd);
  if (args.accent) {
    const hex = normalizeHex(args.accent);
    if (!hex) throw new RegistryError(`"${args.accent}" isn't a colour.`);
    cfg.theme.accent = hex;
  }
  cfg.theme.style = name;
  await writeFile(join(cwd, cfg.css), await buildCss(reg, cfg.theme));
  await writeConfig(cwd, cfg);
  const touched = await applyHtmlAttributes(cwd, cfg.theme);
  console.log(`${green("✓")} Switched to ${bold(name)}: rewrote ${cfg.css}${touched.length ? ` and <html> in ${touched.join(", ")}` : ""}. Your components didn't change.`);
  if (!touched.length) console.log(`  Update your <html> tag: data-vin-style="${name}"`);
}

async function diff(args, cwd, reg) {
  const out = await diffComponents({ cwd, reg, names: args._ });
  if (!out.length) { console.log("No components yet. Add some with `npx @vinish/ui add <name>`."); return; }
  let changed = 0;
  for (const d of out) {
    if (d.missing) { console.log(`${yellow("!")} ${d.path} ${dim("is missing; `add` will bring it back")}`); changed++; continue; }
    if (!d.diff) { console.log(`${green("=")} ${d.path} ${dim("matches VinUI")}`); continue; }
    changed++;
    console.log(`${cyan("~")} ${bold(d.path)}`);
    for (const line of d.diff.split("\n")) console.log(line.startsWith("+") && !line.startsWith("+++") ? green(line) : line.startsWith("-") && !line.startsWith("---") ? red(line) : line.startsWith("@@") ? cyan(line) : line);
  }
  if (changed) console.log(dim(`\n"-" is your copy, "+" is VinUI's. To take VinUI's version: npx @vinish/ui add <name> --overwrite`));
  process.exitCode = changed ? 1 : 0;
}

async function list(args, cwd, reg) {
  const idx = await reg.index();
  let fw = args.framework;
  if (!fw) { try { fw = (await readConfig(cwd)).framework; } catch {} }
  if (args.json) { console.log(JSON.stringify(idx.components, null, 2)); return; }
  const byCat = new Map();
  for (const c of idx.components) byCat.set(c.category, [...(byCat.get(c.category) ?? []), c]);
  for (const [cat, items] of byCat) {
    console.log(bold(cat));
    for (const c of items) {
      const off = fw && !c.frameworks.includes(fw);
      console.log(`  ${(off ? dim : cyan)(c.name.padEnd(18))} ${off ? dim(`${c.description} (not for ${fw} yet)`) : c.description}`);
    }
  }
  console.log(dim(`\n${idx.components.length} components. Add one: npx @vinish/ui add <name>`));
}

/* ───────────────────────── entry ───────────────────────── */

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const cmd = args._.shift();
  if (args.version) { console.log(VERSION); return; }
  if (!cmd || args.help || cmd === "help") { console.log(HELP); return; }
  const cwd = args.cwd ? resolve(String(args.cwd)) : process.cwd();
  if (cmd === "mcp") {
    const { serveMcp } = await import("./mcp.mjs");
    return serveMcp({ cwd, registrySource: args.registry });
  }
  const reg = registry(args.registry);
  const commands = { init, add, style, diff, list };
  if (!commands[cmd]) {
    const near = closest(cmd, [...Object.keys(commands), "mcp"]);
    throw new RegistryError(`Unknown command "${cmd}".${near ? ` Did you mean \`${near}\`?` : ""} Run \`npx @vinish/ui --help\`.`);
  }
  await commands[cmd](args, cwd, reg);
}

export function run() {
  main().catch((e) => {
    console.error(red("✗ ") + (e instanceof RegistryError || e.code === "ENOENT" ? e.message : e.stack ?? e));
    process.exitCode = 1;
  });
}
