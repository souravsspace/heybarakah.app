import type { QueryClient } from "@tanstack/react-query";
import { AppState, type AppStateStatus, Platform } from "react-native";

import { authClient } from "@/lib/auth-client";
import { API_BASE_URL } from "@/lib/cf-flag";
import { TOPIC_QUERY_KEYS } from "@/lib/sync-topics";

const HEARTBEAT_MS = 25_000;
const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30_000;

interface InvalidateFrame {
  topics: string[];
  type: "invalidate";
}

interface NativeSocketOptions {
  headers: Record<string, string>;
}

function toWsUrl(base: string): string {
  // http→ws, https→wss; the endpoint runs through the same auth middleware.
  return `${base.replace(/^http/, "ws")}/api/v1/sync`;
}

/**
 * Client end of the realtime sync channel. Holds one WebSocket to the user's
 * SyncHub Durable Object and turns server `invalidate` frames into React Query
 * invalidations — the same reactive model Convex gives, over the Cloudflare
 * Hono API. Survives flaky mobile networks with exponential-backoff reconnects
 * and app foreground/background transitions, and keeps the link warm with a
 * heartbeat the DO auto-answers without waking from hibernation.
 */
export class SyncSocket {
  private readonly queryClient: QueryClient;
  private ws: WebSocket | null = null;
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempts = 0;
  private stopped = true;
  private appStateSub: { remove: () => void } | null = null;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  start(): void {
    if (!this.stopped) {
      return;
    }
    this.stopped = false;
    this.appStateSub = AppState.addEventListener("change", this.onAppState);
    this.open();
  }

  stop(): void {
    this.stopped = true;
    this.appStateSub?.remove();
    this.appStateSub = null;
    this.clearTimers();
    this.closeSocket();
  }

  private readonly onAppState = (state: AppStateStatus): void => {
    if (this.stopped) {
      return;
    }
    // On return to foreground, reconnect immediately if the socket dropped while
    // the OS had the app suspended. Background needs no action — the socket
    // closes on its own and we reconnect on the next "active".
    if (
      state === "active" &&
      (!this.ws || this.ws.readyState > WebSocket.OPEN)
    ) {
      this.attempts = 0;
      this.open();
    }
  };

  private open(): void {
    if (this.stopped) {
      return;
    }
    this.closeSocket();
    const url = toWsUrl(API_BASE_URL);
    try {
      this.ws = this.createSocket(url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws.onopen = this.onOpen;
    this.ws.onmessage = this.onMessage;
    this.ws.onclose = this.onClose;
    this.ws.onerror = this.onClose;
  }

  private createSocket(url: string): WebSocket {
    // Native replays the Better Auth Set-Cookie as a header (mirrors api-client);
    // web rides the credentialed cookie the browser attaches automatically.
    const options = this.nativeOptions();
    if (Platform.OS !== "web" && options) {
      // React Native's WebSocket accepts a third `options` arg (headers); the
      // lib.dom type only declares 1–2 params, so bridge the constructor.
      const NativeWebSocket = WebSocket as unknown as new (
        url: string,
        protocols: undefined,
        options: NativeSocketOptions
      ) => WebSocket;
      return new NativeWebSocket(url, undefined, options);
    }
    return new WebSocket(url);
  }

  private nativeOptions(): NativeSocketOptions | null {
    const cookie = (authClient as { getCookie?: () => string }).getCookie?.();
    return cookie ? { headers: { Cookie: cookie } } : null;
  }

  private readonly onOpen = (): void => {
    this.attempts = 0;
    this.startHeartbeat();
  };

  private readonly onMessage = (event: { data: unknown }): void => {
    if (typeof event.data !== "string" || event.data === "pong") {
      return;
    }
    let frame: InvalidateFrame;
    try {
      frame = JSON.parse(event.data) as InvalidateFrame;
    } catch {
      return;
    }
    if (frame.type !== "invalidate" || !Array.isArray(frame.topics)) {
      return;
    }
    for (const topic of frame.topics) {
      const keys = TOPIC_QUERY_KEYS[topic];
      if (!keys) {
        continue;
      }
      for (const queryKey of keys) {
        void this.queryClient.invalidateQueries({ queryKey });
      }
    }
  };

  private readonly onClose = (): void => {
    this.clearHeartbeat();
    if (this.stopped) {
      return;
    }
    this.scheduleReconnect();
  };

  private startHeartbeat(): void {
    this.clearHeartbeat();
    this.heartbeat = setInterval(() => {
      // The DO answers "ping" with "pong" via setWebSocketAutoResponse, keeping
      // NAT/idle timers alive without waking it from hibernation.
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send("ping");
      }
    }, HEARTBEAT_MS);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }
    const backoff = Math.min(
      MAX_BACKOFF_MS,
      BASE_BACKOFF_MS * 2 ** this.attempts
    );
    const delay = backoff / 2 + Math.random() * (backoff / 2);
    this.attempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, delay);
  }

  private clearHeartbeat(): void {
    if (this.heartbeat) {
      clearInterval(this.heartbeat);
      this.heartbeat = null;
    }
  }

  private clearTimers(): void {
    this.clearHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private closeSocket(): void {
    if (!this.ws) {
      return;
    }
    this.ws.onopen = null;
    this.ws.onmessage = null;
    this.ws.onclose = null;
    this.ws.onerror = null;
    try {
      this.ws.close();
    } catch {
      // already closed
    }
    this.ws = null;
  }
}
