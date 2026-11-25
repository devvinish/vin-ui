import { defineConfig, devices } from "@playwright/test";

/**
 * Visual + accessibility tests for every component fixture, in all 8 styles × light/dark.
 * Run `npm run build` first; Playwright serves apps/docs/dist.
 * Baselines are per platform (fonts render differently on macOS and Linux), so CI keeps its own.
 */
export default defineConfig({
  testDir: "tests/visual",
  snapshotPathTemplate: "tests/visual/__screenshots__/{platform}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" } },
  use: { baseURL: "http://localhost:4340", ...devices["Desktop Chrome"], viewport: { width: 900, height: 700 } },
  webServer: { command: "node tests/visual/serve.mjs", url: "http://localhost:4340/ui/", reuseExistingServer: !process.env.CI },
});
