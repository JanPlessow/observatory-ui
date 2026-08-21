import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Components are reconciled, not just stringified: React only validates
    // child keys during a real client render, so the DOM environment is what
    // makes key regressions observable.
    environment: "jsdom",
    include: ["tests/**/*.test.tsx"],
  },
});
