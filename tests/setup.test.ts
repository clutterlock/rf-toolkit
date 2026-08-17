import { describe, expect, it } from "vitest";

describe("toolchain setup", () => {
  it("imports the library entry point", async () => {
    const mod = await import("../src/index.js");
    expect(mod).toBeDefined();
  });
});
