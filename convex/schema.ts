import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Keep existing tasks table for now
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    userId: v.optional(v.string()),
  }).index("userId", ["userId"]),
  
  // Organizations table
  organizations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.string(), // User ID of the organization owner
    createdAt: v.number(),
    updatedAt: v.number(),
    isActive: v.boolean(),
  }).index("ownerId", ["ownerId"]),
  
  // Organization members table
  organizationMembers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member"), v.literal("viewer")),
    permissions: v.array(v.string()), // Specific permissions like "create", "edit", "delete"
    invitedBy: v.string(), // User ID who invited this member
    joinedAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"]),
  
  // Notifications table
  notifications: defineTable({
    userId: v.string(), // Recipient user ID
    organizationId: v.optional(v.id("organizations")),
    type: v.union(
      v.literal("invitation_accepted"),
      v.literal("invitation_declined"),
      v.literal("role_changed"),
      v.literal("organization_updated"),
      v.literal("member_removed"),
      v.literal("member_added")
    ),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
    metadata: v.optional(v.any()), // Additional data for the notification
  }).index("by_user", ["userId"]),
  
  // Activity log for organizations
  organizationActivity: defineTable({
    organizationId: v.id("organizations"),
    userId: v.string(), // User who performed the action
    action: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("deleted"),
      v.literal("member_added"),
      v.literal("member_removed"),
      v.literal("role_changed")
    ),
    details: v.string(),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  }).index("organizationId", ["organizationId"]),
});