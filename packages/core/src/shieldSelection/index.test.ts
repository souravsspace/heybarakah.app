import { describe, expect, test } from "bun:test";

import * as shield from "./index";

describe("shieldSelection barrel", () => {
  test("re-exports ALL_WINDOWS", () => {
    expect(Array.isArray(shield.ALL_WINDOWS)).toBe(true);
    expect(shield.ALL_WINDOWS).toHaveLength(5);
  });
});
