import { z } from "@hono/zod-openapi";
import { describe, expect, it } from "vitest";

import jsonContentRequired from "@/stoker/openapi/helpers/json-content-required";

describe("jsonContentRequired", () => {
  it("wraps a schema and marks the body required", () => {
    const schema = z.object({ name: z.string() });
    const descriptor = jsonContentRequired(schema, "Body");

    expect(descriptor.required).toBe(true);
    expect(descriptor.description).toBe("Body");
    expect(descriptor.content["application/json"].schema).toBe(schema);
  });
});
