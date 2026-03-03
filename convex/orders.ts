import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrder = mutation({
  args: {
    orgId: v.id("organizations"),
    clientId: v.optional(v.id("clients")),
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

export const getAllByOrg = query({
  args: {
    orgId: v.id("organizations"),
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let orders = await ctx.db
      .query("orders")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    if (args.from !== undefined) {
      orders = orders.filter((order) => order.createdAt >= args.from!);
    }
    if (args.to !== undefined) {
      orders = orders.filter((order) => order.createdAt <= args.to!);
    }

    return orders;
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
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    const updateData: {
      status: "pending" | "paid" | "shipped" | "cancelled";
      paidAt?: number;
      shippedAt?: number;
    } = { status };

    if (status === "paid") {
      updateData.paidAt = Date.now();
      // Record income in capital transactions (Ingresos)
      await ctx.db.insert("capitalTransactions", {
        orgId: order.orgId,
        type: "order_payment",
        amount: order.total,
        description: `Pago orden - ${order.customerName}`,
        source: "orden",
        date: Date.now(),
        orderId,
      });
    } else if (status === "shipped") {
      updateData.shippedAt = Date.now();
      updateData.paidAt = Date.now(); // Auto-mark as paid when shipped
      // Record income if not already recorded (e.g. shipped without explicit paid)
      const existingTx = await ctx.db
        .query("capitalTransactions")
        .withIndex("by_orgId", (q) => q.eq("orgId", order.orgId))
        .filter((q) => q.eq(q.field("orderId"), orderId))
        .first();
      if (!existingTx) {
        await ctx.db.insert("capitalTransactions", {
          orgId: order.orgId,
          type: "order_payment",
          amount: order.total,
          description: `Orden enviada - ${order.customerName}`,
          source: "orden",
          date: Date.now(),
          orderId,
        });
      }
    }

    await ctx.db.patch(orderId, updateData);
    return orderId;
  },
});
