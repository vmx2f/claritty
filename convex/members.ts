import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Invite a user to an organization
export const inviteMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    permissions: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if user has invite permissions
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const membership = memberships.find(m => m.userId === identity.subject && m.isActive);

    if (!membership || (!membership.permissions.includes("invite") && membership.role !== "owner")) {
      throw new Error("Insufficient permissions to invite members");
    }

    // For now, we'll assume the email corresponds to a user ID
    // In a real implementation, you'd want to look up the user by email
    const invitedUserId = args.email; // This is a simplification

    // Check if user is already a member
    const existingMember = memberships.find(m => m.userId === invitedUserId);

    if (existingMember) {
      throw new Error("User is already a member of this organization");
    }

    // Add the new member
    await ctx.db.insert("organizationMembers", {
      organizationId: args.organizationId,
      userId: invitedUserId,
      role: args.role,
      permissions: args.permissions,
      invitedBy: identity.subject,
      joinedAt: Date.now(),
      isActive: true,
    });

    // Create notification for the invited user
    await ctx.db.insert("notifications", {
      userId: invitedUserId,
      organizationId: args.organizationId,
      type: "member_added",
      title: "You've been added to an organization",
      message: `You've been added as a ${args.role} to the organization`,
      isRead: false,
      createdAt: Date.now(),
    });

    // Log the activity
    await ctx.db.insert("organizationActivity", {
      organizationId: args.organizationId,
      userId: identity.subject,
      action: "member_added",
      details: `New member ${args.email} was added as ${args.role}`,
      timestamp: Date.now(),
    });
  },
});

// Update member role and permissions
export const updateMemberRole = mutation({
  args: {
    organizationId: v.id("organizations"),
    memberId: v.id("organizationMembers"),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    permissions: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if user has manage permissions permissions
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const membership = memberships.find(m => m.userId === identity.subject && m.isActive);

    if (!membership || (!membership.permissions.includes("manage_permissions") && membership.role !== "owner")) {
      throw new Error("Insufficient permissions to manage member roles");
    }

    const memberToUpdate = await ctx.db.get(args.memberId);
    if (!memberToUpdate || memberToUpdate.organizationId !== args.organizationId) {
      throw new Error("Member not found");
    }

    // Don't allow changing the owner's role
    if (memberToUpdate.role === "owner") {
      throw new Error("Cannot change the owner's role");
    }

    const oldRole = memberToUpdate.role;

    await ctx.db.patch(args.memberId, {
      role: args.role,
      permissions: args.permissions,
    });

    // Create notification for the member whose role was changed
    await ctx.db.insert("notifications", {
      userId: memberToUpdate.userId,
      organizationId: args.organizationId,
      type: "role_changed",
      title: "Your role has been updated",
      message: `Your role was changed from ${oldRole} to ${args.role}`,
      isRead: false,
      createdAt: Date.now(),
    });

    // Log the activity
    await ctx.db.insert("organizationActivity", {
      organizationId: args.organizationId,
      userId: identity.subject,
      action: "role_changed",
      details: `Member role was updated from ${oldRole} to ${args.role}`,
      timestamp: Date.now(),
    });
  },
});

// Remove a member from an organization
export const removeMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    memberId: v.id("organizationMembers"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if user has remove permissions
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const membership = memberships.find(m => m.userId === identity.subject && m.isActive);

    if (!membership || (!membership.permissions.includes("delete") && membership.role !== "owner")) {
      throw new Error("Insufficient permissions to remove members");
    }

    const memberToRemove = await ctx.db.get(args.memberId);
    if (!memberToRemove || memberToRemove.organizationId !== args.organizationId) {
      throw new Error("Member not found");
    }

    // Don't allow removing the owner
    if (memberToRemove.role === "owner") {
      throw new Error("Cannot remove the organization owner");
    }

    await ctx.db.patch(args.memberId, {
      isActive: false,
    });

    // Create notification for the removed member
    await ctx.db.insert("notifications", {
      userId: memberToRemove.userId,
      organizationId: args.organizationId,
      type: "member_removed",
      title: "Removed from organization",
      message: "You have been removed from the organization",
      isRead: false,
      createdAt: Date.now(),
    });

    // Log the activity
    await ctx.db.insert("organizationActivity", {
      organizationId: args.organizationId,
      userId: identity.subject,
      action: "member_removed",
      details: `Member ${memberToRemove.userId} was removed from the organization`,
      timestamp: Date.now(),
    });
  },
});

// Get all members of an organization
export const getOrganizationMembers = query({
  args: {
    organizationId: v.id("organizations"),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Check if user is a member
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const membership = memberships.find(m => m.userId === identity.subject && m.isActive);

    if (!membership) {
      return [];
    }

    const activeMembers = memberships.filter(m => m.isActive);

    return activeMembers;
  },
});
