import { describe, expect, test } from "bun:test";

import * as polar from "./index";

describe("polar barrel", () => {
  test("re-exports webhook helpers", () => {
    expect(typeof polar.validateWebhook).toBe("function");
    expect(typeof polar.buildPolarOrderDoc).toBe("function");
    expect(typeof polar.buildSubscriptionDoc).toBe("function");
  });
});
