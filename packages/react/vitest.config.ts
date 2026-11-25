import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@/components/vin/button": fileURLToPath(new URL("./src/button.tsx", import.meta.url)) },
  },
});
