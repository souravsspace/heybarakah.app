import { createDatabase } from "@/db";
import { createRouter } from "@/lib/create-router";
import { NOT_FOUND } from "@/stoker/http-status-codes";

import * as handlers from "./users.handlers";
import * as routes from "./users.routes";
import { getAvatarObject } from "./users.service";

export const usersRouter = createRouter()
  .openapi(routes.getMyAccount, handlers.getMyAccount)
  .openapi(routes.upsertProfile, handlers.upsertProfile)
  .openapi(routes.deleteMyAccount, handlers.deleteMyAccount)
  .openapi(routes.getMyAvatarUrl, handlers.getMyAvatarUrl)
  .openapi(routes.setAvatar, handlers.setAvatar);

// Public, unauthenticated avatar blob proxy. The key (authUserId) is an opaque
// id and avatars are non-sensitive, so it is served without a session — this is
// the URL returned by getMyAvatarUrl for use in native <Image> loaders, which
// do not replay the auth cookie.
usersRouter.get("/avatars/:authUserId", async (c) => {
  const db = createDatabase(c.env.DB);
  const object = await getAvatarObject(db, c.env.R2, c.req.param("authUserId"));
  if (!object) {
    return c.json({ message: "Not found" }, NOT_FOUND);
  }
  // R2's ReadableStream (workers-types) differs nominally from Hono's expected
  // web stream; the runtime accepts it, so bridge the type.
  return c.body(object.body as unknown as ReadableStream, {
    headers: {
      "Content-Type":
        object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=300",
    },
  });
});
