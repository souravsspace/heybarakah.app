import { getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { account, session, user, verification } from "@/db/auth-schema";

describe("better-auth schema tables", () => {
  it("maps to the expected SQLite table names", () => {
    expect(getTableName(user)).toBe("user");
    expect(getTableName(session)).toBe("session");
    expect(getTableName(account)).toBe("account");
    expect(getTableName(verification)).toBe("verification");
  });

  it("user carries identity + verification columns", () => {
    expect(user.id.primary).toBe(true);
    expect(user.email.isUnique).toBe(true);
    expect(user.name.notNull).toBe(true);
    expect(user.emailVerified.notNull).toBe(true);
  });

  it("session token is unique and expiresAt is required", () => {
    expect(session.token.isUnique).toBe(true);
    expect(session.expiresAt.notNull).toBe(true);
    expect(session.userId.notNull).toBe(true);
  });

  it("session carries the geo/context columns used by auth-session", () => {
    for (const col of [
      session.timezone,
      session.city,
      session.country,
      session.latitude,
      session.longitude,
    ]) {
      expect(col).toBeDefined();
    }
  });

  it("account links to a user and stores provider identifiers", () => {
    expect(account.userId.notNull).toBe(true);
    expect(account.accountId.notNull).toBe(true);
    expect(account.providerId.notNull).toBe(true);
  });

  it("verification stores identifier/value/expiry", () => {
    expect(verification.identifier.notNull).toBe(true);
    expect(verification.value.notNull).toBe(true);
    expect(verification.expiresAt.notNull).toBe(true);
  });
});
