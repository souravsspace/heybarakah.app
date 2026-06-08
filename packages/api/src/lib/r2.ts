import type { R2Bucket, R2ObjectBody } from "@cloudflare/workers-types";

/** Avatars are small profile images; cap upload size to 5 MB. */
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

/** Image MIME types accepted for avatar upload. */
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export function isAllowedImageType(contentType: string | null): boolean {
  return contentType !== null && ALLOWED_IMAGE_TYPES.has(contentType);
}

/** R2 object key for a user's avatar. Stored in `users.image`. */
export function avatarKey(authUserId: string): string {
  return `avatars/${authUserId}`;
}

/**
 * Validate + store an avatar blob in R2. Replaces Convex `ctx.storage` for
 * avatars (Better Auth's own file API is intentionally not used — see §4).
 * Throws on a disallowed content type or oversize blob so the route returns 422.
 */
export async function putAvatar(
  r2: R2Bucket,
  key: string,
  body: ArrayBuffer,
  contentType: string | null
): Promise<void> {
  if (!isAllowedImageType(contentType)) {
    throw new Error(`Unsupported avatar content type: ${contentType}`);
  }
  if (body.byteLength > AVATAR_MAX_BYTES) {
    throw new Error(
      `Avatar exceeds ${AVATAR_MAX_BYTES} bytes (${body.byteLength})`
    );
  }
  await r2.put(key, body, {
    httpMetadata: { contentType: contentType as string },
  });
}

export function getAvatar(
  r2: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  return r2.get(key);
}

export function deleteAvatar(r2: R2Bucket, key: string): Promise<void> {
  return r2.delete(key);
}
