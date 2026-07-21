import { describe, expect, it } from "vitest";

import {
  conflictResponse,
  forbiddenResponse,
  notFoundResponse,
  rateLimitResponse,
  serverErrorResponse,
  unauthorizedResponse,
  unprocessableMessageResponse,
  validationErrorResponse,
  validationOrMessageResponse,
} from "@/stoker/openapi/helpers/error-responses";

const ALL = {
  unauthorizedResponse,
  validationErrorResponse,
  unprocessableMessageResponse,
  validationOrMessageResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  rateLimitResponse,
  serverErrorResponse,
};

describe("error-responses descriptors", () => {
  it("every response is a json descriptor with a description", () => {
    for (const [name, res] of Object.entries(ALL)) {
      expect(res.content["application/json"].schema, name).toBeDefined();
      expect(typeof res.description, name).toBe("string");
      expect(res.description.length, name).toBeGreaterThan(0);
    }
  });

  it("message-shaped responses validate a { message } body", () => {
    const schema = notFoundResponse.content["application/json"].schema;
    expect(schema.parse({ message: "gone" })).toEqual({ message: "gone" });
  });

  it("rate-limit response validates the { error } body", () => {
    const schema = rateLimitResponse.content["application/json"].schema;
    expect(schema.parse({ error: "Too many requests" })).toEqual({
      error: "Too many requests",
    });
  });

  it("validation-error response models the Zod parse shape", () => {
    const schema = validationErrorResponse.content["application/json"].schema;
    const ok = schema.safeParse({
      success: false,
      error: {
        name: "ZodError",
        issues: [{ code: "invalid_type", path: ["date"], message: "Required" }],
      },
    });
    expect(ok.success).toBe(true);
  });

  it("validation-or-message response accepts either body variant", () => {
    const schema =
      validationOrMessageResponse.content["application/json"].schema;
    expect(schema.safeParse({ message: "bad domain input" }).success).toBe(
      true
    );
    expect(
      schema.safeParse({
        success: false,
        error: { name: "ZodError", issues: [] },
      }).success
    ).toBe(true);
  });
});
