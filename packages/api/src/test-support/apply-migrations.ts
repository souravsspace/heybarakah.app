import { applyD1Migrations, env } from "cloudflare:test";
import { beforeAll } from "vitest";

// Shared test helper: applies every migration in src/db/migrations to the
// isolated D1 instance before a file's tests run. The migrations are read once
// in vitest.config.ts (readD1Migrations) and passed through as the
// TEST_MIGRATIONS binding — so tests never import individual `.sql` files and a
// new migration is picked up automatically.
//
// Call this at the top level of any test file that touches the database:
//
//   import { applyMigrations } from "@/test-support/apply-migrations";
//   applyMigrations();
//
// It registers a `beforeAll` hook inside the calling file's own module realm.
// (Doing this from a global `setupFiles` instead would eagerly boot the worker
// graph — caching the real `resend` module — before per-file `vi.mock(...)`
// calls register, breaking those mocks.)
export function applyMigrations(): void {
  beforeAll(async () => {
    await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
  });
}
