"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
// import { NotificationsDropdown } from "./notifications-dropdown";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-main">
      <div className="flex">

          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
      </div>
    </div>
  );
}