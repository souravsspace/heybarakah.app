import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import { applyMigrations } from "@/test-support/apply-migrations";
import {
  getMine,
  setEnabled,
  setWindows,
  upsertAndroid,
  upsertIos,
} from "./shield-selection.service";

applyMigrations();

describe("shield-selection service", () => {
  it("returns undefined when no selection exists", async () => {
    const db = createDatabase(env.DB);
    expect(await getMine(db, "nobody")).toBeUndefined();
  });

  it("upserts iOS selection and toggles enabled by item count", async () => {
    const db = createDatabase(env.DB);
    const user = "ios-user";
    await upsertIos(db, user, { iosSelectionData: "blob", iosItemCount: 3 });
    let row = await getMine(db, user);
    expect(row?.iosItemCount).toBe(3);
    expect(row?.enabled).toBe(true);
    expect(row?.windows).toEqual(["fajr", "dhuhr", "asr", "maghrib", "isha"]);

    await upsertIos(db, user, { iosSelectionData: "", iosItemCount: 0 });
    row = await getMine(db, user);
    expect(row?.enabled).toBe(false);
  });

  it("upserts Android packages", async () => {
    const db = createDatabase(env.DB);
    const user = "android-user";
    await upsertAndroid(db, user, ["com.instagram.android"]);
    const row = await getMine(db, user);
    expect(row?.androidPackageNames).toEqual(["com.instagram.android"]);
    expect(row?.enabled).toBe(true);
  });

  it("setWindows + setEnabled patch an existing row only", async () => {
    const db = createDatabase(env.DB);
    const user = "win-user";
    // No-op when no row yet.
    await setWindows(db, user, ["fajr"]);
    expect(await getMine(db, user)).toBeUndefined();

    await upsertIos(db, user, { iosSelectionData: "x", iosItemCount: 1 });
    await setWindows(db, user, ["fajr", "isha"]);
    await setEnabled(db, user, false);
    const row = await getMine(db, user);
    expect(row?.windows).toEqual(["fajr", "isha"]);
    expect(row?.enabled).toBe(false);
  });
});
