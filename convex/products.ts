import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createProduct = mutation({
  args: {
    orgId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    sku: v.optional(v.string()),
    stock: v.optional(v.number()),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("products", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getProducts = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const getAllByOrg = query({
  args: {
    orgId: v.id("organizations"),
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let products = await ctx.db
      .query("products")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    if (args.from !== undefined) {
      products = products.filter((product) => product.createdAt >= args.from!);
    }
    if (args.to !== undefined) {
      products = products.filter((product) => product.createdAt <= args.to!);
    }

    return products;
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    sku: v.optional(v.string()),
    stock: v.optional(v.number()),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { productId, ...updates } = args;
    await ctx.db.patch(productId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return productId;
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.productId);
    return null;
  },
});
