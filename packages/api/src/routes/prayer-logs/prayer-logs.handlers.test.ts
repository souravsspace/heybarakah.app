import { describe, expect, it } from "vitest";

import * as handlers from "./prayer-logs.handlers";
import * as routes from "./prayer-logs.routes";

const ROUTE_NAMES = ["getMyWeek", "logPrayer", "getStreak", "clearPrayer"];

const handlerMap = handlers as unknown as Record<string, unknown>;
const routeMap = routes as unknown as Record<string, unknown>;

describe("prayer-logs handlers", () => {
  it("exports a function handler for every declared route", () => {
    for (const name of ROUTE_NAMES) {
      expect(typeof handlerMap[name]).toBe("function");
      expect(routeMap[name]).toBeDefined();
    }
  });

  it("handler exports are in parity with the route contract", () => {
    expect(Object.keys(handlers).sort()).toEqual([...ROUTE_NAMES].sort());
  });
});
