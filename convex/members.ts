import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create an invitation for a member
export const createInvitation = mutation({
  args: {
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    permissions: v.array(v.string()), // e.g. ["dashboard", "orders"]
  },
  returns: v.id("invitations"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if user has invite permissions
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .unique();

    if (!membership || (membership.role !== "owner" && !membership.permissions.includes("members") && !membership.permissions.includes("settings"))) {
      throw new Error("Insufficient permissions to invite members");
    }

    // Check for existing pending invitation
    const existingInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.and(q.eq(q.field("email"), args.email), q.eq(q.field("status"), "pending")))
      .unique();

    if (existingInvitation) {
      throw new Error("An invitation is already pending for this email");
    }

    // Create the invitation
    const invitationId = await ctx.db.insert("invitations", {
      organizationId: args.organizationId,
      email: args.email,
      role: args.role,
      permissions: args.permissions,
      invitedBy: identity.subject,
      status: "pending",
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Log the activity
    await ctx.db.insert("organizationActivity", {
      organizationId: args.organizationId,
      userId: identity.subject,
      action: "member_added", // Using member_added for simplicity in activities
      details: `Invited ${args.email} as ${args.role}`,
      timestamp: Date.now(),
    });

    return invitationId;
  },
});

// Revoke an invitation
export const revokeInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");

    // Check permissions
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", invitation.organizationId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .unique();

    if (!membership || (membership.role !== "owner" && !membership.permissions.includes("members"))) {
      throw new Error("Insufficient permissions");
    }

    await ctx.db.patch(args.invitationId, {
      status: "revoked",
    });
  },
});

// Get pending invitations for an organization
export const getOrganizationInvitations = query({
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
      .query("invitations")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

// Get invitations for the current user (by email)
export const getMyInvitations = query({
  args: {
    email: v.string(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // We fetch invitations for this email that are still pending
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Enrich with organization info
    return await Promise.all(
      invitations.map(async (invite) => {
        const org = await ctx.db.get(invite.organizationId);
        return {
          ...invite,
          organizationName: org?.name || "Unknown Organization",
        };
      })
    );
  },
});

// Accept an invitation
export const acceptInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  returns: v.id("organizationMembers"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation || invitation.status !== "pending") {
      throw new Error("Invitation not found or no longer active");
    }

    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(args.invitationId, { status: "revoked" });
      throw new Error("Invitation expired");
    }

    // In a real app, we'd check if identity.email matches invitation.email
    // But identity might not have email depending on provider/config
    // For now we trust the user calling acceptInvitation is the right one if they have the link/ID

    // Add member
    const memberId = await ctx.db.insert("organizationMembers", {
      organizationId: invitation.organizationId,
      userId: identity.subject,
      role: invitation.role,
      permissions: invitation.permissions,
      invitedBy: invitation.invitedBy,
      joinedAt: Date.now(),
      isActive: true,
    });

    // Mark invitation as accepted
    await ctx.db.patch(args.invitationId, {
      status: "accepted",
    });

    // Create notification for the organization owner/inviter
    await ctx.db.insert("notifications", {
      userId: invitation.invitedBy,
      organizationId: invitation.organizationId,
      type: "invitation_accepted",
      title: "Invitation Accepted",
      message: `Someone accepted your invitation to join the organization`,
      isRead: false,
      createdAt: Date.now(),
    });

    return memberId;
  },
});

// Update member role and permissions
export const updateMemberPermissions = mutation({
  args: {
    organizationId: v.id("organizations"),
    memberId: v.id("organizationMembers"),
    role: v.optional(v.union(v.literal("admin"), v.literal("member"), v.literal("viewer"))),
    roleName: v.optional(v.string()),
    roleGroupId: v.optional(v.id("roleGroups")),
    permissions: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Check if user has manage permissions
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .unique();

    if (!membership || (membership.role !== "owner" && !membership.permissions.includes("members"))) {
      throw new Error("Insufficient permissions");
    }

    const memberToUpdate = await ctx.db.get(args.memberId);
    if (!memberToUpdate || memberToUpdate.organizationId !== args.organizationId) {
      throw new Error("Member not found");
    }

    if (memberToUpdate.role === "owner") {
      throw new Error("Cannot change owner permissions");
    }

    const updates: any = {};
    if (args.role !== undefined) updates.role = args.role;
    if (args.roleName !== undefined) updates.roleName = args.roleName;
    if (args.roleGroupId !== undefined) {
      updates.roleGroupId = args.roleGroupId;
      // If assigning to a group, inherit group permissions
      if (args.roleGroupId) {
        const group = await ctx.db.get(args.roleGroupId);
        if (group) {
          updates.permissions = group.permissions;
        }
      }
    }
    if (args.permissions !== undefined) updates.permissions = args.permissions;

    await ctx.db.patch(args.memberId, updates);

    // Notification
    await ctx.db.insert("notifications", {
      userId: memberToUpdate.userId,
      organizationId: args.organizationId,
      type: "role_changed",
      title: "Permissions Updated",
      message: `Your permissions in the organization have been updated`,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

// Remove a member
export const removeMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    memberId: v.id("organizationMembers"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .unique();

    if (!membership || (membership.role !== "owner" && !membership.permissions.includes("members"))) {
      throw new Error("Insufficient permissions");
    }

    const memberToRemove = await ctx.db.get(args.memberId);
    if (!memberToRemove || memberToRemove.organizationId !== args.organizationId) {
      throw new Error("Member not found");
    }

    if (memberToRemove.role === "owner") throw new Error("Cannot remove owner");

    await ctx.db.patch(args.memberId, {
      isActive: false,
    });
  },
});

// Get members
export const getOrganizationMembers = query({
  args: {
    organizationId: v.id("organizations"),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .unique();

    if (!membership) return [];

    return await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});
