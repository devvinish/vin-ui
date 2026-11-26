/*
 * VinUI blocks: whole sections (sign-in, dashboard, pricing…) built from VinUI components.
 * Each block is written once, as HTML (packages/html/blocks/<name>.html, listed in blocks.json),
 * and its React, Vue and Svelte versions are generated from that HTML here, so the four never drift.
 *
 * A chart inside a block is written as
 *   <!-- vin:chart {"type":"area", …Chart props as JSON…} -->  …static chart markup…  <!-- /vin:chart -->
 * The HTML version keeps the static markup; the others get the Chart component with those props.
 * Used by the docs site (Blocks page), the registry build (CLI) and the tests.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "packages/html/blocks");

export const BLOCK_CATEGORIES = ["Authentication", "Dashboard", "Marketing"];

/** [{ name, title, category, description, html }] in the order of blocks.json. */
export function loadBlocks() {
  const list = JSON.parse(readFileSync(join(DIR, "blocks.json"), "utf8"));
  const files = new Set(readdirSync(DIR));
  return list.map((b) => {
    if (!files.has(`${b.name}.html`)) throw new Error(`VinUI blocks: ${b.name}.html is missing`);
    return { ...b, html: readFileSync(join(DIR, `${b.name}.html`), "utf8") };
  });
}

const CHART = /^([ \t]*)<!-- vin:chart (\{.*\}) -->\n[\s\S]*?<!-- \/vin:chart -->\n?/gm;

/** The HTML users copy: the chart markers removed, the static chart kept. */
export function blockHtml(html) {
  return html.replace(/^[ \t]*<!-- \/?vin:chart.*-->\n/gm, "");
}

/** Chart configs used by a block, in order. */
export const blockCharts = (html) => [...html.matchAll(CHART)].map((m) => JSON.parse(m[2]));
/** Components a block needs besides vin.css. */
export const blockDependencies = (html) => (blockCharts(html).length ? ["chart"] : []);

const pascal = (name) => name.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
const camel = (prop) => prop.startsWith("--") ? JSON.stringify(prop) : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const val = (v) => (typeof v === "string" ? JSON.stringify(v) : String(v));
const rowJs = (r) => `{ ${Object.entries(r).map(([k, v]) => `${k}: ${val(v)}`).join(", ")} }`;
const dataJs = (c, pad) => `[\n${c.data.map((r) => `${pad}  ${rowJs(r)},`).join("\n")}\n${pad}]`;
const seriesJs = (c, q) => `[${c.series.map((s) => `{ key: ${q}${s.key}${q}, label: ${q}${s.label}${q} }`).join(", ")}]`;

/** Chart props as attributes, for each framework. */
function chartProps(c, fw) {
  const kebab = fw === "vue";
  const bind = (k, v) => (fw === "vue" ? `:${k}="${v}"` : `${k}={${v}}`);
  return [
    `type="${c.type}"`, c.stacked && "stacked", c.curve && `curve="${c.curve}"`,
    c.centerLabel && `${kebab ? "center-label" : "centerLabel"}="${c.centerLabel}"`,
    `label="${c.label}"`, bind("data", c.name), `index="${c.index}"`,
    `${kebab ? "index-label" : "indexLabel"}="${c.indexLabel}"`,
    bind("series", seriesJs(c, fw === "vue" ? "'" : '"')),
  ].filter(Boolean);
}

const attrRe = /([^\s=]+)(?:="([^"]*)")?/g;
const JSX_NAMES = {
  class: "className", for: "htmlFor", tabindex: "tabIndex", autocomplete: "autoComplete", inputmode: "inputMode",
  maxlength: "maxLength", minlength: "minLength", readonly: "readOnly", colspan: "colSpan", rowspan: "rowSpan",
  checked: "defaultChecked", "stroke-width": "strokeWidth", "stroke-linecap": "strokeLinecap", "stroke-linejoin": "strokeLinejoin",
  "fill-rule": "fillRule", "clip-rule": "clipRule", enctype: "encType", novalidate: "noValidate", spellcheck: "spellCheck",
};

/** One HTML start tag's attributes, as JSX. */
function jsxAttrs(attrs) {
  return attrs.replace(attrRe, (all, name, value) => {
    if (!name || name === "/") return all;
    const n = JSX_NAMES[name] ?? name;
    if (name === "value" && /<input|<textarea/.test(attrs)) return `defaultValue="${value}"`;
    if (name === "style") {
      const pairs = value.split(";").map((d) => d.trim()).filter(Boolean).map((d) => {
        const i = d.indexOf(":"), prop = d.slice(0, i).trim();
        // Custom properties need a cast in TypeScript, as in the components ("--vin-value").
        return `${prop.startsWith("--") ? `[${JSON.stringify(prop)} as string]` : camel(prop)}: ${JSON.stringify(d.slice(i + 1).trim())}`;
      });
      return `style={{ ${pairs.join(", ")} }}`;
    }
    if (NUMERIC.has(n) && /^\d+$/.test(value ?? "")) return `${n}={${value}}`;
    return value === undefined ? n : `${n}="${value}"`;
  });
}

const NUMERIC = new Set(["aria-valuemin", "aria-valuemax", "aria-valuenow", "tabIndex", "rows", "cols", "minLength", "maxLength", "colSpan", "rowSpan", "size", "span"]);
const VOID = /^(input|img|br|hr|meta|link|source|col|wbr)$/;

function toJsx(html) {
  return html
    .replace(/<([a-zA-Z][\w-]*)(\s[^>]*?)?(\/?)>/g, (all, tag, attrs = "", self) => {
      const a = jsxAttrs(attrs.replace(/\s+\/$/, ""));
      return `<${tag}${a}${self || VOID.test(tag) ? " />" : ">"}`.replace(/\s+\/>$/, " />");
    })
    .replace(/<!--([\s\S]*?)-->/g, "{/*$1*/}");
}

const indent = (text, pad) => text.split("\n").map((l) => (l ? pad + l : l)).join("\n");

/** Splits out the charts: [{ pad, config }] and the HTML with a placeholder line per chart. */
function withChartSlots(html) {
  const charts = [];
  const body = html.replace(CHART, (_, pad, json) => { charts.push({ pad, config: JSON.parse(json) }); return `${pad}@@CHART${charts.length - 1}@@\n`; });
  return { charts, body };
}

export function blockReact(block) {
  const { charts, body } = withChartSlots(block.html);
  let jsx = indent(toJsx(body.trimEnd()), "    ");
  charts.forEach(({ config }, i) => {
    jsx = jsx.replace(new RegExp(`^(\\s*)@@CHART${i}@@`, "m"), (_, pad) =>
      [`${pad}<Chart`, ...chartProps(config, "react").map((p) => `${pad}  ${p}`), `${pad}/>`].join("\n"));
  });
  const head = charts.length
    ? [`import { Chart } from "@/components/vin/chart";`, "", ...charts.map(({ config }) => `const ${config.name} = ${dataJs(config, "")};`), ""]
    : [];
  return [`/* VinUI block: ${block.title}. Needs vin.css${charts.length ? " and the Chart component" : ""}. */`, ...head,
    `export function ${pascal(block.name)}() {`, "  return (", jsx, "  );", "}", ""].join("\n");
}

export function blockVue(block) {
  const { charts, body } = withChartSlots(block.html);
  let tpl = indent(body.trimEnd(), "  ");
  charts.forEach(({ config }, i) => {
    tpl = tpl.replace(new RegExp(`^(\\s*)@@CHART${i}@@`, "m"), (_, pad) =>
      [`${pad}<Chart`, ...chartProps(config, "vue").map((p) => `${pad}  ${p}`), `${pad}/>`].join("\n"));
  });
  const script = charts.length
    ? [`<script setup lang="ts">`, `import Chart from "@/components/vin/chart.vue";`, "", ...charts.map(({ config }) => `const ${config.name} = ${dataJs(config, "")};`), `</script>`, ""]
    : [];
  return [`<!-- VinUI block: ${block.title}. Needs vin.css${charts.length ? " and the Chart component" : ""}. -->`, ...script, "<template>", tpl, "</template>", ""].join("\n");
}

export function blockSvelte(block, lib = "$lib/components/vin") {
  const { charts, body } = withChartSlots(block.html);
  let tpl = body.trimEnd().replace(/<([a-zA-Z][\w-]*)(\s[^>]*?)?\s*\/>/g, (all, tag, attrs = "") => (VOID.test(tag) || /^(path|rect|circle|line|polyline|polygon|ellipse)$/.test(tag) ? all : `<${tag}${attrs}></${tag}>`));
  // A scrolling region must be reachable by keyboard, as in the Table component.
  tpl = tpl.replace(/^([ \t]*)(<div [^>]*role="region"[^>]*tabindex="0")/gm, "$1<!-- svelte-ignore a11y_no_noninteractive_tabindex (the frame scrolls, so keyboard users must be able to reach it) -->\n$1$2");
  charts.forEach(({ config }, i) => {
    tpl = tpl.replace(new RegExp(`^(\\s*)@@CHART${i}@@`, "m"), (_, pad) =>
      [`${pad}<Chart`, ...chartProps(config, "svelte").map((p) => `${pad}  ${p}`), `${pad}/>`].join("\n"));
  });
  const script = charts.length
    ? [`<script lang="ts">`, `  import Chart from "${lib}/chart.svelte";`, "", ...charts.map(({ config }) => `  const ${config.name} = ${dataJs(config, "  ")};`), `</script>`, ""]
    : [];
  return [`<!-- VinUI block: ${block.title}. Needs vin.css${charts.length ? " and the Chart component" : ""}. -->`, ...script, tpl, ""].join("\n");
}

/** Generated files for every framework: { "packages/react/blocks/login-01.tsx": code, … }. */
export function generatedBlockFiles() {
  const out = {};
  for (const b of loadBlocks()) {
    out[`packages/react/blocks/${b.name}.tsx`] = blockReact(b);
    out[`packages/vue/blocks/${b.name}.vue`] = blockVue(b);
    out[`packages/svelte/blocks/${b.name}.svelte`] = blockSvelte(b, "@/components/vin");
  }
  return out;
}

// `node scripts/blocks.mjs` writes the React, Vue and Svelte versions next to each package.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { mkdirSync, writeFileSync, rmSync } = await import("node:fs");
  for (const fw of ["react", "vue", "svelte"]) { rmSync(join(ROOT, `packages/${fw}/blocks`), { recursive: true, force: true }); mkdirSync(join(ROOT, `packages/${fw}/blocks`), { recursive: true }); }
  const files = generatedBlockFiles();
  for (const [p, code] of Object.entries(files)) writeFileSync(join(ROOT, p), code);
  console.log(`VinUI blocks: wrote ${Object.keys(files).length} files.`);
}
