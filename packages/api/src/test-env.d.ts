/// <reference types="@cloudflare/vitest-pool-workers/types" />

// biome-ignore lint/style/noNamespace: ambient augmentation of the generated Cloudflare.Env
declare namespace Cloudflare {
  interface Env {
    DB: import("@cloudflare/workers-types").D1Database;
    KV: import("@cloudflare/workers-types").KVNamespace;
    R2: import("@cloudflare/workers-types").R2Bucket;
    // Migrations read from src/db/migrations in vitest.config.ts and applied in
    // test/apply-migrations.ts (test-only binding).
    TEST_MIGRATIONS: import("@cloudflare/vitest-pool-workers").D1Migration[];
  }
}
