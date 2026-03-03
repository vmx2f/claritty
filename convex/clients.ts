import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createClient = mutation({
  args: {
    orgId: v.id("organizations"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("prospect")),
  },
  returns: v.id("clients"),
  handler: async (ctx, args) => {
    const clientId = await ctx.db.insert("clients", {
      ...args,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return clientId;
  },
});

export const getClients = query({
  args: {
    orgId: v.id("organizations"),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clients")
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
    let clients = await ctx.db
      .query("clients")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    if (args.from !== undefined) {
      clients = clients.filter((client) => client.createdAt >= args.from!);
    }
    if (args.to !== undefined) {
      clients = clients.filter((client) => client.createdAt <= args.to!);
    }

    return clients;
  },
});

export const updateClient = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("prospect"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { clientId, ...updateData } = args;
    await ctx.db.patch(clientId, {
      ...updateData,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const deleteClient = mutation({
  args: {
    clientId: v.id("clients"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.clientId);
    return null;
  },
});

export const getClientStats = query({
  args: {
    orgId: v.id("organizations"),
  },
  returns: v.object({
    totalClients: v.number(),
    activeClients: v.number(),
    prospectClients: v.number(),
    inactiveClients: v.number(),
    totalRevenue: v.number(),
  }),
  handler: async (ctx, args) => {
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === "active").length;
    const prospectClients = clients.filter(c => c.status === "prospect").length;
    const inactiveClients = clients.filter(c => c.status === "inactive").length;
    const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0);

    return {
      totalClients,
      activeClients,
      prospectClients,
      inactiveClients,
      totalRevenue,
    };
  },
});
