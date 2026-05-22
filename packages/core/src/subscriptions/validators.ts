import { v } from "convex/values";

export const productId = v.union(
  v.literal("yearly"),
  v.literal("monthly"),
  v.literal("family"),
  v.literal("lifetime")
);

export const revenueCatStore = v.union(
  v.literal("app_store"),
  v.literal("play_store"),
  v.literal("stripe"),
  v.literal("promotional"),
  v.literal("mac_app_store"),
  v.literal("amazon")
);

export const revenueCatPeriodType = v.union(
  v.literal("normal"),
  v.literal("trial"),
  v.literal("intro")
);
