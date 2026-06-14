// Realtime sync topics. A successful mutation to one of these domains fans an
// invalidation out to the user's other devices (see sync-notify middleware +
// SyncHub). The key is the first path segment after `/api/v1`; the value is the
// coarse topic the client maps back to React Query keys (lib/sync-topics.ts).
//
// Domains with no client-visible reactive query are intentionally absent
// (health-check, prayer-times cache, app-config, marketing, webhooks) —
// mutating them pushes nothing.
export const SYNC_TOPICS = {
  "prayer-logs": "prayer-logs",
  achievements: "achievements",
  locations: "locations",
  shield: "shield",
  subscription: "subscription",
  me: "me",
  dhikr: "dhikr",
} as const;

export type SyncTopic = (typeof SYNC_TOPICS)[keyof typeof SYNC_TOPICS];

const API_SEGMENT_RE = /\/api\/v1\/([^/?]+)/;

/**
 * Derive the sync topic for a mutated request path. Matches the first segment
 * after `/api/v1` against {@link SYNC_TOPICS}. Returns null for any path with no
 * reactive client query (the caller then skips the push).
 */
export function topicForPath(path: string): SyncTopic | null {
  const match = path.match(API_SEGMENT_RE);
  if (!match) {
    return null;
  }
  const segment = match[1] as keyof typeof SYNC_TOPICS;
  return SYNC_TOPICS[segment] ?? null;
}
