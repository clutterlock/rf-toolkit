import { defineConfig } from "vitest/config";

// Vitest requires a default export for its config file; the "named exports only"
// style rule applies to library source in src/.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
