import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import { subscriptions } from "@/db/schema";
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
