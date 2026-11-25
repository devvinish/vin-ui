/*
 * VinUI MCP server: the protocol and the tools, with no Node.js imports, so the same code runs
 * in the stdio server (mcp.mjs) and in the remote server at https://vinish.dev/ui/mcp (a Cloudflare Worker).
 */
import { RegistryError, FRAMEWORK_IDS, searchComponents } from "./shared.mjs";

export const SERVER = { name: "vinui", title: "VinUI", version: "0.1.0" };
export const PROTOCOLS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

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


/** Tools that need the user's project on disk; the remote server leaves them out. */
export const LOCAL_ONLY = ["get_theme", "add_component"];

/**
 * The JSON-RPC message handler over a registry. `project` is the local project (stdio server
 * only): { readConfig(), add(names, overwrite) }. Without it (the remote server) the tools that
 * read or write the user's files are left out, and `framework` defaults to react.
 */
export function createMcpHandler({ reg, project = null, server = SERVER }) {
  const readConfig = async () => { if (!project) throw new Error("No project."); return project.readConfig(); };
  const frameworkFor = async (asked) => {
    if (asked) {
      if (!FRAMEWORK_IDS.includes(asked)) throw new RegistryError(`Unknown framework "${asked}". Use one of: ${FRAMEWORK_IDS.join(", ")}.`);
      return asked;
    }
    try { return (await readConfig()).framework; } catch { return "react"; }
  };
  const tools_list = project ? TOOLS : TOOLS.filter((t) => !LOCAL_ONLY.includes(t.name));

  const NAME = /^[a-z0-9][a-z0-9-]{0,39}$/;
  const short = (v, what) => { const s = String(v ?? ""); if (s.length > 200) throw new Error(`${what} is too long (200 characters at most).`); return s; };

  const tools = {
    async list_components({ category }) {
      category = category == null ? category : short(category, "category");
      const idx = await reg.index();
      const items = idx.components.filter((c) => !category || c.category.toLowerCase() === String(category).toLowerCase());
      if (!items.length) return `No components in "${category}". Categories: ${[...new Set(idx.components.map((c) => c.category))].join(", ")}.`;
      return items.map((c) => `- ${c.name} (${c.category}): ${c.description} [${c.frameworks.join(", ")}]`).join("\n");
    },
    async search_components({ query }) {
      query = short(query, "query");
      const idx = await reg.index();
      const hits = searchComponents(idx.components, query).slice(0, 6);
      if (!hits.length) return `Nothing matches "${query}". Call list_components to see everything.`;
      return hits.map((c) => `- ${c.name}: ${c.description} [${c.frameworks.join(", ")}]`).join("\n");
    },
    async get_component({ name, framework }) {
      const f = await frameworkFor(framework);
      const slug = String(name ?? "").trim().toLowerCase();
      if (!NAME.test(slug)) throw new Error(`"${short(name, "name").slice(0, 40)}" isn't a component name. Names look like "dialog" or "date-picker"; call list_components to see them.`);
      const e = await reg.component(f, slug);
      let style = "";
      try { const cfg = await readConfig(); style = `The project uses the ${cfg.theme.style} style with accent ${cfg.theme.accent}; components pick it up from vin.css automatically.`; } catch {}
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
        const cfg = await readConfig();
        return JSON.stringify({ framework: cfg.framework, ...cfg.theme, path: cfg.path, css: cfg.css, components: Object.keys(cfg.components) }, null, 2);
      } catch (e) { return `${e.message} The project isn't set up for VinUI yet.`; }
    },
    async add_component({ names, overwrite }) {
      const list = Array.isArray(names) ? names : [names];
      const { results } = await project.add(list, !!overwrite);
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
          serverInfo: server,
          instructions: project
            ? "VinUI components: call search_components or list_components, then get_component for the code in the project's framework. Use add_component to write files (ask the user first). Styling comes from vin.css; keep the vin-* classes."
            : "VinUI components: call search_components or list_components, then get_component with the project's framework (react, vue, svelte or html). Tell the user to run `npx @vinish/ui add <name>` to add it, or write the files from get_component. Styling comes from vin.css; keep the vin-* classes.",
        });
      }
      case "ping": return reply({});
      case "tools/list": return reply({ tools: tools_list });
      case "tools/call": {
        const tool = tools_list.some((t) => t.name === params?.name) ? tools[params.name] : null;
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

