import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { broadcastMock } = vi.hoisted(() => ({ broadcastMock: vi.fn() }));

vi.mock("@/sync/notify", () => ({
  broadcastToUser: broadcastMock,
}));

import { syncNotify } from "@/middlewares/sync-notify";
import type { AppBindings } from "@/types/app-type";

type User = { id: string } | null;

function buildApp(user: User) {
  const pending: Promise<unknown>[] = [];
  const app = new Hono<AppBindings>();

  app.use((c, next) => {
    c.set("user", user as AppBindings["Variables"]["user"]);
    c.set("logger", {
      error: vi.fn(),
    } as unknown as AppBindings["Variables"]["logger"]);
    return next();
  });
  app.use(syncNotify());

  app.post("/api/v1/prayer-logs", (c) => c.json({ ok: true }));
  app.get("/api/v1/prayer-logs", (c) => c.json({ ok: true }));
  app.post("/api/v1/app-config", (c) => c.json({ ok: true }));
  app.post("/api/v1/prayer-logs/fail", (c) => c.json({ bad: true }, 400));

  const executionCtx = {
    waitUntil: (p: Promise<unknown>) => pending.push(p),
    passThroughOnException: () => {
      // no-op
    },
  };

  const request = async (path: string, method: string) => {
    const res = await app.request(
      path,
      { method },
      { SYNC: {} } as unknown as AppBindings["Bindings"],
      executionCtx as unknown as ExecutionContext
    );
    await Promise.all(pending);
    return res;
  };

  return { request };
}

describe("syncNotify middleware", () => {
  beforeEach(() => broadcastMock.mockReset());

  it("broadcasts the mapped topic after a successful mutation", async () => {
    const { request } = buildApp({ id: "user-1" });
    await request("/api/v1/prayer-logs", "POST");
    expect(broadcastMock).toHaveBeenCalledWith(expect.anything(), "user-1", [
      "prayer-logs",
    ]);
  });

  it("does not broadcast on a read (GET)", async () => {
    const { request } = buildApp({ id: "user-1" });
    await request("/api/v1/prayer-logs", "GET");
    expect(broadcastMock).not.toHaveBeenCalled();
  });

  it("does not broadcast on a non-2xx mutation", async () => {
    const { request } = buildApp({ id: "user-1" });
    await request("/api/v1/prayer-logs/fail", "POST");
    expect(broadcastMock).not.toHaveBeenCalled();
  });

  it("does not broadcast for an unauthenticated request", async () => {
    const { request } = buildApp(null);
    await request("/api/v1/prayer-logs", "POST");
    expect(broadcastMock).not.toHaveBeenCalled();
  });

  it("does not broadcast for a domain with no reactive topic", async () => {
    const { request } = buildApp({ id: "user-1" });
    await request("/api/v1/app-config", "POST");
    expect(broadcastMock).not.toHaveBeenCalled();
  });
});
