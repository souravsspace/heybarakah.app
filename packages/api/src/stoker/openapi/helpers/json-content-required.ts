import type { z } from "@hono/zod-openapi";

import jsonContent from "./json-content";

function jsonContentRequired<T extends z.ZodType>(
  schema: T,
  description: string
) {
  return {
    ...jsonContent(schema, description),
    required: true,
  };
}

export default jsonContentRequired;
