"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useOrganization } from "../providers/organization-provider";
import { getSidebarNavItems, NAV_TO_PERMISSION } from "@/app/_constants/navigation";
import { isNavItemActive, normalizeOrganizationBlockState } from "@/blocks/runtime";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const navigation = getSidebarNavItems();

export default function SidebarBlocks({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("sidebar");
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Organization management & notifications
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount);
  const { selectedOrgId, setSelectedOrgId, activeBlocks, setActiveBlocks } = useOrganization();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        setUser(session.data?.user || null);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const first = organizations?.[0];
    if (first && !selectedOrgId) {
      setSelectedOrgId(first._id);
    }
  }, [organizations, selectedOrgId, setSelectedOrgId]);

  useEffect(() => {
    if (!organizations || !selectedOrgId) {
      return;
    }

    const currentOrg = organizations.find((org) => org != null && org._id === selectedOrgId);
    const normalized = normalizeOrganizationBlockState(currentOrg?.blockConfig);
    setActiveBlocks(normalized.active);
  }, [organizations, selectedOrgId, setActiveBlocks]);

  return (
    <nav className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
      {navigation.filter(item => {
        if (!selectedOrgId || !organizations) return item.key === "notifications";

        const currentOrg = organizations.find((o) => o != null && o._id === selectedOrgId);
        if (!currentOrg) return item.key === "notifications";

        if (!isNavItemActive(item.key, activeBlocks)) {
          return false;
        }

        if (currentOrg.userRole === "owner") return true;

        return "currentOrg.userPermissions?.includes(areaKey) ?? false;"
      }).map((item) => {
        const isActive = pathname === item.href;
        const count = unreadCount ?? 0;
        const showBadge = item.key === "notifications" && count > 0;

        return (
          <Link key={item.key} href={item.href}
            className={`btn gap-2 justify-start bg-main ${isActive
              ? "bg-primary-text/15 text-primary-text shadow-sm"
              : "text-secondary-text hover:text-primary-text"
              } ${isCollapsed ? "justify-center px-3" : ""}`}>

            <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-text" : ""}`} />
            <span className="text-xs font-medium truncate">{t(item.key)}</span>
            {showBadge && (
              <span className={`flex items-center justify-center text-[0.69rem] font-light ${isCollapsed
                  ? "hidden"
                  : "ml-auto"
                }`}>
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
