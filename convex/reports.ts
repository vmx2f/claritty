import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardReport = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const [orders, clients, transactions, products] = await Promise.all([
      ctx.db
        .query("orders")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .collect(),
      ctx.db
        .query("clients")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .collect(),
      ctx.db
        .query("capitalTransactions")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .collect(),
      ctx.db
        .query("products")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .collect(),
    ]);

    const incomeTypes = ["income", "order_payment"];
    const expenseTypes = ["expense", "inventory_purchase"];

    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);

    const totalIncome = transactions
      .filter((t) => incomeTypes.includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => expenseTypes.includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    // Last 30 days stats
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentOrders = orders.filter((o) => o.createdAt >= thirtyDaysAgo);
    const recentRevenue = recentOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);

    return {
      totalOrders: orders.length,
      totalClients: clients.length,
      totalProducts: products.length,
      totalRevenue,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      recentOrders: recentOrders.length,
      recentRevenue,
      ordersByStatus: {
        pending: orders.filter((o) => o.status === "pending").length,
        paid: orders.filter((o) => o.status === "paid").length,
        shipped: orders.filter((o) => o.status === "shipped").length,
        cancelled: orders.filter((o) => o.status === "cancelled").length,
      },
    };
  },
});
