import { describe, expect, it } from "vitest";

import * as openapi from "@/stoker/openapi";

describe("stoker/openapi barrel", () => {
  it("re-exports the hook, content helpers, and schema factory", () => {
    expect(typeof openapi.defaultHook).toBe("function");
    expect(typeof openapi.jsonContent).toBe("function");
    expect(typeof openapi.jsonContentRequired).toBe("function");
    expect(typeof openapi.createMessageObjectSchema).toBe("function");
  });
});
