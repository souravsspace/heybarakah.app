import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import { applyMigrations } from "@/test-support/apply-migrations";
import {
  listPushToStartTokens,
  upsertPushToStartToken,
} from "./live-activity.service";

applyMigrations();

describe("live-activity service", () => {
  it("returns no tokens for a user that never registered one", async () => {
    const db = createDatabase(env.DB);
    expect(await listPushToStartTokens(db, "nobody")).toEqual([]);
  });

  it("stores a push-to-start token for a user", async () => {
    const db = createDatabase(env.DB);
    await upsertPushToStartToken(db, "user-a", "token-a");
    const rows = await listPushToStartTokens(db, "user-a");
    expect(rows).toHaveLength(1);
    expect(rows[0].token).toBe("token-a");
  });

  it("keeps one row per token when the same device re-registers", async () => {
    const db = createDatabase(env.DB);
    await upsertPushToStartToken(db, "user-b", "token-b");
    const first = await listPushToStartTokens(db, "user-b");
    await upsertPushToStartToken(db, "user-b", "token-b");
    const second = await listPushToStartTokens(db, "user-b");
    expect(second).toHaveLength(1);
    expect(second[0].updatedAt).toBeGreaterThanOrEqual(first[0].updatedAt);
  });

  it("keeps a row per device when one user registers two tokens", async () => {
    const db = createDatabase(env.DB);
    await upsertPushToStartToken(db, "user-c", "token-c1");
    await upsertPushToStartToken(db, "user-c", "token-c2");
    expect(await listPushToStartTokens(db, "user-c")).toHaveLength(2);
  });

  // A token is bound to an install, not an account. When a second person signs
  // in on the same phone the token must follow them, or the first account keeps
  // receiving push-to-start for a device it no longer owns.
  it("reassigns a token that moves to another user", async () => {
    const db = createDatabase(env.DB);
    await upsertPushToStartToken(db, "user-d", "shared-token");
    await upsertPushToStartToken(db, "user-e", "shared-token");
    expect(await listPushToStartTokens(db, "user-d")).toEqual([]);
    expect(await listPushToStartTokens(db, "user-e")).toHaveLength(1);
  });
});
