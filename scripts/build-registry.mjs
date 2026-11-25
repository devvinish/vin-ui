#!/usr/bin/env node
/*
 * Builds everything machines read, from the same sources as the website:
 *   r/index.json                     every component, its category and frameworks
 *   r/styles.json                    the 8 styles
 *   r/{framework}/{name}.json        code + examples + props for the CLI and the MCP server
 *   v1/{style}.css, v1/vinui.css     versioned CSS for plain-HTML users (one <link>)
 *   v1/vinui.js                      the small behaviour script for plain HTML
 *   llms.txt, llms-full.txt          plain-text index for AI tools
 *
 * Usage: node scripts/build-registry.mjs [outDir]   (default: apps/docs/dist/ui)
 * The CLI tests also call buildRegistry() directly, without touching the disk.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://vinish.dev/ui";
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const has = (p) => existsSync(join(ROOT, p));

/** Where each framework keeps a component's files and examples. */
export const FRAMEWORKS = {
  html: { label: "HTML", ext: "html" },
  react: { label: "React", ext: "tsx", src: "packages/react/src", examples: "packages/react/examples" },
  vue: { label: "Vue", ext: "vue", src: "packages/vue/src", examples: "packages/vue/examples" },
  svelte: { label: "Svelte", ext: "svelte", src: "packages/svelte/src", examples: "packages/svelte/examples" },
};

export function loadSpecs() {
  return readdirSync(join(ROOT, "spec")).filter((f) => f.endsWith(".json")).sort()
    .map((f) => JSON.parse(read(`spec/${f}`)));
}

/** The attributes that need vinui.js in plain HTML (read from vinui.js itself). */
function scriptAttributes() {
  return [...read("packages/html/vinui.js").matchAll(/"(data-vin-[a-z-]+)": init/g)].map((m) => m[1]);
}

/** Sibling component files a component imports ("./dialog"), plus what its spec lists. */
function siblingDeps(code, spec) {
  const found = [...code.matchAll(/from "\.\/([a-z-]+)(?:\.[a-z]+)?"/g)].map((m) => m[1]);
  return [...new Set([...(spec.dependencies ?? []), ...found])];
}

/** Every file of a component for one framework, or null if that framework doesn't have it yet. */
function frameworkEntry(spec, fw, scriptAttrs, specNames) {
  const name = spec.name;
  const base = {
    name, title: spec.title, category: spec.category, description: spec.description, framework: fw,
    docs: `${SITE}/components/${name}/`, props: spec.props, a11y: spec.a11y,
  };
  if (fw === "html") {
    if (!has(`packages/html/src/${name}`)) return null;
    const examples = spec.examples.map((ex) => ({ ...ex, code: read(`packages/html/src/${name}/${ex.id}.html`) }));
    const needsScript = examples.some((ex) => scriptAttrs.some((a) => ex.code.includes(a)));
    return { ...base, classes: spec.classes, needsScript, dependencies: spec.dependencies ?? [], files: [], examples };
  }
  const F = FRAMEWORKS[fw];
  const file = `${F.src}/${name}.${F.ext}`;
  if (!has(file)) return null;
  // Svelte has one component per file, so a component's parts live next to it
  // (card-header.svelte). A part belongs to the longest component name it starts with,
  // so toggle-group-item.svelte goes with toggle-group, not toggle.
  const paths = [`${name}.${F.ext}`, ...partFiles(F, name, specNames)];
  const files = paths.map((p) => ({ path: p, content: read(`${F.src}/${p}`) }));
  const examples = spec.examples
    .filter((ex) => has(`${F.examples}/${name}/${ex.id}.${F.ext}`))
    .map((ex) => ({ ...ex, code: read(`${F.examples}/${name}/${ex.id}.${F.ext}`) }));
  const deps = siblingDeps(files.map((f) => f.content).join("\n"), spec).filter((d) => d !== name && specNames.includes(d));
  return {
    ...base, components: spec[fw]?.components ?? spec.react?.components ?? [],
    dependencies: deps, files, examples,
  };
}

/** The extra part files of a component (Svelte), e.g. card → card-header.svelte, card-title.svelte. */
function partFiles(F, name, specNames) {
  return readdirSync(join(ROOT, F.src))
    .filter((f) => f.endsWith(`.${F.ext}`) && f.startsWith(`${name}-`))
    .filter((f) => {
      const base = f.slice(0, -(F.ext.length + 1));
      if (specNames.includes(base)) return false;
      const owner = specNames.filter((n) => base.startsWith(`${n}-`)).sort((a, b) => b.length - a.length)[0];
      return owner === name;
    })
    .sort();
}

/** Builds the registry in memory: { "path/inside/site": string }. */
export function buildRegistry() {
  const specs = loadSpecs();
  const scriptAttrs = scriptAttributes();
  const specNames = specs.map((s) => s.name);
  const out = {};
  const index = [];
  for (const spec of specs) {
    const frameworks = [];
    for (const fw of Object.keys(FRAMEWORKS)) {
      const entry = frameworkEntry(spec, fw, scriptAttrs, specNames);
      if (!entry) continue;
      frameworks.push(fw);
      out[`r/${fw}/${spec.name}.json`] = JSON.stringify(entry, null, 2) + "\n";
    }
    index.push({ name: spec.name, title: spec.title, category: spec.category, description: spec.description, frameworks, dependencies: spec.dependencies ?? [] });
  }
  const styles = JSON.parse(read("packages/styles/dist/styles.json"));
  const { version } = JSON.parse(read("packages/styles/package.json"));
  out["r/index.json"] = JSON.stringify({ version, site: SITE, components: index }, null, 2) + "\n";
  out["r/styles.json"] = JSON.stringify(styles, null, 2) + "\n";
  out["r/vin.schema.json"] = JSON.stringify(vinSchema(styles), null, 2) + "\n";
  out["llms.txt"] = llms(index, styles, false, specs);
  out["llms-full.txt"] = llms(index, styles, true, specs);
  return out;
}

/** JSON Schema for vin.json, so editors can check and autocomplete it. */
function vinSchema(styles) {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `${SITE}/r/vin.schema.json`,
    title: "VinUI project settings (vin.json)",
    type: "object",
    required: ["framework", "style", "path"],
    properties: {
      $schema: { type: "string" },
      framework: { enum: Object.keys(FRAMEWORKS), description: "Which version of the components to add." },
      style: { enum: styles.map((s) => s.id), description: "The look. Switch with `npx @vinish/ui style <name>`." },
      accent: { type: "string", pattern: "^#[0-9a-fA-F]{6}$", description: "Accent colour as #rrggbb." },
      radius: { enum: ["default", "none", "sm", "md", "lg", "full"] },
      gray: { enum: ["neutral", "slate", "stone"] },
      font: { enum: ["default", "inter", "geist", "system", "mono", "custom"] },
      fontFamily: { type: "string" },
      density: { enum: ["compact", "default", "comfortable"] },
      motion: { enum: ["full", "reduced", "off"] },
      path: { type: "string", description: "Folder the components are written to." },
      css: { type: "string", description: "Where vin.css is written." },
      components: { type: "object", additionalProperties: { type: "string" }, description: "Components added, with the VinUI version they came from." },
    },
    additionalProperties: false,
  };
}

function llms(index, styles, full, specs) {
  const lines = [
    "# VinUI",
    "",
    "> Free, MIT-licensed UI components in 8 styles, for HTML, React, Vue and Svelte. Any accent colour, light and dark. The code is copied into your project, so you own it.",
    "",
    "Install: `npx @vinish/ui init` then `npx @vinish/ui add <name>`. Plain HTML: `<link rel=\"stylesheet\" href=\"https://vinish.dev/ui/v1/<style>.css\">`, put `data-vin-style=\"<style>\"` on <html>, copy the HTML from the docs, and add `<script src=\"https://vinish.dev/ui/v1/vinui.js\" defer></script>` for interactive components.",
    "Theme: `--vin-accent` (any colour) and data attributes on <html>: data-vin-style, data-vin-mode (light|dark), data-vin-radius, data-vin-density.",
    "AI tools: run the MCP server with `npx -y @vinish/ui mcp`. Machine-readable code for each component: " + `${SITE}/r/{html|react|vue|svelte}/{name}.json`,
    "",
    "## Styles",
    "",
    ...styles.map((s) => `- ${s.name} (\`${s.id}\`): ${s.description}`),
    "",
  ];
  const byCat = Map.groupBy ? Map.groupBy(index, (c) => c.category) : index.reduce((m, c) => m.set(c.category, [...(m.get(c.category) ?? []), c]), new Map());
  for (const [cat, list] of byCat) {
    lines.push(`## ${cat}`, "");
    for (const c of list) {
      lines.push(`- [${c.title}](${SITE}/components/${c.name}/): ${c.description} Frameworks: ${c.frameworks.join(", ")}.`);
      if (full) {
        const spec = specs.find((s) => s.name === c.name);
        const html = spec.examples[0] && has(`packages/html/src/${c.name}/${spec.examples[0].id}.html`) ? read(`packages/html/src/${c.name}/${spec.examples[0].id}.html`) : "";
        lines.push("", `  Classes: ${spec.classes.join(" ")}`);
        lines.push(`  Accessibility: ${spec.a11y.join(" ")}`);
        if (html) lines.push("", "  ```html", ...html.trimEnd().split("\n").map((l) => "  " + l), "  ```");
        lines.push("");
      }
    }
    lines.push("");
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

/** Writes the registry plus the versioned CSS and script into outDir. */
export function writeRegistry(outDir = join(ROOT, "apps/docs/dist/ui")) {
  const files = buildRegistry();
  for (const [p, content] of Object.entries(files)) {
    mkdirSync(dirname(join(outDir, p)), { recursive: true });
    writeFileSync(join(outDir, p), content);
  }
  mkdirSync(join(outDir, "v1"), { recursive: true });
  const stylesDir = join(ROOT, "packages/styles/dist/styles");
  for (const f of readdirSync(stylesDir)) copyFileSync(join(stylesDir, f), join(outDir, "v1", f));
  copyFileSync(join(ROOT, "packages/styles/dist/vinui.css"), join(outDir, "v1/vinui.css"));
  copyFileSync(join(ROOT, "packages/html/vinui.js"), join(outDir, "v1/vinui.js"));
  return Object.keys(files).length;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const n = writeRegistry(process.argv[2]);
  console.log(`registry: wrote ${n} files + v1/ CSS and vinui.js`);
}
