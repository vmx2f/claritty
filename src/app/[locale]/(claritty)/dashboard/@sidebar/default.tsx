"use client";

import Sidebar from "@/app/_components/dashboard/sidebar";
import { useState } from "react";

export default function DefaultSidebar() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  return (
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}/>
  );
}
