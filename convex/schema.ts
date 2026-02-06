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
  
  // Orders table
  orders: defineTable({
    orgId: v.id("organizations"),
    clientId: v.id("clients"),
    customerName: v.string(),
    items: v.array(
      v.object({
        product: v.string(),
        quantity: v.number(),
        price: v.number()
      })
    ),
    total: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
    shippedAt: v.optional(v.number())
  }).index("by_orgId", ["orgId"]),
  
  // Clients table
  clients: defineTable({
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
    totalOrders: v.number(),
    totalSpent: v.number(),
    lastOrderDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_orgId", ["orgId"]),
  
  // Capital transactions table
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
  }).index("by_orgId", ["orgId"]),
});