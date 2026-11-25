import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { fileURLToPath } from "node:url";

// Examples import components the way a user's project would: "@/components/vin/<name>.svelte".
const src = fileURLToPath(new URL("./src/", import.meta.url));
const alias = [{ find: /^@\/components\/vin\/(.*)$/, replacement: `${src}$1` }];

export default defineConfig({
  plugins: [svelte()],
  resolve: { alias },
  test: {
    projects: [
      {
        // Server rendering: every example must match its HTML snippet.
        extends: true,
        test: { name: "ssr", environment: "node", include: ["test/**/*.ssr.test.ts"] },
      },
      {
        // Behaviour in a DOM.
        extends: true,
        plugins: [svelteTesting()],
        test: { name: "dom", environment: "jsdom", include: ["test/**/*.dom.test.ts"], setupFiles: ["test/setup.ts"] },
      },
    ],
  },
});
