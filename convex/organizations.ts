import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_ACTIVE_BLOCKS = [
  "chat",
  "notifications",
  "settings",
  "reports",
  "products",
  "clients",
  "orders",
  "incomes",
  "outputs",
];

// Create a new organization
export const createOrganization = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("organizations"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      description: args.description,
      ownerId: identity.subject,
      blockConfig: {
        active: DEFAULT_ACTIVE_BLOCKS,
        disabledAt: {},
        preset: "standard",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    });

    // Add the creator as an owner
    await ctx.db.insert("organizationMembers", {
      organizationId,
      userId: identity.subject,
      role: "owner",
      permissions: ["create", "edit", "delete", "invite", "manage_permissions"],
      invitedBy: identity.subject,
      joinedAt: Date.now(),
      isActive: true,
    });

    // Log the activity
    await ctx.db.insert("organizationActivity", {
      organizationId,
      userId: identity.subject,
      action: "created",
      details: `Organization "${args.name}" was created`,
      timestamp: Date.now(),
    });

    return organizationId;
  },
});

// Get file URL for display (e.g. org image)
export const getFileUrl = query({
  args: { storageId: v.union(v.id("_storage"), v.null()) },
  handler: async (ctx, args) => {
    if (!args.storageId) return null;
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Get all organizations for the current user
export const getUserOrganizations = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const activeMemberships = memberships.filter(m => m.isActive);

    const organizations = await Promise.all(
      activeMemberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        if (!org || !org.isActive) return null;
        return {
          ...org,
          userRole: membership.role,
          userPermissions: membership.permissions,
        };
      })
    );

    return organizations.filter(Boolean);
  },
});

// Get organization details with members
export const getOrganizationDetails = query({
  args: {
    organizationId: v.id("organizations"),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Check if user is a member
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const membership = memberships.find(m => m.userId === identity.subject && m.isActive);

    if (!membership) {
      return null;
    }

    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      return null;
    }

    const activeMembers = memberships.filter(m => m.isActive);

    return {
      ...organization,
      members: activeMembers,
      currentUserRole: membership.role,
      currentUserPermissions: membership.permissions,
    };
  },
});

// Generate upload URL for organization image
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Update organization
export const updateOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if user has edit permissions
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const membership = memberships.find(m => m.userId === identity.subject && m.isActive);

    if (!membership || (!membership.permissions.includes("edit") && membership.role !== "owner")) {
      throw new Error("Insufficient permissions");
    }

    const updateData: {
      updatedAt: number;
      name?: string;
      description?: string;
      imageStorageId?: typeof args.imageStorageId;
    } = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.imageStorageId !== undefined) updateData.imageStorageId = args.imageStorageId;

    await ctx.db.patch(args.organizationId, updateData);

    // Log the activity
    await ctx.db.insert("organizationActivity", {
      organizationId: args.organizationId,
      userId: identity.subject,
      action: "updated",
      details: "Organization details were updated",
      timestamp: Date.now(),
    });
  },
});

// Delete organization
export const deleteOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if user is the owner
    const organization = await ctx.db.get(args.organizationId);
    if (!organization || organization.ownerId !== identity.subject) {
      throw new Error("Only the owner can delete an organization");
    }

    // Mark organization as inactive
    await ctx.db.patch(args.organizationId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    // Deactivate all memberships
    const members = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    for (const member of members) {
      await ctx.db.patch(member._id, {
        isActive: false,
      });
    }

    // Log the activity
    await ctx.db.insert("organizationActivity", {
      organizationId: args.organizationId,
      userId: identity.subject,
      action: "deleted",
      details: "Organization was deleted",
      timestamp: Date.now(),
    });
  },
});

export const updateOrganizationBlockConfig = mutation({
  args: {
    organizationId: v.id("organizations"),
    blockConfig: v.object({
      active: v.array(v.string()),
      disabledAt: v.record(v.string(), v.number()),
      preset: v.optional(v.string()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const membership = memberships.find((m) => m.userId === identity.subject && m.isActive);
    if (!membership || (membership.role !== "owner" && !membership.permissions.includes("settings"))) {
      throw new Error("Insufficient permissions");
    }

    await ctx.db.patch(args.organizationId, {
      blockConfig: args.blockConfig,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("organizationActivity", {
      organizationId: args.organizationId,
      userId: identity.subject,
      action: "updated",
      details: "Organization block configuration updated",
      timestamp: Date.now(),
    });

    return null;
  },
});
