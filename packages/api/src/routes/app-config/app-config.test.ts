import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import { createTestApp } from "@/lib/create-app";
import { applyMigrations } from "@/test-support/apply-migrations";
import { appConfig } from "./app-config.index";
import { setAppConfig } from "./app-config.service";

applyMigrations();

describe("app-config route", () => {
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
