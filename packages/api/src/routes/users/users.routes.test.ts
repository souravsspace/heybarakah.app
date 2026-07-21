import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";

import * as handlers from "./users.handlers";
import { usersRouter } from "./users.index";
import * as routes from "./users.routes";

interface RouteShape {
  method: string;
  path: string;
  responses: Record<string, unknown>;
  tags?: string[];
}

const ROUTES: [string, string, string][] = [
  ["getMyAccount", "get", "/me"],
  ["upsertProfile", "post", "/me/profile"],
  ["deleteMyAccount", "post", "/me/delete"],
  ["getMyAvatarUrl", "get", "/me/avatar"],
  ["setAvatar", "post", "/me/avatar"],
];

const routeMap = routes as unknown as Record<string, RouteShape>;
const handlerMap = handlers as unknown as Record<string, unknown>;

describe("users route contract", () => {
  it.each(
    ROUTES
  )("%s is a %s %s with documented responses", (name, method, path) => {
    const route = routeMap[name];
    expect(route.method).toBe(method);
    expect(route.path).toBe(path);
    expect(route.responses).toBeDefined();
    expect(Object.keys(route.responses).length).toBeGreaterThan(0);
  });

  it('tags every route under "Users"', () => {
    for (const [name] of ROUTES) {
      expect(routeMap[name].tags).toContain("Users");
    }
  });

  it("exports a handler function for every route", () => {
    for (const [name] of ROUTES) {
      expect(typeof handlerMap[name]).toBe("function");
    }
  });

  it("builds a mounted router and 404s an unknown path", async () => {
    const app = createTestApp(usersRouter);
    const res = await app.request("/__no_such_route__", {}, env);
    expect(res.status).toBe(404);
  });
});
