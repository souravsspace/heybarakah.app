import { describe, expect, it } from "vitest";

import createMessageObjectSchema from "@/stoker/openapi/schemas/create-message-object";

describe("createMessageObjectSchema", () => {
  it("produces a schema that accepts a { message } object", () => {
    const schema = createMessageObjectSchema("Not found");
    expect(schema.parse({ message: "hi" })).toEqual({ message: "hi" });
  });

  it("rejects an object missing message", () => {
    const schema = createMessageObjectSchema();
    expect(schema.safeParse({}).success).toBe(false);
  });

  it("rejects a non-string message", () => {
    const schema = createMessageObjectSchema();
    expect(schema.safeParse({ message: 42 }).success).toBe(false);
  });
});
