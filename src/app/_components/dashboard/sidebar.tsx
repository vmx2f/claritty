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
  UserCircleIcon
} from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";
import ThemeSwitch from "../layout/theme-switch";
import LanguageToggle from "../providers/language-toggle";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const navigation = [
  { name: "Flow Chart", href: "/dashboard/flowchart", icon: HomeIcon },
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Organizations", href: "/dashboard/organizations", icon: BuildingOfficeIcon },
  { name: "Team Members", href: "/dashboard/members", icon: UsersIcon },
  { name: "Notifications", href: "/dashboard/notifications", icon: BellIcon },
  { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

      {/* Logo/Header */}
      <div className="p-6 border-b border-border flex-shrink-0">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
          <div className="w-10 h-10 bg-accent-color rounded-lg flex items-center justify-center flex-shrink-0">
            <BuildingOfficeIcon className="w-6 h-6 text-main" />
          </div>
          <div className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100 ml-3"
            }`}>
            <h1 className="text-lg font-semibold text-primary-text">Claritty</h1>
            <p className="text-xs text-secondary-text">Organization Hub</p>
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
    </div>
  );
}