import { describe, expect, it } from "vitest";

import { SyncHub } from "@/sync/sync-hub";

// Smoke coverage only: the Durable Object needs the Workers runtime harness
// (DurableObjectState, WebSocketPair, hibernation) to instantiate. These
// assertions pin the RPC/lifecycle surface the sync-notify path depends on;
// end-to-end DO behavior is exercised through the running worker.
describe("SyncHub surface", () => {
  it("is a Durable Object class", () => {
    expect(typeof SyncHub).toBe("function");
  });

  it("exposes the broadcast RPC entrypoint", () => {
    expect(typeof SyncHub.prototype.broadcast).toBe("function");
  });

  it("exposes fetch (WebSocket upgrade) and error lifecycle hooks", () => {
    expect(typeof SyncHub.prototype.fetch).toBe("function");
    expect(typeof SyncHub.prototype.webSocketError).toBe("function");
  });
});
