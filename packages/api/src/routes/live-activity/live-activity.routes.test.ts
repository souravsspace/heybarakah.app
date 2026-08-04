import { describe, expect, it } from "vitest";

import * as handlers from "./live-activity.handlers";
import * as routes from "./live-activity.routes";

interface RouteShape {
  method: string;
  path: string;
  responses: Record<string, unknown>;
  tags?: string[];
}

const ROUTES: [string, string, string][] = [
  ["registerPushToStartToken", "post", "/live-activity/push-to-start-token"],
];

const routeMap = routes as unknown as Record<string, RouteShape>;
const handlerMap = handlers as unknown as Record<string, unknown>;

describe("live-activity route contract", () => {
  it.each(
    ROUTES
  )("%s is a %s %s with documented responses", (name, method, path) => {
    const route = routeMap[name];
    expect(route.method).toBe(method);
    expect(route.path).toBe(path);
    expect(route.tags).toEqual(["Live Activity"]);
    expect(typeof handlerMap[name]).toBe("function");
  });

  it("documents the non-200 outcomes a client must handle", () => {
    const { responses } = routeMap.registerPushToStartToken;
    for (const status of ["200", "401", "422", "429", "500"]) {
      expect(responses[status]).toBeDefined();
    }
  });
});
