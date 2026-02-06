import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrder = mutation({
  args: {
    orgId: v.id("organizations"),
    clientId: v.id("clients"),
    customerName: v.string(),
    items: v.array(
      v.object({
        product: v.string(),
        quantity: v.number(),
        price: v.number()
      })
    ),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
    return orderId;
  },
});

export const getOrders = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const { orderId, status } = args;
    const updateData: any = { status };
    
    if (status === "paid") {
      updateData.paidAt = Date.now();
    } else if (status === "shipped") {
      updateData.shippedAt = Date.now();
      updateData.paidAt = Date.now(); // Auto-mark as paid when shipped
    }
    
    await ctx.db.patch(orderId, updateData);
    return orderId;
  },
});
