import { defineConfig, devices } from "@playwright/test";

// CI is set to "true" by GitHub Actions; locally it's undefined.
const isCI = process.env.CI !== undefined;

export default defineConfig({
  testDir: "./e2e",

  // Run one test at a time.
  workers: 1,

  // Retry failed tests once in CI.
  retries: isCI ? 1 : 0,

  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:5174",

    trace: "on-first-retry",
    screenshot: "only-on-failure",

    // Show the browser and slow down actions locally.
    headless: isCI,
    launchOptions: {
      slowMo: isCI ? 0 : Number(process.env.SLOW_MO ?? 0),
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Start backend and frontend before running tests.
  webServer: [
    {
      command: "uv run fastapi run app/main.py --port 8001",
      cwd: "..",
      url: "http://127.0.0.1:8001/health",
      reuseExistingServer: false,
      env: {
        DATABASE_URL: "sqlite:///./e2e.db",
        SECRET_KEY: "e2e-secret-key-not-for-production-0123456789",
      },
    },
    {
      command: "npm run dev -- --port 5174 --strictPort",
      url: "http://localhost:5174",
      reuseExistingServer: false,
      env: {
        API_URL: "http://127.0.0.1:8001",
      },
    },
  ],
});
