import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Examples import components the way a user's project would: "@/components/vin/<name>".
const src = fileURLToPath(new URL("./src/", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [{ find: /^@\/components\/vin\/(.*)$/, replacement: `${src}$1.tsx` }],
  },
});
