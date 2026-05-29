import { v } from "convex/values";
import {
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "../_generated/server";
import { authComponent } from "./auth";

const NAME_MAX_LENGTH = 60;
const NAME_REGEX = /^[\p{L}\p{N}\s'\-.,]+$/u;
const MAX_LOCATIONS = 20;

function validateName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Location name is required");
  }
  if (trimmed.length > NAME_MAX_LENGTH) {
    throw new Error(`Name exceeds ${NAME_MAX_LENGTH} characters`);
  }
  if (!NAME_REGEX.test(trimmed)) {
    throw new Error("Name contains unsupported characters");
  }
  return trimmed;
}

function validateCoords(latitude: number, longitude: number) {
  if (latitude < -90 || latitude > 90) {
    throw new Error("Invalid latitude");
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error("Invalid longitude");
  }
}

function validateTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    throw new Error("Invalid timezone");
  }
}

async function getProfile(ctx: QueryCtx | MutationCtx, authUserId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
    .unique();
}

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return { locations: [], activeId: null };
    }
    const locations = await ctx.db
      .query("userLocations")
      .withIndex("by_user", (q) => q.eq("authUserId", user._id))
      .collect();
    const profile = await getProfile(ctx, user._id);
    return {
      locations: locations.sort((a, b) => a.createdAt - b.createdAt),
      activeId: profile?.activePrayerLocationId ?? null,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    timezone: v.string(),
    city: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    setActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const name = validateName(args.name);
    validateCoords(args.latitude, args.longitude);
    validateTimezone(args.timezone);

    const existing = await ctx.db
      .query("userLocations")
      .withIndex("by_user", (q) => q.eq("authUserId", user._id))
      .take(MAX_LOCATIONS);
    if (existing.length >= MAX_LOCATIONS) {
      throw new Error(`Maximum of ${MAX_LOCATIONS} saved locations`);
    }

    const now = Date.now();
    const id = await ctx.db.insert("userLocations", {
      authUserId: user._id,
      name,
      latitude: args.latitude,
      longitude: args.longitude,
      timezone: args.timezone,
      city: args.city,
      countryCode: args.countryCode,
      createdAt: now,
      updatedAt: now,
    });

    if (args.setActive) {
      const profile = await getProfile(ctx, user._id);
      if (profile) {
        await ctx.db.patch(profile._id, { activePrayerLocationId: id });
      }
    }

    return id;
  },
});

export const rename = mutation({
  args: { id: v.id("userLocations"), name: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.authUserId !== user._id) {
      throw new Error("Location not found");
    }
    const name = validateName(args.name);
    await ctx.db.patch(args.id, { name, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("userLocations") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.authUserId !== user._id) {
      throw new Error("Location not found");
    }
    const profile = await getProfile(ctx, user._id);
    if (profile?.activePrayerLocationId === args.id) {
      await ctx.db.patch(profile._id, { activePrayerLocationId: undefined });
    }
    await ctx.db.delete(args.id);
  },
});

export const setActive = mutation({
  args: { id: v.union(v.id("userLocations"), v.null()) },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    if (args.id) {
      const existing = await ctx.db.get(args.id);
      if (!existing || existing.authUserId !== user._id) {
        throw new Error("Location not found");
      }
    }
    const profile = await getProfile(ctx, user._id);
    if (!profile) {
      throw new Error("Profile not found");
    }
    await ctx.db.patch(profile._id, {
      activePrayerLocationId: args.id ?? undefined,
    });
  },
});
