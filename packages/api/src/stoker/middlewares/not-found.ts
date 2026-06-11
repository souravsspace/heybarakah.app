import type { NotFoundHandler } from "hono";

import { NOT_FOUND } from "../http-status-codes";
import { NOT_FOUND as NOT_FOUND_MESSAGE } from "../http-status-phrases";

// Fixed message — echoing c.req.path reflected caller-controlled input and
// aided route enumeration probes.
const notFound: NotFoundHandler = (c) =>
  c.json(
    {
      message: NOT_FOUND_MESSAGE,
    },
    NOT_FOUND
  );

export default notFound;
