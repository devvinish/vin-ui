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
    resolve: {
      alias: {
        // React examples import the component the way a user's project would.
        "@/components/vin/button": fileURLToPath(new URL("../../packages/react/src/button.tsx", import.meta.url)),
      },
    },
  },
});
