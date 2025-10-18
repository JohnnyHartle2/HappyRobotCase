import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["**/*.e2e.test.ts"],
    testTimeout: 10000,
  },
});
