import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const entryType = v.union(
  v.literal("user-action"),
  v.literal("system-log"),
  v.literal("inline-form"),
  v.literal("success"),
  v.literal("error")
);

export const record = mutation({
  args: {
    orgId: v.optional(v.id("organizations")),
    actionId: v.string(),
    actionLabel: v.string(),
    category: v.string(),
    entryType,
    message: v.string(),
    payload: v.optional(v.any()),
  },
  returns: v.id("actionLogs"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("actionLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
    orgId: v.optional(v.id("organizations")),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    let entries = args.orgId
      ? await ctx.db
          .query("actionLogs")
          .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
          .collect()
      : await ctx.db.query("actionLogs").collect();

    if (args.category) {
      entries = entries.filter((entry) => entry.category === args.category);
    }

    entries.sort((a, b) => a.createdAt - b.createdAt);

    const max = args.limit && args.limit > 0 ? args.limit : 150;
    return entries.slice(-max);
  },
});

export const clear = mutation({
  args: {
    orgId: v.optional(v.id("organizations")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const entries = args.orgId
      ? await ctx.db
          .query("actionLogs")
          .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
          .collect()
      : await ctx.db.query("actionLogs").collect();

    await Promise.all(entries.map((entry) => ctx.db.delete(entry._id)));
    return null;
  },
});
