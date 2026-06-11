import type { MiddlewareHandler } from "hono";

import { isTruthyFlag } from "@/env";

type LogMeta = Record<string, unknown>;

export interface Logger {
  debug: (message: string, meta?: LogMeta) => void;
  error: (message: string, meta?: LogMeta) => void;
  info: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
}

function emit(level: string, requestId: string, debugEnabled: boolean) {
  return (message: string, meta?: LogMeta) => {
    // `debug` is suppressed unless a DEBUG/LOG_LEVEL flag is set, so prod logs
    // stay quiet while local dev keeps full verbosity.
    if (level === "debug" && !debugEnabled) {
      return;
    }
    // Structured single-line log; workerd tail picks this up. No secrets logged.
    console[level === "debug" ? "log" : (level as "info" | "warn" | "error")](
      JSON.stringify({ level, requestId, message, ...meta })
    );
  };
}

export function createLogger(requestId: string, debugEnabled = false): Logger {
  return {
    info: emit("info", requestId, debugEnabled),
    warn: emit("warn", requestId, debugEnabled),
    error: emit("error", requestId, debugEnabled),
    debug: emit("debug", requestId, debugEnabled),
  };
}

/**
 * Structured request logger. Sets `c.var.logger` and logs method/path/status
 * plus duration on completion. Workers-native (no pino / node deps).
 */
export function logger(): MiddlewareHandler {
  return async (c, next) => {
    const requestId = crypto.randomUUID();
    const debugEnabled =
      isTruthyFlag((c.env as { DEBUG?: string }).DEBUG) ||
      isTruthyFlag((c.env as { LOG_LEVEL?: string }).LOG_LEVEL);
    const log = createLogger(requestId, debugEnabled);
    c.set("logger", log);
    c.header("x-request-id", requestId);

    const start = Date.now();
    await next();
    log.info("request", {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Date.now() - start,
    });
  };
}
