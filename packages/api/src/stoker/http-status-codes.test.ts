import { describe, expect, it } from "vitest";

import * as codes from "@/stoker/http-status-codes";

describe("http-status-codes", () => {
  it("exports the canonical numeric codes used across routes", () => {
    expect(codes.OK).toBe(200);
    expect(codes.CREATED).toBe(201);
    expect(codes.NO_CONTENT).toBe(204);
    expect(codes.BAD_REQUEST).toBe(400);
    expect(codes.UNAUTHORIZED).toBe(401);
    expect(codes.FORBIDDEN).toBe(403);
    expect(codes.NOT_FOUND).toBe(404);
    expect(codes.CONFLICT).toBe(409);
    expect(codes.UNPROCESSABLE_ENTITY).toBe(422);
    expect(codes.TOO_MANY_REQUESTS).toBe(429);
    expect(codes.INTERNAL_SERVER_ERROR).toBe(500);
  });

  it("every export is an integer status number", () => {
    for (const value of Object.values(codes)) {
      expect(typeof value).toBe("number");
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(100);
      expect(value).toBeLessThan(600);
    }
  });
});
