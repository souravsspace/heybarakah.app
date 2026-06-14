import type { QueryKey } from "@tanstack/react-query";

/**
 * Mirror of the server sync topics (`packages/api/src/sync/topics.ts`). Maps a
 * coarse realtime topic to the React Query keys it invalidates on the receiving
 * device. A prayer-log write can shift the streak and unlock achievements, so
 * that topic fans out to several keys — matching the manual `invalidateQueries`
 * a same-device mutation already performs, now triggered cross-device by push.
 */
export const TOPIC_QUERY_KEYS: Record<string, QueryKey[]> = {
  "prayer-logs": [
    ["cf", "prayer-logs"],
    ["cf", "streak"],
    ["cf", "achievements"],
    ["cf", "achievements", "unseen"],
  ],
  achievements: [
    ["cf", "achievements"],
    ["cf", "achievements", "unseen"],
  ],
  locations: [["cf", "locations"]],
  shield: [["cf", "shield"]],
  subscription: [["cf", "subscription"]],
  me: [["cf", "me"]],
  dhikr: [["cf", "dhikr"]],
};
