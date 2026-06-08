import { describe, expect, it } from "vitest";

import {
  APP_TABLE_NAMES,
  buildClearStatements,
  parseResetArgs,
} from "./reset-db";

describe("reset-db", () => {
  it("covers the 12 app tables plus the 4 Better Auth tables", () => {
    expect(APP_TABLE_NAMES).toHaveLength(16);
    expect(APP_TABLE_NAMES).toContain("users");
    expect(APP_TABLE_NAMES).toContain("appConfig");
    // Better Auth tables (singular) — cleared too so a dev reset wipes sessions.
    expect(APP_TABLE_NAMES).toContain("user");
    expect(APP_TABLE_NAMES).toContain("account");
    expect(APP_TABLE_NAMES).toContain("session");
    expect(APP_TABLE_NAMES).toContain("verification");
  });

  it("builds a DELETE statement per table", () => {
    const statements = buildClearStatements(["users", "prayerLogs"]);
    expect(statements).toEqual([
      "DELETE FROM `users`;",
      "DELETE FROM `prayerLogs`;",
    ]);
  });

  it("parses --remote and --help flags", () => {
    expect(parseResetArgs([])).toEqual({ remote: false, help: false });
    expect(parseResetArgs(["--remote"])).toEqual({ remote: true, help: false });
    expect(parseResetArgs(["-h"])).toEqual({ remote: false, help: true });
  });
});
