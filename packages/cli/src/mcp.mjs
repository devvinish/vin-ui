/*
 * VinUI MCP server (Model Context Protocol, stdio transport: one JSON-RPC message per line).
 * Gives AI coding tools the real, current VinUI code in the project's own framework and style.
 *
 *   { "mcpServers": { "vinui": { "command": "npx", "args": ["-y", "@vinish/ui", "mcp"] } } }
 */
import { createInterface } from "node:readline";
import { registry, readConfig, addComponents } from "./core.mjs";
import { createMcpHandler, TOOLS } from "./mcp-core.mjs";

export { TOOLS };

/** The server's message handler for a project folder, separate from stdio so tests can call it. */
export function createServer({ cwd = process.cwd(), registrySource } = {}) {
  const reg = registry(registrySource);
  return createMcpHandler({
    reg,
    project: { readConfig: () => readConfig(cwd), add: (names, overwrite) => addComponents({ cwd, reg, names, overwrite }) },
  });
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
