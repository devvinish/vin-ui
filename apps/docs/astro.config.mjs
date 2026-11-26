// VinUI website. Served at https://vinish.dev/ui
// Output goes to dist/ui so the Cloudflare Pages project serves /ui/* directly,
// and the vinish.dev Worker route can proxy /ui/* without rewriting paths.
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  site: "https://vinish.dev",
  base: "/ui",
  outDir: "./dist/ui",
  trailingSlash: "ignore",
  integrations: [react()],
  vite: {
    // Font files stay files: inlined into the CSS, every visitor would download every character set.
    build: { assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined) },
    resolve: {
      alias: [
        // React examples import components the way a user's project would: "@/components/vin/<name>".
        { find: /^@\/components\/vin\/(.*)$/, replacement: fileURLToPath(new URL("../../packages/react/src/", import.meta.url)) + "$1.tsx" },
      ],
    },
  },
});
