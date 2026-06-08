import { env } from "@barakah/env/app";

/**
 * Cloudflare API cutover flag (§10). When false the app stays on Convex; when
 * true reads/writes route through the Hono API. Kept in its own module so both
 * `lib/api-client` and `lib/auth-client` can read it without an import cycle.
 */
export const USE_CF_API = env.EXPO_PUBLIC_USE_CF_API;

/** Cloudflare Hono API base URL. Empty when the flag is off (api unused). */
export const API_BASE_URL = env.EXPO_PUBLIC_API_URL ?? "";
