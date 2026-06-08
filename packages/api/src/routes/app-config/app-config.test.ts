import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import { createTestApp } from "@/lib/create-app";

import { appConfig } from "./app-config.index";
import { setAppConfig } from "./app-config.service";

async function applyMigration() {
  const statements = migration0000
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

describe("app-config route", () => {
  beforeAll(applyMigration);

  it("returns null before any config is set", async () => {
    const app = createTestApp(appConfig);
    const res = await app.request("/app-config", {}, env);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("null");
  });

  it("returns the configured min version + store url", async () => {
    await setAppConfig(createDatabase(env.DB), {
      minSupportedVersion: "3.1.0",
      iosStoreUrl: "https://apps.apple.com/app/id123",
    });

    const app = createTestApp(appConfig);
    const res = await app.request("/app-config", {}, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      minSupportedVersion: string;
      iosStoreUrl: string;
    };
    expect(body.minSupportedVersion).toBe("3.1.0");
    expect(body.iosStoreUrl).toBe("https://apps.apple.com/app/id123");
  });
});
