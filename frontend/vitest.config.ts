import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [], // Add setup file if needed later
    include: ["**/*.test.{ts,tsx}"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
