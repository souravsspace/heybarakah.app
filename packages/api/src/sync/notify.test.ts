import { describe, expect, it, vi } from "vitest";

import { broadcastToUser } from "@/sync/notify";
import type { AppBindings } from "@/types/app-type";

function fakeEnv(broadcast: (topics: string[]) => Promise<void>) {
  const getByName = vi.fn(() => ({ broadcast }));
  return {
    env: { SYNC: { getByName } } as unknown as AppBindings["Bindings"],
    getByName,
  };
}

describe("broadcastToUser", () => {
  it("addresses the hub by user id and forwards the topics", async () => {
    const broadcast = vi.fn(() => Promise.resolve());
    const { env, getByName } = fakeEnv(broadcast);

    await broadcastToUser(env, "user-1", ["prayer-logs", "achievements"]);

    expect(getByName).toHaveBeenCalledWith("user-1");
    expect(broadcast).toHaveBeenCalledWith(["prayer-logs", "achievements"]);
  });

  it("propagates a rejection from the hub RPC (caller swallows it)", async () => {
    const broadcast = vi.fn(() => Promise.reject(new Error("do down")));
    const { env } = fakeEnv(broadcast);

    await expect(broadcastToUser(env, "u", ["me"])).rejects.toThrow("do down");
  });
});
