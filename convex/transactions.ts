import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const transactionType = v.union(
  v.literal("income"),
  v.literal("order_payment"),
  v.literal("expense"),
  v.literal("inventory_purchase")
);

export const createTransaction = mutation({
  args: {
    orgId: v.id("organizations"),
    type: transactionType,
    amount: v.number(),
    description: v.string(),
    source: v.optional(v.string()),
    productId: v.optional(v.id("products")),
    date: v.optional(v.number()),
    orderId: v.optional(v.id("orders")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("capitalTransactions", {
      ...args,
      date: args.date ?? Date.now(),
    });
  },
});

export const getTransactions = query({
  args: {
    orgId: v.id("organizations"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    type: v.optional(transactionType),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("capitalTransactions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId));

    const transactions = await q.collect();

    let filtered = transactions;
    if (args.startDate) {
      filtered = filtered.filter((t) => t.date >= args.startDate!);
    }
    if (args.endDate) {
      filtered = filtered.filter((t) => t.date <= args.endDate!);
    }
    if (args.type) {
      filtered = filtered.filter((t) => t.type === args.type);
    }

    return filtered.sort((a, b) => b.date - a.date);
  },
});

export const getTransactionSummary = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("capitalTransactions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const incomeTypes = ["income", "order_payment"];
    const expenseTypes = ["expense", "inventory_purchase"];

    const totalIncome = transactions
      .filter((t) => incomeTypes.includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => expenseTypes.includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  },
});
