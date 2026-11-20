import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.{ts,tsx}"],
    testTimeout: 60_000,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
  },
});
