import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import {
  AVATAR_MAX_BYTES,
  avatarKey,
  deleteAvatar,
  getAvatar,
  isAllowedImageType,
  putAvatar,
} from "@/lib/r2";

const PNG = "image/png";

function bytes(n: number): ArrayBuffer {
  return new Uint8Array(n).buffer;
}

describe("avatarKey", () => {
  it("namespaces avatars under the user id", () => {
    expect(avatarKey("user_123")).toBe("avatars/user_123");
  });
});

describe("isAllowedImageType", () => {
  it("accepts the image allowlist", () => {
    expect(isAllowedImageType(PNG)).toBe(true);
    expect(isAllowedImageType("image/jpeg")).toBe(true);
    expect(isAllowedImageType("image/webp")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isAllowedImageType("application/pdf")).toBe(false);
    expect(isAllowedImageType("text/html")).toBe(false);
    expect(isAllowedImageType(null)).toBe(false);
  });
});

describe("putAvatar", () => {
  it("stores the blob and round-trips it back", async () => {
    const key = avatarKey("u_put");
    await putAvatar(env.R2, key, bytes(16), PNG);
    const obj = await getAvatar(env.R2, key);
    expect(obj).not.toBeNull();
    expect(obj?.httpMetadata?.contentType).toBe(PNG);
  });

  it("rejects a disallowed content type", async () => {
    await expect(
      putAvatar(env.R2, avatarKey("u_bad"), bytes(16), "application/zip")
    ).rejects.toThrow();
  });

  it("rejects a blob over the size cap", async () => {
    await expect(
      putAvatar(env.R2, avatarKey("u_big"), bytes(AVATAR_MAX_BYTES + 1), PNG)
    ).rejects.toThrow();
  });
});

describe("deleteAvatar", () => {
  it("removes the blob", async () => {
    const key = avatarKey("u_del");
    await putAvatar(env.R2, key, bytes(8), PNG);
    await deleteAvatar(env.R2, key);
    expect(await getAvatar(env.R2, key)).toBeNull();
  });
});
