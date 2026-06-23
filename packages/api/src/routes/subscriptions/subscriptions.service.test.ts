import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import { subscriptions } from "@/db/schema";
import type { EnvVars } from "@/env";
import { applyMigrations } from "@/test-support/apply-migrations";
import {
  applyRevenueCatEntitlement,
  claimMockSubscription,
  claimPolarByEmail,
  getMySubscription,
  parseRevenueCatEntitlementPayload,
} from "./subscriptions.service";

applyMigrations();

const FUTURE = new Date(Date.now() + 86_400_000).toISOString();

describe("subscriptions service — RevenueCat precedence (critical)", () => {
  it("does NOT overwrite an active Polar-owned subscription with RC sync", async () => {
    const db = createDatabase(env.DB);
    const user = "rc-vs-polar";
    await db.insert(subscriptions).values({
      id: crypto.randomUUID(),
      authUserId: user,
      productId: "yearly",
      status: "active",
      source: "polar",
      updatedAt: new Date().toISOString(),
    });

    const result = await applyRevenueCatEntitlement(db, user, {
      entitlementActive: true,
      productIdentifier: "barakah_monthly",
      expiresAt: FUTURE,
    });

    expect(result?.source).toBe("polar");
    // No revenuecat row was created.
    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.authUserId, user));
    expect(rows).toHaveLength(1);
    expect(rows[0].source).toBe("polar");
  });

  it("ignores an EXPIRED active Polar row and lets RC sync proceed", async () => {
    const db = createDatabase(env.DB);
    const user = "rc-vs-expired-polar";
    await db.insert(subscriptions).values({
      id: crypto.randomUUID(),
      authUserId: user,
      productId: "yearly",
      status: "active",
      source: "polar",
      // active status but already past expiry — must not block RC.
      expiresAt: new Date(Date.now() - 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const result = await applyRevenueCatEntitlement(db, user, {
      entitlementActive: true,
      productIdentifier: "barakah_monthly",
      expiresAt: FUTURE,
    });

    expect(result?.source).toBe("revenuecat");
    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.authUserId, user));
    expect(rows.some((row) => row.source === "revenuecat")).toBe(true);
  });

  it("creates a RevenueCat row when no Polar subscription exists", async () => {
    const db = createDatabase(env.DB);
    const user = "rc-only";
    const result = await applyRevenueCatEntitlement(db, user, {
      entitlementActive: true,
      productIdentifier: "barakah_yearly",
      expiresAt: FUTURE,
    });
    expect(result?.source).toBe("revenuecat");
    expect(result?.productId).toBe("yearly");
  });

  it("is idempotent — re-syncing the same entitlement updates one row, not two", async () => {
    const db = createDatabase(env.DB);
    const user = "rc-idempotent";
    await applyRevenueCatEntitlement(db, user, {
      entitlementActive: true,
      productIdentifier: "barakah_yearly",
      expiresAt: FUTURE,
    });
    await applyRevenueCatEntitlement(db, user, {
      entitlementActive: true,
      productIdentifier: "barakah_yearly",
      expiresAt: FUTURE,
    });

    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.authUserId, user));
    expect(rows).toHaveLength(1);
    expect(rows[0].source).toBe("revenuecat");
  });

  it("returns null for an inactive entitlement with no existing row", async () => {
    const db = createDatabase(env.DB);
    const result = await applyRevenueCatEntitlement(db, "rc-inactive", {
      entitlementActive: false,
    });
    expect(result).toBeNull();
  });
});

describe("subscriptions service — claims + reads", () => {
  it("getMySubscription returns the active row, null when expired", async () => {
    const db = createDatabase(env.DB);
    const user = "reader";
    await db.insert(subscriptions).values({
      id: crypto.randomUUID(),
      authUserId: user,
      productId: "monthly",
      status: "active",
      source: "revenuecat",
      expiresAt: new Date(Date.now() - 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
    expect(await getMySubscription(db, { id: user })).toBeNull();
  });

  it("getMySubscription prefers an active Polar row over an active RC row", async () => {
    const db = createDatabase(env.DB);
    const user = "dual-source";
    // RC row written more recently than the Polar row — updatedAt ordering alone
    // would surface RC, but Polar must win per the source-precedence invariant.
    await db.insert(subscriptions).values({
      id: crypto.randomUUID(),
      authUserId: user,
      productId: "lifetime",
      status: "active",
      source: "polar",
      expiresAt: null,
      updatedAt: new Date(Date.now() - 60_000).toISOString(),
    });
    await db.insert(subscriptions).values({
      id: crypto.randomUUID(),
      authUserId: user,
      productId: "monthly",
      status: "active",
      source: "revenuecat",
      expiresAt: FUTURE,
      updatedAt: new Date().toISOString(),
    });

    const result = await getMySubscription(db, { id: user });
    expect(result?.source).toBe("polar");
  });

  it("getMySubscription returns a synthetic active row for the review email", async () => {
    const db = createDatabase(env.DB);
    const reviewEnv = {
      ...env,
      REVIEW_OTP_EMAIL: "appreview@heybarakah.app",
    } as unknown as EnvVars;
    const result = await getMySubscription(
      db,
      { id: "reviewer", email: "AppReview@HeyBarakah.app" },
      reviewEnv
    );
    expect(result?.status).toBe("active");
    expect(result?.expiresAt).toBeNull();
    // Never persisted — nothing was written to the DB for this user.
    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.authUserId, "reviewer"));
    expect(rows).toHaveLength(0);
  });

  it("getMySubscription ignores the review bypass when REVIEW_OTP_EMAIL is unset", async () => {
    const db = createDatabase(env.DB);
    const result = await getMySubscription(
      db,
      { id: "no-review", email: "appreview@heybarakah.app" },
      { ...env, REVIEW_OTP_EMAIL: undefined } as unknown as EnvVars
    );
    expect(result).toBeNull();
  });

  it("claimPolarByEmail links unowned polar rows to the user", async () => {
    const db = createDatabase(env.DB);
    await db.insert(subscriptions).values({
      id: crypto.randomUUID(),
      customerEmail: "buyer@example.com",
      productId: "yearly",
      status: "active",
      source: "polar",
      updatedAt: new Date().toISOString(),
    });
    const result = await claimPolarByEmail(db, {
      id: "claimer",
      email: "Buyer@Example.com",
    });
    expect(result.linked).toBe(true);
  });

  it("claimMockSubscription is forbidden unless the gate is enabled", async () => {
    const db = createDatabase(env.DB);
    await expect(
      claimMockSubscription(
        db,
        { ALLOW_MOCK_SUBSCRIPTIONS: undefined } as never,
        { id: "mock-user" },
        "monthly"
      )
    ).rejects.toThrow("not allowed");

    const row = await claimMockSubscription(
      db,
      { ALLOW_MOCK_SUBSCRIPTIONS: "true" } as never,
      { id: "mock-user" },
      "monthly"
    );
    expect(row?.source).toBe("mock");
  });

  it("parses a RevenueCat entitlement payload", () => {
    const parsed = parseRevenueCatEntitlementPayload(
      {
        subscriber: {
          original_app_user_id: "orig",
          entitlements: {
            "Barakah Premium": {
              expires_date: FUTURE,
              product_identifier: "barakah_yearly",
              store: "app_store",
            },
          },
        },
      },
      "app-user-1"
    );
    expect(parsed.entitlementActive).toBe(true);
    expect(parsed.productIdentifier).toBe("barakah_yearly");
    expect(parsed.store).toBe("app_store");
  });
});
