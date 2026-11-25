// The Worker, run in Node with the built site standing in for the assets binding.
// Needs `npm run build` at the repo root first (it reads apps/docs/dist).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import worker from "../src/index.mjs";

const dist = new URL("../../../apps/docs/dist/", import.meta.url);
const env = {
  ASSETS: {
    async fetch(req) {
      const path = decodeURIComponent(new URL(req.url).pathname).replace(/^\//, "");
      try { return new Response(await readFile(new URL(path, dist))); } catch { return new Response("Not found", { status: 404 }); }
    },
  },
};
const call = (body, init = {}) =>
  worker.fetch(new Request("https://vinish.dev/ui/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify(body), ...init }), env);

test("initialize answers with the asked protocol and the read-only instructions", async () => {
  const res = await call({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "1" } } });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
  const { result } = await res.json();
  assert.equal(result.protocolVersion, "2025-06-18");
  assert.equal(result.serverInfo.name, "vinui");
  assert.match(result.instructions, /npx @vinish\/ui add/);
});

test("tools/list leaves out the tools that need the user's files", async () => {
  const { result } = await (await call({ jsonrpc: "2.0", id: 2, method: "tools/list" })).json();
  const names = result.tools.map((t) => t.name);
  assert.deepEqual(names.sort(), ["get_component", "list_components", "list_styles", "search_components"]);
  const res = await (await call({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "add_component", arguments: { names: ["button"] } } })).json();
  assert.equal(res.error.code, -32602);
});

test("tools read the site's registry", async () => {
  const list = await (await call({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "list_components", arguments: {} } })).json();
  assert.match(list.result.content[0].text, /- dialog \(Overlays\)/);
  const found = await (await call({ jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "search_components", arguments: { query: "modal" } } })).json();
  assert.match(found.result.content[0].text.split("\n")[0], /dialog/);
  const comp = await (await call({ jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "get_component", arguments: { name: "button", framework: "react" } } })).json();
  assert.equal(comp.result.isError, false);
  assert.match(comp.result.content[0].text, /export function Button/);
  const typo = await (await call({ jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "get_component", arguments: { name: "buton" } } })).json();
  assert.equal(typo.result.isError, true);
  assert.match(typo.result.content[0].text, /Did you mean "button"/);
});

test("batches, notifications, bad JSON and other methods", async () => {
  const batch = await (await call([{ jsonrpc: "2.0", id: 1, method: "ping" }, { jsonrpc: "2.0", method: "notifications/initialized" }])).json();
  assert.deepEqual(batch, [{ jsonrpc: "2.0", id: 1, result: {} }]);
  assert.equal((await call({ jsonrpc: "2.0", method: "notifications/initialized" })).status, 202);
  const bad = await worker.fetch(new Request("https://vinish.dev/ui/mcp", { method: "POST", body: "{nope" }), env);
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).error.code, -32700);
  const get = await worker.fetch(new Request("https://vinish.dev/ui/mcp"), env);
  assert.equal(get.status, 405);
  const pre = await worker.fetch(new Request("https://vinish.dev/ui/mcp", { method: "OPTIONS" }), env);
  assert.equal(pre.status, 204);
});

test("everything else is the static site", async () => {
  const res = await worker.fetch(new Request("https://vinish.dev/ui/llms.txt"), env);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /^# VinUI/);
});
