import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  cloudflareTest,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const here = dirname(fileURLToPath(import.meta.url));

// Read every migration in src/db/migrations once, at config load. They are
// handed to the worker as the TEST_MIGRATIONS binding; each DB-touching test
// file applies them via the `applyMigrations()` helper (src/test-support) — so
// tests never import individual `.sql` files and a new migration is picked up
// automatically.
const migrations = await readD1Migrations(resolve(here, "src/db/migrations"));

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(here, "src"),
    },
  },
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.toml" },
      miniflare: {
        compatibilityFlags: ["nodejs_compat"],
        bindings: { TEST_MIGRATIONS: migrations },
      },
    }),
  ],
});
