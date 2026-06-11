import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { INTERNAL_SERVER_ERROR, OK } from "../http-status-codes";

const onError: ErrorHandler = (err, c) => {
  const currentStatus =
    "status" in err ? err.status : c.newResponse(null).status;
  const statusCode: ContentfulStatusCode =
    currentStatus === OK
      ? (INTERNAL_SERVER_ERROR as ContentfulStatusCode)
      : (currentStatus as ContentfulStatusCode);

  // Always log the real error server-side regardless of what we expose.
  c.var.logger?.error("unhandled error", {
    message: err.message,
    stack: err.stack,
    status: statusCode,
  });

  // Workers don't set NODE_ENV; default to hiding the stack and only expose it
  // when an explicit DEBUG flag is set (local dev), so prod never leaks traces.
  const debug = (c.env as { DEBUG?: string } | undefined)?.DEBUG === "true";

  // For 5xx, never echo the raw message to the client (it can leak missing-secret
  // names from parseEnv, DB driver internals, etc.) unless DEBUG is on. Client
  // errors (4xx, e.g. thrown HTTPException) keep their intentional message.
  const isServerError = statusCode >= INTERNAL_SERVER_ERROR;
  const message =
    isServerError && !debug ? "Internal Server Error" : err.message;

  return c.json(
    {
      message,
      stack: debug ? err.stack : undefined,
    },
    statusCode
  );
};

export default onError;
