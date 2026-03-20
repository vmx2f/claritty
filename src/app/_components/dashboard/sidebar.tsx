"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useOrganization } from "../../../contexts/OrganizationContext";
import ThemeSwitch from "../layout/theme-switch";
import LanguageToggle from "../providers/language-toggle";
import { getSidebarNavItems, NAV_TO_PERMISSION } from "@/constants/navigation";
import { isNavItemActive, normalizeOrganizationBlockState } from "@/blocks/runtime";
import OrganizationProfile from "./organization-profile";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const navigation = getSidebarNavItems();

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");

  // Organization management & notifications
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount);
  const createOrgMutation = useMutation(api.organizations.createOrganization);
  const { selectedOrgId, setSelectedOrgId, activeBlocks, setActiveBlocks } = useOrganization();
  const selectedOrg = organizations?.find((o) => o != null && o._id === selectedOrgId);
  const orgImageStorageId = selectedOrg?.imageStorageId ?? null;
  const orgImageUrl = useQuery(
    api.organizations.getFileUrl,
    orgImageStorageId ? { storageId: orgImageStorageId } : "skip"
  );

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

  const createOrganization = async () => {
    if (!newOrgName.trim()) return;

    try {
      await createOrgMutation({
        name: newOrgName.trim(),
        description: newOrgDescription.trim() || undefined
      });
      setNewOrgName("");
      setNewOrgDescription("");
      setShowCreateOrgModal(false);
    } catch (error) {
      console.error("Failed to create organization:", error);
    }
  };

  return (
    <>
      <div className={`border-r border-border transition-all duration-100 flex flex-col ${isCollapsed ? "w-14" : "w-52"}`}>

        {/* Header - Organization Selector + Collapse */}
        <OrganizationProfile/>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
          {navigation.filter(item => {
            if (!selectedOrgId || !organizations) return item.key === "notifications";

            const currentOrg = organizations.find((o) => o != null && o._id === selectedOrgId);
            if (!currentOrg) return item.key === "notifications";

            if (!isNavItemActive(item.key, activeBlocks)) {
              return false;
            }

            if (currentOrg.userRole === "owner") return true;

            const areaKey = NAV_TO_PERMISSION[item.key];
            return currentOrg.userPermissions?.includes(areaKey) ?? false;
          }).map((item) => {
            const isActive = pathname === item.href;
            const showBadge = item.key === "notifications" && unreadCount && unreadCount > 0;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all group relative ${isActive
                    ? "bg-primary-text/15 text-primary-text shadow-sm"
                    : "text-secondary-text hover:bg-hover/10 hover:text-primary-text"
                  } ${isCollapsed ? "justify-center" : ""}`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-text" : ""}`} />
                {!isCollapsed && (
                  <span className="text-xs font-medium truncate">{item.name}</span>
                )}
                {showBadge && (
                  <span className={`${isCollapsed ? "absolute -top-1 -right-1" : "ml-auto"} w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center`}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - User Profile */}
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
                    User Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-xs text-error hover:bg-error/10 transition-colors bg-primary-text/10"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2">
              <UserCircleIcon className="w-8 h-8 text-secondary-text shrink-0" />
              {!isCollapsed && <span className="text-xs text-secondary-text">Not logged in</span>}
            </div>
          )}
        </div>
      </div>

      {/* Create Organization Modal */}
      {showCreateOrgModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-primary-text">Create Organization</h2>
              <button
                onClick={() => setShowCreateOrgModal(false)}
                className="p-1 hover:bg-hover rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-secondary-text" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-primary-text mb-1">Name *</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Enter organization name"
                  className="w-full bg-main border border-border rounded-lg px-3 py-2 text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-primary-text mb-1">Description</label>
                <textarea
                  value={newOrgDescription}
                  onChange={(e) => setNewOrgDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full bg-main border border-border rounded-lg px-3 py-2 text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowCreateOrgModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-hover transition-colors text-sm text-primary-text"
                >
                  Cancel
                </button>
                <button
                  onClick={createOrganization}
                  disabled={!newOrgName.trim()}
                  className="flex-1 px-4 py-2 bg-primary-text text-white rounded-lg hover:bg-text-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
