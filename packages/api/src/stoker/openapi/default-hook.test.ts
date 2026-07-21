import { z } from "@hono/zod-openapi";
import { describe, expect, it, vi } from "vitest";

import defaultHook from "@/stoker/openapi/default-hook";

function fakeContext() {
  const json = vi.fn((body: unknown, status: number) => ({ body, status }));
  return { json } as unknown as Parameters<typeof defaultHook>[1] & {
    json: typeof json;
  };
}

describe("defaultHook", () => {
  it("returns 422 with the failed parse on validation error", () => {
    const parsed = z.object({ date: z.string() }).safeParse({});
    const c = fakeContext();

    defaultHook({ success: false, error: (parsed as any).error } as any, c);

    expect(c.json).toHaveBeenCalledTimes(1);
    const [body, status] = c.json.mock.calls[0];
    expect(status).toBe(422);
    expect(body).toMatchObject({ success: false });
    expect((body as { error: unknown }).error).toBeDefined();
  });

  it("does nothing (returns undefined) on a successful parse", () => {
    const c = fakeContext();
    const result = defaultHook({ success: true, data: { ok: 1 } } as any, c);

    expect(result).toBeUndefined();
    expect(c.json).not.toHaveBeenCalled();
  });
});
