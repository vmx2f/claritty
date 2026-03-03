"use client";

import { useState, useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { isNavItemActive } from "@/blocks/runtime";
import { getSidebarNavItems } from "@/constants/navigation";
import { useOrganization } from "@/contexts/OrganizationContext";
import ThemeSwitch from "../layout/theme-switch";
import LanguageToggle from "../providers/language-toggle";

export default function TopBar() {
  const pathname = usePathname();
  const { activeBlocks } = useOrganization();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

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
          <p className="text-sm text-secondary-text">Dashboard</p>
          <span className="mx-2 text-sm text-secondary-text">/</span>
          <p className="text-sm font-medium text-primary-text truncate">{pageName}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile: profile dropdown with theme, language, sign out */}
          <div className="md:hidden relative">
            {user && (
              <>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-9 h-9 rounded-full bg-primary-text flex items-center justify-center text-white font-bold text-sm shrink-0"
                >
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </button>
                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 top-full mt-2 py-2 w-48 bg-card rounded-lg shadow-xl border border-border z-50">
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                        <ThemeSwitch />
                        <LanguageToggle />
                      </div>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          handleSignOut();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-error hover:bg-error/10"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
