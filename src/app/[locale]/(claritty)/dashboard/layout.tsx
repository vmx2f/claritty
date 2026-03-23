"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { OrganizationProvider, useOrganization } from "@/app/_components/providers/organization-provider";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import OrganizationSelector from "@/app/_components/dashboard/organization-selector";

type Props = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  bottombar: React.ReactNode;
};

function DashboardContent({ children, sidebar, topbar, bottombar }: Props) {
  const [isMobile, setIsMobile] = useState(false);                       
  const router = useRouter();
  const pathname = usePathname();
  useCommandPalette();

  // Check if user has any organizations
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const { selectedOrgId } = useOrganization();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Redirect to onboarding if user has no organizations
  useEffect(() => {
    if (organizations !== undefined) {
      const isOnboardingPage = pathname?.includes('/onboarding');

      if (organizations.length === 0 && !isOnboardingPage) {
        router.push("/onboarding");
      } else if (organizations.length > 0 && isOnboardingPage) {
        router.push("/dashboard/chat");
      }
    }
  }, [organizations, pathname, router]);

  // Show organization selection UI if no org is selected
  if (organizations && organizations.length > 0 && !selectedOrgId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-primary-text mb-2">No Organization Selected</h3>
            <p className="text-secondary-text mb-6">Please select an organization to continue.</p>
          </div>
          <OrganizationSelector />
        </div>
      </div>
    );
  }

  return (
    <section className="w-full h-screen flex">
      {!isMobile && sidebar}
      <div className="flex-1 flex flex-col min-w-0">
        {topbar}
        <main className={`flex-1 overflow-auto ${isMobile ? "pb-20" : ""}`}>
          {children}
        </main>
        {isMobile && bottombar}
      </div>
    </section>
  );
}

export default function DashboardLayout({ children, sidebar, topbar, bottombar }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

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
      <DashboardContent children={children} sidebar={sidebar} topbar={topbar} bottombar={bottombar} />
    </OrganizationProvider>
  );
}