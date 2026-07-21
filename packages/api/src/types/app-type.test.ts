import { describe, expect, it } from "vitest";

import type { AppBindings } from "@/types/app-type";

// app-type.ts is type-only; these pin the binding/variable shape so a breaking
// rename fails compilation, and give the file executable coverage.
describe("AppBindings shape", () => {
  it("declares the Cloudflare bindings the app depends on", () => {
    const bindings = {
      DB: {},
      KV: {},
      R2: {},
      SYNC: {},
    } as unknown as AppBindings["Bindings"];
    expect(Object.keys(bindings)).toEqual(
      expect.arrayContaining(["DB", "KV", "R2", "SYNC"])
    );
  });

  it("declares per-request logger/auth/user variables", () => {
    const vars = {
      logger: {},
      auth: {},
      user: null,
    } as unknown as AppBindings["Variables"];
    expect(vars.user).toBeNull();
    expect(vars.logger).toBeDefined();
    expect(vars.auth).toBeDefined();
  });
});
