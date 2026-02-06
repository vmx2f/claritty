"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  BellIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  PlusIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useOrganization } from "../../../contexts/OrganizationContext";
import ThemeSwitch from "../layout/theme-switch";
import LanguageToggle from "../providers/language-toggle";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const navigation = [
  { name: "Flow Chart", href: "/dashboard/flowchart", icon: HomeIcon },
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Orders", href: "/dashboard/orders", icon: BuildingOfficeIcon },
  { name: "Clients", href: "/dashboard/clients", icon: BuildingOfficeIcon },
  { name: "Team Members", href: "/dashboard/members", icon: UsersIcon },
  { name: "Notifications", href: "/dashboard/notifications", icon: BellIcon },
  { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");

  // Organization management
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const createOrgMutation = useMutation(api.organizations.createOrganization);
  const { selectedOrgId, setSelectedOrgId } = useOrganization();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        setUser(session.data?.user || null);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Auto-select first organization if available and none selected
    if (organizations && organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0]._id);
    }
  }, [organizations, selectedOrgId]);

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
    <div className={`relative bg-card border-r border-border transition-all duration-300 h-screen flex flex-col ${isCollapsed ? "w-20" : "w-64"
      }`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 bg-main border border-border rounded-full p-1 shadow-custom hover:bg-hover transition-colors duration-200 z-10"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="w-4 h-4 text-primary-text" />
        ) : (
          <ChevronLeftIcon className="w-4 h-4 text-primary-text" />
        )}
      </button>

      {/* Logo/Header with Organization Selector */}
      <div className="p-6 border-b border-border flex-shrink-0">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
          <div className="w-10 h-10 bg-accent-color rounded-lg flex items-center justify-center flex-shrink-0">
            <BuildingOfficeIcon className="w-6 h-6 text-main" />
          </div>
          <div className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100 ml-3"
            }`}>
            <h1 className="text-lg font-semibold text-primary-text">Claritty</h1>
            {!isCollapsed && (
              <div className="relative">
                <button
                  onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                  className="flex items-center justify-between w-full text-xs text-secondary-text hover:text-primary-text transition-colors"
                >
                  <span className="truncate">
                    {selectedOrgId && organizations 
                      ? organizations.find(org => org._id === selectedOrgId)?.name || "Select Organization"
                      : "No Organization"
                    }
                  </span>
                  <ChevronLeftIcon className={`w-3 h-3 transition-transform ${isOrgDropdownOpen ? 'rotate-90' : ''}`} />
                </button>
                
                {isOrgDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden">
                    <div className="max-h-48 overflow-y-auto">
                      {organizations && organizations.length > 0 ? (
                        organizations.map((org) => (
                          <button
                            key={org._id}
                            onClick={() => {
                              setSelectedOrgId(org._id);
                              setIsOrgDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-hover transition-colors flex items-center justify-between ${
                              selectedOrgId === org._id ? "bg-accent-color/10 text-accent-color" : "text-primary-text"
                            }`}
                          >
                            <span className="truncate">{org.name}</span>
                            {selectedOrgId === org._id && <CheckIcon className="w-4 h-4 flex-shrink-0" />}
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-secondary-text">No organizations found</div>
                      )}
                    </div>
                    <div className="border-t border-border p-2">
                      <button
                        onClick={() => {
                          setShowCreateOrgModal(true);
                          setIsOrgDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-accent-color hover:bg-accent-color/10 rounded transition-colors flex items-center"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Create Organization
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group h-10 ${isActive
                ? "bg-accent-color text-main"
                : "text-primary-text hover:bg-hover hover:text-text-hover"
                } ${isCollapsed ? "justify-center" : ""}`}
            >
              <item.icon className={`w-5 h-5 shrink-0 transition-colors duration-200 ${isActive ? "text-main" : "text-secondary-text group-hover:text-primary-text"
                }`} />
              <span className={`text-sm font-medium overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100 ml-3"
                }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border flex-shrink-0">
        {isLoading ? (
          <div className={`flex items-center h-10 ${isCollapsed ? "justify-center" : "space-x-3"}`}>
            <div className="w-8 h-8 rounded-full animate-pulse bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
            <div className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100 ml-3"
              }`}>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        ) : !user ? (
          <div className={`flex items-center h-10 ${isCollapsed ? "justify-center" : "space-x-3"}`}>
            <UserCircleIcon className="w-8 h-8 text-secondary-text flex-shrink-0" />
            <div className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 whitespace-nowrap ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100 ml-3"
              }`}>
              <p className="text-sm font-medium text-primary-text truncate">Guest</p>
              <p className="text-xs text-secondary-text truncate">Not logged in</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center h-12 bg-main hover:bg-hover rounded-lg transition-colors p-2 ${isCollapsed ? "justify-center" : "space-x-3"
                }`}
            >
              <div className="w-8 h-8 rounded-full bg-accent-color/90 flex items-center justify-center text-main font-semibold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </div>
              <div className={`flex-1 min-w-0 text-left overflow-hidden transition-all duration-300 whitespace-nowrap ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100 ml-3"
                }`}>
                <p className="text-sm font-medium text-primary-text truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-secondary-text truncate">
                  {user.email}
                </p>
              </div>
            </button>

            {isDropdownOpen && !isCollapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 w-full bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium text-primary-text truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-secondary-text truncate">
                    {user.email}
                  </p>
                </div>

                <div className="p-2 space-y-1">
                  <div className="flex items-center justify-between p-2 hover:bg-hover rounded">
                    <span className="text-sm text-primary-text">Theme</span>
                    <ThemeSwitch />
                  </div>

                  <div className="flex items-center justify-between p-2 hover:bg-hover rounded">
                    <span className="text-sm text-primary-text">Language</span>
                    <LanguageToggle />
                  </div>
                </div>

                <div className="p-2 border-t border-border">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left p-2 text-sm text-error hover:bg-error/10 rounded transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Organization Modal */}
      {showCreateOrgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary-text">Create Organization</h2>
              <button
                onClick={() => setShowCreateOrgModal(false)}
                className="p-2 hover:bg-hover rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-secondary-text" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                  placeholder="Enter organization name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newOrgDescription}
                  onChange={(e) => setNewOrgDescription(e.target.value)}
                  className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50 resize-none"
                  placeholder="Enter organization description"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateOrgModal(false)}
                  className="flex-1 px-6 py-2.5 border border-border rounded-lg hover:bg-hover transition-colors text-primary-text font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={createOrganization}
                  disabled={!newOrgName.trim()}
                  className="flex-1 px-6 py-2.5 bg-primary-text text-main rounded-lg hover:bg-text-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}