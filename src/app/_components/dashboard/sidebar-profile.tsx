"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import {
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useOrganization } from "../providers/organization-provider";
import ThemeSwitch from "../layout/theme-switch";
import LanguageToggle from "../providers/language-toggle";
import { getSidebarNavItems } from "@/app/_constants/navigation";
import {  normalizeOrganizationBlockState } from "@/blocks/runtime";
import { useExtracted } from "next-intl";


interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const navigation = getSidebarNavItems();

export default function SidebarProfile({ isCollapsed, onToggle }: SidebarProps) {
  const t = useExtracted('commons')
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Organization management & notifications
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const { selectedOrgId, setSelectedOrgId,  setActiveBlocks } = useOrganization();

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

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="p-2.5 border-t border-border">
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full animate-pulse bg-hover shrink-0"></div>
          {!isCollapsed && <div className="h-4 bg-primary-text/10 rounded flex-1 animate-pulse"></div>}
        </div>
      ) : user ? (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center gap-2 p-1.5 hover:bg-hover rounded-lg transition-colors bg-primary-text/10"
          >
            <div className="w-7 h-7 rounded-full bg-primary-text/12 flex items-center justify-center text-primary-text font-bold text-xs shrink-0">
              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[11px] font-medium text-primary-text truncate">
                  {user.name || "User"}
                </p>
                <p className="text-[9px] text-secondary-text truncate">{user.email}</p>
              </div>
            )}
          </button>

          {isDropdownOpen && !isCollapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-card rounded-lg shadow-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                <ThemeSwitch />
                <LanguageToggle />
              </div>
              <Link
                href="/dashboard/user-settings"
                onClick={() => setIsDropdownOpen(false)}
                className="block w-full text-left px-3 py-2 text-xs text-primary-text hover:bg-hover transition-colors bg-primary-text/10"
              >
                {t('User Settings')}
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-xs text-error hover:bg-error/10 transition-colors bg-primary-text/10"
              >
                {t('Sign Out')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2">
          <UserCircleIcon className="w-8 h-8 text-secondary-text shrink-0" />
          {!isCollapsed && <span className="text-xs text-secondary-text">{t('Not logged in')}</span>}
        </div>
      )}
    </div>
  );
}
