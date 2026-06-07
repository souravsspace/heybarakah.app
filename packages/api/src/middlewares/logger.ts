import type { MiddlewareHandler } from "hono";

type LogMeta = Record<string, unknown>;

export interface Logger {
  debug: (message: string, meta?: LogMeta) => void;
  error: (message: string, meta?: LogMeta) => void;
  info: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
}

function emit(level: string, requestId: string) {
  return (message: string, meta?: LogMeta) => {
    // Structured single-line log; workerd tail picks this up. No secrets logged.
    console[level === "debug" ? "log" : (level as "info" | "warn" | "error")](
      JSON.stringify({ level, requestId, message, ...meta })
    );
  };
}

function createLogger(requestId: string): Logger {
  return {
    info: emit("info", requestId),
    warn: emit("warn", requestId),
    error: emit("error", requestId),
    debug: emit("debug", requestId),
  };
}

/**
 * Structured request logger. Sets `c.var.logger` and logs method/path/status
 * plus duration on completion. Workers-native (no pino / node deps).
 */
export function logger(): MiddlewareHandler {
  return async (c, next) => {
    const requestId = crypto.randomUUID();
    const log = createLogger(requestId);
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
