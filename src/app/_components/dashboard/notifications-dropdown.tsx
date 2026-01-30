"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BellIcon, CheckIcon } from "@heroicons/react/24/outline";

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useQuery(api.notifications.getUserNotifications, { 
    limit: 10, 
    includeRead: false 
  });
  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount);
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead({ notificationId });
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-hover transition-colors duration-200"
      >
        <BellIcon className="w-5 h-5 text-primary-text" />
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-main text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-custom z-20">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary-text">Notifications</h3>
              {unreadCount && unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-accent-color hover:text-accent-color/80 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications && notifications.length > 0 ? (
                notifications.map((notification: any) => (
                  <div
                    key={notification._id}
                    className="p-4 border-b border-border hover:bg-hover transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-text">
                          {notification.title}
                        </p>
                        <p className="text-xs text-secondary-text mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-secondary-text mt-2">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="shrink-0 p-1 rounded hover:bg-hover transition-colors"
                      >
                        <CheckIcon className="w-4 h-4 text-secondary-text" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <BellIcon className="w-8 h-8 text-secondary-text mx-auto mb-2" />
                  <p className="text-sm text-secondary-text">No new notifications</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}