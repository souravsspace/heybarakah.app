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

  const nodeEnv = (c.env as { NODE_ENV?: string } | undefined)?.NODE_ENV;
  return c.json(
    {
      message: err.message,
      stack: nodeEnv === "production" ? undefined : err.stack,
    },
    statusCode
  );
};

export default onError;
