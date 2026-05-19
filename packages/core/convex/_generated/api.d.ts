/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_chat from "../lib/chat.js";
import type * as lib_chatHelpers from "../lib/chatHelpers.js";
import type * as lib_chatRateLimit from "../lib/chatRateLimit.js";
import type * as lib_dhikr from "../lib/dhikr.js";
import type * as lib_env from "../lib/env.js";
import type * as lib_healthCheck from "../lib/healthCheck.js";
import type * as lib_marketing from "../lib/marketing.js";
import type * as lib_polar from "../lib/polar.js";
import type * as lib_prayerLogs from "../lib/prayerLogs.js";
import type * as lib_prayerTimes from "../lib/prayerTimes.js";
import type * as lib_resend from "../lib/resend.js";
import type * as lib_shieldSelection from "../lib/shieldSelection.js";
import type * as lib_subscriptions from "../lib/subscriptions.js";
import type * as lib_users from "../lib/users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/chat": typeof lib_chat;
  "lib/chatHelpers": typeof lib_chatHelpers;
  "lib/chatRateLimit": typeof lib_chatRateLimit;
  "lib/dhikr": typeof lib_dhikr;
  "lib/env": typeof lib_env;
  "lib/healthCheck": typeof lib_healthCheck;
  "lib/marketing": typeof lib_marketing;
  "lib/polar": typeof lib_polar;
  "lib/prayerLogs": typeof lib_prayerLogs;
  "lib/prayerTimes": typeof lib_prayerTimes;
  "lib/resend": typeof lib_resend;
  "lib/shieldSelection": typeof lib_shieldSelection;
  "lib/subscriptions": typeof lib_subscriptions;
  "lib/users": typeof lib_users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  persistentTextStreaming: import("@convex-dev/persistent-text-streaming/_generated/component.js").ComponentApi<"persistentTextStreaming">;
};
