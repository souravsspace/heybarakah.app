import type { z } from "@hono/zod-openapi";

function jsonContent<T extends z.ZodType>(schema: T, description: string) {
  return {
    content: {
      "application/json": {
        schema,
      },
    },
    description,
  };
}

export default jsonContent;
