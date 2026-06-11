import { DurableObject } from "cloudflare:workers";

import type { AppBindings } from "@/types/app-type";

interface InvalidateFrame {
  topics: string[];
  type: "invalidate";
}

/**
 * Per-user realtime hub. One Durable Object instance per Better Auth user id
 * (addressed via `SYNC.getByName(userId)`); it holds every one of that user's
 * device WebSockets through the Hibernation API, so the DO can be evicted from
 * memory between pushes while the sockets stay open.
 *
 * `broadcast` is invoked over RPC by the sync-notify middleware after a
 * successful mutation and fans a single invalidation frame out to all connected
 * devices. The client maps each topic back to its React Query keys and refetches
 * — the same invalidation model Convex uses, on a Cloudflare stack.
 */
export class SyncHub extends DurableObject<AppBindings["Bindings"]> {
  constructor(ctx: DurableObjectState, env: AppBindings["Bindings"]) {
    super(ctx, env);
    // App-level keepalive: the runtime answers client "ping" with "pong" without
    // waking the DO from hibernation, so idle connections cost nothing.
    this.ctx.setWebSocketAutoResponse(
      // biome-ignore lint/correctness/noUndeclaredVariables: workers runtime global
      new WebSocketRequestResponsePair("ping", "pong")
    );
  }

  override fetch(_request: Request): Response {
    // biome-ignore lint/correctness/noUndeclaredVariables: workers runtime global
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    // Hibernatable accept — unlike `server.accept()`, this lets the runtime evict
    // the DO from memory while keeping the socket alive.
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  /**
   * RPC entrypoint. Push an invalidation frame to every connected device.
   * Closed/closing sockets are skipped; the runtime reaps them on close.
   */
  broadcast(topics: string[]): void {
    const frame: InvalidateFrame = { type: "invalidate", topics };
    const payload = JSON.stringify(frame);
    for (const ws of this.ctx.getWebSockets()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  override webSocketError(ws: WebSocket): void {
    ws.close(1011, "socket error");
  }
}
