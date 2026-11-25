// Programmatic API (the CLI and MCP server are built on these).
export * from "./core.mjs";
export { main } from "./cli.mjs";
export { createServer, serveMcp, TOOLS } from "./mcp.mjs";
