import { v } from "convex/values";

export const productId = v.union(
  v.literal("yearly"),
  v.literal("monthly"),
  v.literal("family"),
  v.literal("lifetime")
);
