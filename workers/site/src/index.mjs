/*
 * vinish.dev/ui* on Cloudflare.
 *   /ui/mcp   the VinUI MCP server over HTTP (Streamable HTTP transport, stateless, read-only)
 *   anything  the static site, served by the assets binding (wrangler.jsonc)
 *
 * The MCP tools are the same code as `npx @vinish/ui mcp`, minus the two that need the user's
 * files on disk (get_theme, add_component). Components are read from this site's own /ui/r/ JSON.
 */
import { createMcpHandler } from "../../../packages/cli/src/mcp-core.mjs";
import { makeRegistry, RegistryError } from "../../../packages/cli/src/shared.mjs";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, GET, OPTIONS",
  "access-control-allow-headers": "content-type, accept, authorization, mcp-protocol-version, mcp-session-id, last-event-id",
  "access-control-expose-headers": "mcp-session-id",
  "access-control-max-age": "86400",
};
const ABOUT = "VinUI MCP server. Add https://vinish.dev/ui/mcp to your AI tool as a remote MCP server (Streamable HTTP). Docs: https://vinish.dev/ui/docs/mcp/";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...CORS } });
const rpcError = (code, message, status = 400) => json({ jsonrpc: "2.0", id: null, error: { code, message } }, status);

/** Read the registry from the site's own files. */
function assetsRegistry(env, origin) {
  return makeRegistry(async (path) => {
    const res = await env.ASSETS.fetch(new Request(`${origin}/ui/${path}`));
    if (res.status === 404) throw new RegistryError(`Not found in the registry: ${path}`, 404);
    if (!res.ok) throw new RegistryError(`The registry answered ${res.status} for ${path}.`);
    return res.text();
  }, `${origin}/ui`);
}

export async function handleMcp(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (request.method !== "POST") {
    // No server-sent stream: this server never sends requests or notifications of its own.
    return new Response(ABOUT + "\n", { status: 405, headers: { allow: "POST, OPTIONS", "content-type": "text/plain; charset=utf-8", ...CORS } });
  }
  let msg;
  try { msg = await request.json(); } catch { return rpcError(-32700, "Parse error"); }
  const batch = Array.isArray(msg);
  const list = batch ? msg : [msg];
  if (!list.length || list.some((m) => !m || typeof m !== "object" || m.jsonrpc !== "2.0")) return rpcError(-32600, "Invalid Request");

  const origin = new URL(request.url).origin;
  const handle = createMcpHandler({ reg: assetsRegistry(env, origin) });
  const out = (await Promise.all(list.map((m) => handle(m)))).filter(Boolean);
  // Only notifications or responses: nothing to answer.
  if (!out.length) return new Response(null, { status: 202, headers: CORS });
  return json(batch ? out : out[0]);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/ui/mcp" || pathname === "/ui/mcp/") return handleMcp(request, env);
    return env.ASSETS.fetch(request);
  },
};
