import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Get user notifications
export const getUserNotifications = query({
  args: {
    limit: v.optional(v.number()),
    includeRead: v.optional(v.boolean()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    let notificationsQuery = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc");

    if (!args.includeRead) {
      const allNotifications = await notificationsQuery.take(args.limit || 50);
      return allNotifications.filter(n => !n.isRead);
    }

    return await notificationsQuery.take(args.limit || 50);
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== identity.subject) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });
  },
});

// Delete a notification
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== identity.subject) {
      throw new Error("Notification not found");
    }

    await ctx.db.delete(args.notificationId);
  },
});

// Mark all notifications as read
export const markAllNotificationsAsRead = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const unread = unreadNotifications.filter(n => !n.isRead);

    for (const notification of unread) {
      await ctx.db.patch(notification._id, {
        isRead: true,
      });
    }
  },
});

// Get unread notification count
export const getUnreadNotificationCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const allNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const unreadNotifications = allNotifications.filter(n => !n.isRead);

    return unreadNotifications.length;
  },
});

// Internal function to create notifications
export const createNotification = internalMutation({
  args: {
    userId: v.string(),
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
    metadata: v.optional(v.any()),
  },
  returns: v.id("notifications"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      organizationId: args.organizationId,
      type: args.type,
      title: args.title,
      message: args.message,
      isRead: false,
      createdAt: Date.now(),
      metadata: args.metadata,
    });
  },
});
