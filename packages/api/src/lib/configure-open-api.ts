import { Scalar } from "@scalar/hono-api-reference";

import type { AppOpenAPI } from "@/types/app-type";

export function configureOpenAPI(app: AppOpenAPI) {
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
