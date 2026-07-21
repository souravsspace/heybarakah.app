import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { configureOpenAPI } from "@/lib/configure-open-api";
import { createRouter } from "@/lib/create-router";

function appWithDocs() {
  const app = createRouter();
  configureOpenAPI(app);
  return app;
}

describe("configureOpenAPI docs gate", () => {
  it("404s /doc when neither DOCS_ENABLED nor DEBUG is set", async () => {
    const res = await appWithDocs().request(
      "/doc",
      {},
      { ...env, DOCS_ENABLED: undefined, DEBUG: undefined }
    );
    expect(res.status).toBe(404);
  });

  it("serves the OpenAPI document when DOCS_ENABLED is truthy", async () => {
    const res = await appWithDocs().request(
      "/doc",
      {},
      { ...env, DOCS_ENABLED: "true" }
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      openapi: string;
      info: { title: string };
    };
    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toBe("Barakah API");
  });

  it("serves docs when DEBUG is truthy even if DOCS_ENABLED is unset", async () => {
    const res = await appWithDocs().request("/doc", {}, { ...env, DEBUG: "1" });
    expect(res.status).toBe(200);
  });

  it("serves the Scalar UI at /docs when enabled", async () => {
    const res = await appWithDocs().request(
      "/docs",
      {},
      { ...env, DOCS_ENABLED: "true" }
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
  });
});
