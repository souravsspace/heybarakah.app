import { env } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRouter } from "@/lib/create-router";
import { logger } from "@/middlewares/logger";
import onError from "@/stoker/middlewares/on-error";

function buildApp() {
  const app = createRouter();
  // logger() sets c.var.logger, which onError uses to record the real error.
  app.use(logger());
  app.get("/boom", () => {
    throw new Error("RESEND_API_KEY is missing");
  });
  app.onError(onError);
  return app;
}

afterEach(() => vi.restoreAllMocks());

describe("onError", () => {
  it("hides the raw message on a 500 (DEBUG off) but logs it server-side", async () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const app = buildApp();

    const res = await app.request("/boom", {}, env);
    const body = (await res.json()) as { message: string; stack?: string };

    expect(res.status).toBe(500);
    expect(body.message).toBe("Internal Server Error");
    expect(body.message).not.toContain("RESEND_API_KEY");
    expect(body.stack).toBeUndefined();

    // The real error is still logged server-side.
    const logged = errorSpy.mock.calls.map((c) => String(c[0])).join("\n");
    expect(logged).toContain("RESEND_API_KEY is missing");
  });

  it("exposes the real message + stack when DEBUG is on", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const app = buildApp();

    const res = await app.request("/boom", {}, {
      ...env,
      DEBUG: "true",
    } as unknown as typeof env);
    const body = (await res.json()) as { message: string; stack?: string };

    expect(res.status).toBe(500);
    expect(body.message).toBe("RESEND_API_KEY is missing");
    expect(body.stack).toBeDefined();
  });
});
