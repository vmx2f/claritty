"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/app/_components/dashboard/sidebar";
import TopBar from "@/app/_components/dashboard/top-bar";
import BottomNav from "@/app/_components/dashboard/bottom-nav";
import CommandPalette from "@/app/_components/dashboard/command-palette";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCommandPalette } from "@/hooks/useCommandPalette";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  useCommandPalette();

  // Check if user has any organizations
  const organizations = useQuery(api.organizations.getUserOrganizations);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          setIsAuthenticated(true);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Redirect to onboarding if user has no organizations
  useEffect(() => {
    if (isAuthenticated && organizations !== undefined && !isLoading) {
      const isOnboardingPage = pathname?.includes('/onboarding');

      if (organizations.length === 0 && !isOnboardingPage) {
        router.push("/onboarding");
      } else if (organizations.length > 0 && isOnboardingPage) {
        router.push("/dashboard/chat");
      }
    }
  }, [organizations, isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirect
  }

  return (
    <OrganizationProvider>
      <section className="w-full h-screen flex">
        {/* Sidebar: desktop only */}
        {!isMobile && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar 
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          <main className={`flex-1 overflow-auto ${isMobile ? "pb-20" : ""}`}>
            {children}
          </main>
          {/* Bottom nav: mobile only */}
          {isMobile && <BottomNav />}
        </div>
        <CommandPalette />
      </section>
    </OrganizationProvider>
  );
}
