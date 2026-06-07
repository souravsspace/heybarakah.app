import { describe, expect, it } from "vitest";

import {
  APP_TABLE_NAMES,
  buildClearStatements,
  parseResetArgs,
} from "./reset-db";

describe("reset-db", () => {
  it("covers all 12 app tables", () => {
    expect(APP_TABLE_NAMES).toHaveLength(12);
    expect(APP_TABLE_NAMES).toContain("users");
    expect(APP_TABLE_NAMES).toContain("appConfig");
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
