/*
 * Serves wp/preview (the VinUI pages inside a copy of a live vinish.dev page) the way vinish.dev will:
 * the file folders from the built site (as Cloudflare does), every other /ui URL from the preview (as WordPress does).
 * `node scripts/wp-preview-server.mjs [port]` (default 4350). Used by tests/wp.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "apps/docs/dist");
const PREVIEW = path.join(ROOT, "wp/preview");
const FILES = /^\/ui\/(r|v1|_astro|avatars|media)\/|^\/ui\/(llms|llms-full)\.txt$|^\/ui\/favicon\.svg$/;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".txt": "text/plain", ".woff2": "font/woff2" };
const port = Number(process.argv[2] || 4350);

http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = FILES.test(url) ? path.join(DIST, url) : path.join(PREVIEW, url.replace(/\/+$/, ""), "index.html");
  if (!file.startsWith(DIST) && !file.startsWith(PREVIEW)) return res.writeHead(400).end();
  fs.readFile(file, (err, data) => {
    if (err) return res.writeHead(404, { "content-type": "text/plain" }).end("not found");
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" }).end(data);
  });
}).listen(port, () => console.log(`VinUI WordPress preview on http://localhost:${port}/ui`));
