import { describe, expect, it } from "vitest";

import * as phrases from "@/stoker/http-status-phrases";

describe("http-status-phrases", () => {
  it("exports the human-readable reason phrases used by handlers", () => {
    expect(phrases.OK).toBe("OK");
    expect(phrases.BAD_REQUEST).toBe("Bad Request");
    expect(phrases.UNAUTHORIZED).toBe("Unauthorized");
    expect(phrases.NOT_FOUND).toBe("Not Found");
    expect(phrases.UNPROCESSABLE_ENTITY).toBe("Unprocessable Entity");
    expect(phrases.TOO_MANY_REQUESTS).toBe("Too Many Requests");
    expect(phrases.INTERNAL_SERVER_ERROR).toBe("Internal Server Error");
  });

  it("every export is a non-empty string", () => {
    for (const value of Object.values(phrases)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
