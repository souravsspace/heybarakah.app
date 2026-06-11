import { env } from "@barakah/env/app";

/**
 * Cloudflare Hono API base URL. Kept in its own module so both `lib/api-client`
 * and `lib/auth-client` can read it without an import cycle.
 */
export const API_BASE_URL = env.EXPO_PUBLIC_API_URL;
