/**
 * Navigation configuration - toggle sidebar and bottom bar items on/off
 * Set to false to hide an item from the respective nav
 *
 * Note: "Client disconnected" in Convex logs (e.g. GET /api/auth/get-session) is normal
 * when users navigate away or close tabs before the request completes. Not an error.
 */

import type { ComponentType } from "react";
import {
  DocumentChartBarIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
  CubeIcon,
  UsersIcon,
  BellIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import {
  DocumentChartBarIcon as DocumentChartBarIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  ArrowTrendingUpIcon as ArrowTrendingUpIconSolid,
  CubeIcon as CubeIconSolid,
  UsersIcon as UsersIconSolid,
  BellIcon as BellIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
} from "@heroicons/react/24/solid";

export const NAV_CONFIG = {
  reports: { sidebar: true, bottomNav: true },
  flowChart: { sidebar: true, bottomNav: false },
  orders: { sidebar: true, bottomNav: true },
  transactions: { sidebar: true, bottomNav: true },
  products: { sidebar: true, bottomNav: false },
  clients: { sidebar: true, bottomNav: true },
  notifications: { sidebar: true, bottomNav: false },
  chat: { sidebar: true, bottomNav: false },
  settings: { sidebar: true, bottomNav: true },
} as const;

export type NavKey = keyof typeof NAV_CONFIG;

export const SIDEBAR_NAV_ITEMS: Array<{
  key: NavKey;
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { key: "chat", name: "Chat", href: "/dashboard/chat", icon: ChatBubbleLeftRightIcon },
  { key: "reports", name: "Reports", href: "/dashboard/reports", icon: DocumentChartBarIcon },
  { key: "flowChart", name: "Flow Chart", href: "/dashboard/flowchart", icon: ChartBarIcon },
  { key: "orders", name: "Orders", href: "/dashboard/orders", icon: ShoppingCartIcon },
  { key: "transactions", name: "Ingresos y Salidas", href: "/dashboard/transactions", icon: ArrowTrendingUpIcon },
  { key: "products", name: "Products", href: "/dashboard/products", icon: CubeIcon },
  { key: "clients", name: "Clients", href: "/dashboard/clients", icon: UsersIcon },
  { key: "notifications", name: "Notifications", href: "/dashboard/notifications", icon: BellIcon },
  { key: "settings", name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

export const BOTTOM_NAV_ITEMS: Array<{
  key: NavKey;
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  iconSolid: ComponentType<{ className?: string }>;
}> = [
  { key: "chat", name: "Chat", href: "/dashboard/chat", icon: ChatBubbleLeftRightIcon, iconSolid: ChatBubbleLeftRightIconSolid },
  { key: "reports", name: "Reports", href: "/dashboard/reports", icon: DocumentChartBarIcon, iconSolid: DocumentChartBarIconSolid },
  { key: "orders", name: "Orders", href: "/dashboard/orders", icon: ShoppingCartIcon, iconSolid: ShoppingCartIconSolid },
  { key: "transactions", name: "Caja", href: "/dashboard/transactions", icon: ArrowTrendingUpIcon, iconSolid: ArrowTrendingUpIconSolid },
  { key: "clients", name: "Clients", href: "/dashboard/clients", icon: UsersIcon, iconSolid: UsersIconSolid },
  { key: "settings", name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
];

/** Permission key for each nav item (used for role-based filtering) */
export const NAV_TO_PERMISSION: Record<NavKey, string> = {
  reports: "reports",
  flowChart: "flowchart",
  orders: "orders",
  transactions: "transactions",
  products: "products",
  clients: "clients",
  notifications: "notifications",
  chat: "reports",
  settings: "settings",
};

/** Filtered sidebar items based on NAV_CONFIG */
export const getSidebarNavItems = () =>
  SIDEBAR_NAV_ITEMS.filter((item) => NAV_CONFIG[item.key].sidebar);

/** Filtered bottom nav items based on NAV_CONFIG */
export const getBottomNavItems = () =>
  BOTTOM_NAV_ITEMS.filter((item) => NAV_CONFIG[item.key].bottomNav);
