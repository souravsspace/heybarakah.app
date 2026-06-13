import { z } from "@hono/zod-openapi";

import createMessageObjectSchema from "../schemas/create-message-object";
import jsonContent from "./json-content";

// Shaped to match what the app actually returns on each failure path, so the
// generated OpenAPI spec documents every status a route can emit — not just 200.

// `onError` (stoker) returns `{ message }` (+ `stack` only when DEBUG is on).
// This covers 401 (requireUser → HTTPException), thrown 4xx, and 500.
const messageSchema = createMessageObjectSchema("Internal Server Error");

// `defaultHook` returns the failed Zod parse as `{ success: false, error }`.
// Model the ZodError loosely (issues array) — enough to be useful in the docs
// without coupling to Zod's exact internal serialization.
const validationErrorSchema = z
  .object({
    success: z.boolean(),
    error: z.object({
      name: z.string(),
      issues: z.array(
        z.object({
          code: z.string(),
          path: z.array(z.union([z.string(), z.number()])),
          message: z.string(),
        })
      ),
    }),
  })
  .openapi({
    example: {
      success: false,
      error: {
        name: "ZodError",
        issues: [{ code: "invalid_type", path: ["date"], message: "Required" }],
      },
    },
  });

// `rateLimit` / `idempotency` middleware return `{ error }`.
const errorStringSchema = z
  .object({ error: z.string() })
  .openapi({ example: { error: "Too many requests" } });

/** 401 — missing or invalid Better Auth session (thrown by `requireUser`). */
export const unauthorizedResponse = jsonContent(
  createMessageObjectSchema("Authentication required"),
  "Missing or invalid session"
);

/** 422 — request body / query / params failed schema validation. */
export const validationErrorResponse = jsonContent(
  validationErrorSchema,
  "Request failed schema validation"
);

/**
 * 422 with the `{ message }` shape — for handlers that throw `HTTPException`
 * directly (e.g. avatar upload over the size cap) rather than failing the Zod
 * hook. Distinct from `validationErrorResponse`, which is the Zod-parse shape.
 */
export const unprocessableMessageResponse = jsonContent(
  createMessageObjectSchema("Avatar exceeds the maximum allowed size"),
  "Request rejected by the handler"
);

/** 429 — per-IP rate limit exceeded (global middleware). */
export const rateLimitResponse = jsonContent(
  errorStringSchema,
  "Rate limit exceeded"
);

/** 500 — unexpected server error (message hidden unless DEBUG is set). */
export const serverErrorResponse = jsonContent(
  messageSchema,
  "Unexpected server error"
);
