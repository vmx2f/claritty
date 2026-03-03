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
    imageStorageId: v.optional(v.id("_storage")), // Organization logo/avatar
    ownerId: v.string(), // User ID of the organization owner
    blockConfig: v.optional(
      v.object({
        active: v.array(v.string()),
        disabledAt: v.record(v.string(), v.number()),
        preset: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    isActive: v.boolean(),
  }).index("ownerId", ["ownerId"]),

  // Organization members table
  organizationMembers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member"), v.literal("viewer")),
    roleName: v.optional(v.string()), // Custom role name like "Sales Manager", "Developer", etc.
    roleGroupId: v.optional(v.id("roleGroups")), // Link to role group
    permissions: v.array(v.string()), // Specific areas like "dashboard", "orders", "clients", etc.
    invitedBy: v.string(), // User ID who invited this member
    joinedAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_role_group", ["roleGroupId"]),

  // Role groups for organizing members with same permissions
  roleGroups: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(), // e.g., "Sales Team", "Developers", "Managers"
    description: v.optional(v.string()),
    permissions: v.array(v.string()), // Shared permissions for this group
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"]),

  // Invitations table
  invitations: defineTable({
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    permissions: v.array(v.string()),
    invitedBy: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("revoked")),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_email", ["email"]),

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
    clientId: v.optional(v.id("clients")),
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

  // Capital transactions table (Ingresos y Salidas)
  capitalTransactions: defineTable({
    orgId: v.id("organizations"),
    type: v.union(
      v.literal("income"),
      v.literal("order_payment"),
      v.literal("expense"),
      v.literal("inventory_purchase")
    ),
    amount: v.number(),
    description: v.string(),
    source: v.optional(v.string()),
    productId: v.optional(v.id("products")), // product expended on (for provider expenses)
    date: v.number(),
    orderId: v.optional(v.id("orders")),
  }).index("by_orgId", ["orgId"])
    .index("by_orgId_date", ["orgId", "date"]),

  // Products table
  products: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    sku: v.optional(v.string()),
    stock: v.optional(v.number()),
    unit: v.optional(v.string()), // e.g., "unit", "kg", "box"
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_orgId", ["orgId"]),

  // Cross-surface activity log for command palette and chat
  actionLogs: defineTable({
    orgId: v.optional(v.id("organizations")),
    actionId: v.string(),
    actionLabel: v.string(),
    category: v.string(),
    entryType: v.union(
      v.literal("user-action"),
      v.literal("system-log"),
      v.literal("inline-form"),
      v.literal("success"),
      v.literal("error")
    ),
    message: v.string(),
    payload: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_createdAt", ["createdAt"]),
});
