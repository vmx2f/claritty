import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  capitalTransactions: defineTable({
    orgId: v.id("organizations"),
    type: v.union(
      v.literal("order_payment"),
      v.literal("inventory_purchase"),
      v.literal("expense")
    ),
    amount: v.number(),
    description: v.string(),
    date: v.number(),
    orderId: v.optional(v.id("orders")) // Link to order if applicable
  })
});

// Current capital = sum of all transactions