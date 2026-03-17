"use client";

import { useState, useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { isNavItemActive } from "@/blocks/runtime";
import { getSidebarNavItems } from "@/constants/navigation";
import { useOrganization } from "@/contexts/OrganizationContext";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

interface TopBarProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function TopBar(props: TopBarProps) {
  const pathname = usePathname();
  const { activeBlocks } = useOrganization();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  const navigation = getSidebarNavItems().filter((item) => isNavItemActive(item.key, activeBlocks));
  const currentPage = navigation.find((item) => item.href === pathname);
  const pageName = currentPage ? currentPage.name : pathname === "/dashboard" ? "Home" : "Overview";

  useEffect(() => {
    const check = async () => {
      const session = await authClient.getSession();
      setUser(session.data?.user ?? null);
    };
    check();
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <header className="border-b border-border px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center min-w-0">
          {/* Sidebar collapse button - desktop only */}
          {props.onToggleSidebar && (
            <button
              onClick={props.onToggleSidebar}
              className="hidden md:flex p-1 hover:bg-hover rounded-lg transition-colors text-secondary-text hover:text-primary-text bg-main/10 border border-primary-text/10 mr-4"
              title={props.isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeftIcon className={`w-3.5 h-3.5 transition-transform ${props.isSidebarCollapsed ? "rotate-180" : ""}`} />
            </button>
          )}
          <p className="text-sm text-secondary-text">Dashboard</p>
          <span className="mx-2 text-sm text-secondary-text">/</span>
          <p className="text-sm font-medium text-primary-text truncate">{pageName}</p>
        </div>
      </div>
    </header>
  );
}
