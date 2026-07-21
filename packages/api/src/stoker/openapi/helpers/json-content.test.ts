import { z } from "@hono/zod-openapi";
import { describe, expect, it } from "vitest";

import jsonContent from "@/stoker/openapi/helpers/json-content";

describe("jsonContent", () => {
  it("wraps a schema as an application/json response descriptor", () => {
    const schema = z.object({ ok: z.boolean() });
    const descriptor = jsonContent(schema, "All good");

    expect(descriptor.description).toBe("All good");
    expect(descriptor.content["application/json"].schema).toBe(schema);
  });

  it("does not mark the content as required", () => {
    const descriptor = jsonContent(z.string(), "d");
    expect("required" in descriptor).toBe(false);
  });
});
