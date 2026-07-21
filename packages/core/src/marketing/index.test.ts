import { describe, expect, test } from "bun:test";

import * as marketing from "./index";

describe("marketing barrel", () => {
  test("re-exports email builders", () => {
    expect(typeof marketing.welcomeEmail).toBe("function");
    expect(typeof marketing.purchaseEmail).toBe("function");
  });

  test("re-exports the waitlist email parser", () => {
    expect(typeof marketing.parseWaitlistEmail).toBe("function");
  });
});
