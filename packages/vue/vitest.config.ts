import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

// Examples import components the way a user's project would: "@/components/vin/<name>.vue".
const src = fileURLToPath(new URL("./src/", import.meta.url));

export default defineConfig({
  // Example images like /ui/media/lake.svg are site URLs, not files to import.
  plugins: [vue({ template: { transformAssetUrls: { includeAbsolute: false } } })],
  resolve: {
    alias: [{ find: /^@\/components\/vin\/(.*)$/, replacement: `${src}$1` }],
  },
  test: { environment: "happy-dom", setupFiles: ["./test/setup.ts"] },
});
