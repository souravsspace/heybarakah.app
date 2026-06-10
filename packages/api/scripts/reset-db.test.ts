import { describe, expect, it } from "vitest";

import {
  APP_TABLE_NAMES,
  buildClearStatements,
  checkRemoteGuard,
  parseResetArgs,
} from "./reset-db";

describe("reset-db", () => {
  it("covers the 13 app tables plus the 4 Better Auth tables", () => {
    expect(APP_TABLE_NAMES).toHaveLength(17);
    expect(APP_TABLE_NAMES).toContain("users");
    expect(APP_TABLE_NAMES).toContain("appConfig");
    expect(APP_TABLE_NAMES).toContain("emailQueue");
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

  it("parses --remote, --help, --yes and --env flags", () => {
    expect(parseResetArgs([])).toEqual({
      remote: false,
      help: false,
      yes: false,
      env: undefined,
    });
    expect(parseResetArgs(["--remote"])).toEqual({
      remote: true,
      help: false,
      yes: false,
      env: undefined,
    });
    expect(parseResetArgs(["-h"])).toEqual({
      remote: false,
      help: true,
      yes: false,
      env: undefined,
    });
    expect(
      parseResetArgs(["--remote", "--yes", "--env", "development"])
    ).toEqual({ remote: true, help: false, yes: true, env: "development" });
  });

  it("allows local reset with no confirmation", () => {
    expect(checkRemoteGuard(parseResetArgs([]))).toBeNull();
  });

  it("refuses --remote without --yes", () => {
    const refusal = checkRemoteGuard(parseResetArgs(["--remote"]));
    expect(refusal).toContain("--yes");
  });

  it("refuses --remote --yes without an explicit --env", () => {
    const refusal = checkRemoteGuard(parseResetArgs(["--remote", "--yes"]));
    expect(refusal).toContain("--env");
  });

  it("refuses --remote against a production env even with --yes", () => {
    const refusal = checkRemoteGuard(
      parseResetArgs(["--remote", "--yes", "--env", "production"])
    );
    expect(refusal).toContain("production");
  });

  it("allows --remote --yes --env development (a non-prod env)", () => {
    expect(
      checkRemoteGuard(
        parseResetArgs(["--remote", "--yes", "--env", "development"])
      )
    ).toBeNull();
  });
});
