/*
 * VinUI MCP server (Model Context Protocol, stdio transport: one JSON-RPC message per line).
 * Gives AI coding tools the real, current VinUI code in the project's own framework and style.
 *
 *   { "mcpServers": { "vinui": { "command": "npx", "args": ["-y", "@vinish/ui", "mcp"] } } }
 */
import { createInterface } from "node:readline";
import { registry, readConfig, addComponents, searchComponents, RegistryError, FRAMEWORK_IDS } from "./core.mjs";

const SERVER = { name: "vinui", title: "VinUI", version: "0.1.0" };
const PROTOCOLS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

const fw = { type: "string", enum: FRAMEWORK_IDS, description: "react, vue, svelte or html. Defaults to the project's vin.json, else react." };

export const TOOLS = [
  {
    name: "list_components",
    title: "List VinUI components",
    description: "Every VinUI component with its category, a one-line description and the frameworks it's available for.",
    inputSchema: { type: "object", properties: { category: { type: "string", description: "Only this category, e.g. Forms, Overlays, AI chat." } } },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  {
    name: "search_components",
    title: "Find a VinUI component",
    description: 'Find the right component for a need in plain words, e.g. "modal" → Dialog, "notification" → Toast.',
    inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  {
    name: "get_component",
    title: "Get a VinUI component's code",
    description: "The component's source for a framework, its props, accessibility notes and usage examples. Use the examples as the pattern; the styling comes from the project's vin.css, so don't add other CSS frameworks' classes.",
    inputSchema: { type: "object", properties: { name: { type: "string", description: "Component name, e.g. dialog" }, framework: fw }, required: ["name"] },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  {
    name: "list_styles",
    title: "List VinUI styles",
    description: "The 8 VinUI styles and what each one looks like.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  {
    name: "get_theme",
    title: "Read the project's VinUI setup",
    description: "The project's vin.json: framework, style, accent colour, component folder and the components already added.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
  },
  {
    name: "add_component",
    title: "Add VinUI components to the project",
    description: "Write components (and the ones they need) into the project's component folder, exactly like `npx @vinish/ui add`. Files the user changed are kept unless overwrite is true. Needs vin.json (run `npx @vinish/ui init` first).",
    inputSchema: {
      type: "object",
      properties: { names: { type: "array", items: { type: "string" }, minItems: 1 }, overwrite: { type: "boolean", description: "Replace files the user changed. Default false." } },
      required: ["names"],
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  },
];

/** The server's message handler, separate from stdio so tests can call it. */
export function createServer({ cwd = process.cwd(), registrySource } = {}) {
  const reg = registry(registrySource);
  const frameworkFor = async (asked) => {
    if (asked) {
      if (!FRAMEWORK_IDS.includes(asked)) throw new RegistryError(`Unknown framework "${asked}". Use one of: ${FRAMEWORK_IDS.join(", ")}.`);
      return asked;
    }
    try { return (await readConfig(cwd)).framework; } catch { return "react"; }
  };

  const tools = {
    async list_components({ category }) {
      const idx = await reg.index();
      const items = idx.components.filter((c) => !category || c.category.toLowerCase() === String(category).toLowerCase());
      if (!items.length) return `No components in "${category}". Categories: ${[...new Set(idx.components.map((c) => c.category))].join(", ")}.`;
      return items.map((c) => `- ${c.name} (${c.category}): ${c.description} [${c.frameworks.join(", ")}]`).join("\n");
    },
    async search_components({ query }) {
      const idx = await reg.index();
      const hits = searchComponents(idx.components, query).slice(0, 6);
      if (!hits.length) return `Nothing matches "${query}". Call list_components to see everything.`;
      return hits.map((c) => `- ${c.name}: ${c.description} [${c.frameworks.join(", ")}]`).join("\n");
    },
    async get_component({ name, framework }) {
      const f = await frameworkFor(framework);
      const e = await reg.component(f, String(name).toLowerCase());
      let style = "";
      try { const cfg = await readConfig(cwd); style = `The project uses the ${cfg.theme.style} style with accent ${cfg.theme.accent}; components pick it up from vin.css automatically.`; } catch {}
      const parts = [`# ${e.title} (${f})`, e.description, `Docs: ${e.docs}`, style];
      if (e.dependencies?.length) parts.push(`Needs: ${e.dependencies.join(", ")} (add_component adds them too).`);
      if (f === "html") parts.push(`Classes: ${e.classes.join(" ")}`, e.needsScript ? "Interactive: include vinui.js once (https://vinish.dev/ui/v1/vinui.js)." : "No JavaScript needed.");
      parts.push("## Props", "```json", JSON.stringify(e.props, null, 2), "```", "## Accessibility", ...e.a11y.map((a) => `- ${a}`));
      for (const file of e.files ?? []) parts.push(`## File: ${file.path}`, "```" + (f === "react" ? "tsx" : f), file.content.trimEnd(), "```");
      parts.push("## Examples");
      for (const ex of e.examples) parts.push(`### ${ex.title}`, ex.description, "```" + (f === "react" ? "tsx" : f), ex.code.trimEnd(), "```");
      return parts.filter(Boolean).join("\n\n");
    },
    async list_styles() {
      const styles = await reg.styles();
      return styles.map((s) => `- ${s.id} (${s.name}): ${s.description}`).join("\n") + "\n\nSwitch with `npx @vinish/ui style <id>`.";
    },
    async get_theme() {
      try {
        const cfg = await readConfig(cwd);
        return JSON.stringify({ framework: cfg.framework, ...cfg.theme, path: cfg.path, css: cfg.css, components: Object.keys(cfg.components) }, null, 2);
      } catch (e) { return `${e.message} The project isn't set up for VinUI yet.`; }
    },
    async add_component({ names, overwrite }) {
      const list = Array.isArray(names) ? names : [names];
      const { results } = await addComponents({ cwd, reg, names: list, overwrite: !!overwrite });
      return results.map((r) => `${r.status}: ${r.path}${r.status === "skipped" ? " (the user changed it; pass overwrite: true to replace)" : ""}`).join("\n");
    },
  };

  return async function handle(msg) {
    const { id, method, params } = msg;
    const reply = (result) => (id === undefined ? null : { jsonrpc: "2.0", id, result });
    const fail = (code, message) => (id === undefined ? null : { jsonrpc: "2.0", id, error: { code, message } });
    switch (method) {
      case "initialize": {
        const asked = params?.protocolVersion;
        return reply({
          protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0],
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER,
          instructions: "VinUI components: call search_components or list_components, then get_component for the code in the project's framework. Use add_component to write files (ask the user first). Styling comes from vin.css; keep the vin-* classes.",
        });
      }
      case "ping": return reply({});
      case "tools/list": return reply({ tools: TOOLS });
      case "tools/call": {
        const tool = tools[params?.name];
        if (!tool) return fail(-32602, `Unknown tool: ${params?.name}`);
        try {
          const text = await tool(params.arguments ?? {});
          return reply({ content: [{ type: "text", text }], isError: false });
        } catch (e) {
          return reply({ content: [{ type: "text", text: e.message }], isError: true });
        }
      }
      default:
        if (method?.startsWith("notifications/")) return null;
        return fail(-32601, `Method not found: ${method}`);
    }
  };
}

/** Run over stdin/stdout. Logs go to stderr, never stdout (stdout is the protocol). */
export function serveMcp(opts) {
  const handle = createServer(opts);
  const rl = createInterface({ input: process.stdin });
  const send = (m) => process.stdout.write(JSON.stringify(m) + "\n");
  rl.on("line", async (line) => {
    if (!line.trim()) return;
    let msg;
    try { msg = JSON.parse(line); } catch { send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }); return; }
    const batch = Array.isArray(msg) ? msg : [msg];
    for (const m of batch) { const out = await handle(m); if (out) send(out); }
  });
  console.error("VinUI MCP server ready (stdio).");
  return new Promise((resolve) => rl.on("close", resolve));
}
