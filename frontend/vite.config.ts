/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // The browser calls /api/... on Vite's own origin; Vite forwards it to FastAPI,
      // removing the /api prefix: /api/todos -> http://127.0.0.1:8000/todos
      "/api": {
        target: "http://127.0.0.1:8000",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    // jsdom: a simulated browser page inside Node, so components can render in tests.
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
