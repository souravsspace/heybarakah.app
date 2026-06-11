import { Scalar } from "@scalar/hono-api-reference";
import type { MiddlewareHandler } from "hono";

import { isTruthyFlag } from "@/env";
import type { AppBindings, AppOpenAPI } from "@/types/app-type";

export function configureOpenAPI(app: AppOpenAPI) {
  // Gate the OpenAPI spec + Scalar UI so the full API surface isn't published
  // in prod by default. Registration stays unconditional (keeps RPC types and
  // the route shape stable); the routes simply 404 unless an explicit dev flag
  // (DOCS_ENABLED or DEBUG) is set on `c.env`. Checked per-request since env is
  // only available at request time on Workers.
  const docsGate: MiddlewareHandler<AppBindings> = async (c, next) => {
    const enabled =
      isTruthyFlag((c.env as { DOCS_ENABLED?: string }).DOCS_ENABLED) ||
      isTruthyFlag((c.env as { DEBUG?: string }).DEBUG);
    if (!enabled) {
      return c.notFound();
    }
    await next();
  };
  app.use("/doc", docsGate);
  app.use("/docs", docsGate);

  app.doc("/doc", {
    openapi: "3.1.0",
    info: {
      title: "Barakah API",
      version: "0.0.0",
      description:
        "Barakah backend on Cloudflare. Authenticate with a Better Auth session — Bearer token (Expo) or cookie (web).",
    },
  });

  app.openAPIRegistry.registerComponent("securitySchemes", "BearerAuth", {
    type: "http",
    scheme: "bearer",
    description: "Better Auth bearer token (Expo clients).",
  });

  app.get(
    "/docs",
    Scalar({
      url: "/api/v1/doc",
      theme: "deepSpace",
      pageTitle: "Barakah API Documentation",
    })
  );
}
