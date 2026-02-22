import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a role group
export const createRoleGroup = mutation({
    args: {
        organizationId: v.id("organizations"),
        name: v.string(),
        description: v.optional(v.string()),
        permissions: v.array(v.string()),
    },
    returns: v.id("roleGroups"),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // Check if user is owner
        const membership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .unique();

        if (!membership || (membership.role !== "owner" && !membership.permissions?.includes("settings"))) {
            throw new Error("Only organization owners or users with settings permission can create role groups");
        }

        return await ctx.db.insert("roleGroups", {
            organizationId: args.organizationId,
            name: args.name,
            description: args.description,
            permissions: args.permissions,
            createdBy: identity.subject,
            createdAt: Date.now(),
        });
    },
});

// Get role groups for an organization
export const getRoleGroups = query({
    args: {
        organizationId: v.id("organizations"),
    },
    returns: v.array(v.any()),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Check if user is member
        const membership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .unique();

        if (!membership) return [];

        return await ctx.db
            .query("roleGroups")
            .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
            .collect();
    },
});

// Update a role group
export const updateRoleGroup = mutation({
    args: {
        groupId: v.id("roleGroups"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        permissions: v.optional(v.array(v.string())),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const group = await ctx.db.get(args.groupId);
        if (!group) throw new Error("Role group not found");

        // Check if user is owner
        const membership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_organization", (q) => q.eq("organizationId", group.organizationId))
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .unique();

        if (!membership || (membership.role !== "owner" && !membership.permissions?.includes("settings"))) {
            throw new Error("Only organization owners or users with settings permission can update role groups");
        }

        const updates: any = {};
        if (args.name !== undefined) updates.name = args.name;
        if (args.description !== undefined) updates.description = args.description;
        if (args.permissions !== undefined) updates.permissions = args.permissions;

        await ctx.db.patch(args.groupId, updates);

        // If permissions changed, update all members in this group
        if (args.permissions) {
            const members = await ctx.db
                .query("organizationMembers")
                .withIndex("by_role_group", (q) => q.eq("roleGroupId", args.groupId))
                .collect();

            for (const member of members) {
                await ctx.db.patch(member._id, { permissions: args.permissions });
            }
        }
    },
});

// Delete a role group
export const deleteRoleGroup = mutation({
    args: {
        groupId: v.id("roleGroups"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const group = await ctx.db.get(args.groupId);
        if (!group) throw new Error("Role group not found");

        // Check if user is owner
        const membership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_organization", (q) => q.eq("organizationId", group.organizationId))
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .unique();

        if (!membership || (membership.role !== "owner" && !membership.permissions?.includes("settings"))) {
            throw new Error("Only organization owners or users with settings permission can delete role groups");
        }

        // Remove group reference from all members
        const members = await ctx.db
            .query("organizationMembers")
            .withIndex("by_role_group", (q) => q.eq("roleGroupId", args.groupId))
            .collect();

        for (const member of members) {
            await ctx.db.patch(member._id, { roleGroupId: undefined });
        }

        await ctx.db.delete(args.groupId);
    },
});
