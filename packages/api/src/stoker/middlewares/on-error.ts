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

  // Workers don't set NODE_ENV; default to hiding the stack and only expose it
  // when an explicit DEBUG flag is set (local dev), so prod never leaks traces.
  const debug = (c.env as { DEBUG?: string } | undefined)?.DEBUG === "true";
  return c.json(
    {
      message: err.message,
      stack: debug ? err.stack : undefined,
    },
    statusCode
  );
};

export default onError;
