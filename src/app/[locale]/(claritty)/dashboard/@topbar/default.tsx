"use client";

import TopBar from "@/app/_components/dashboard/top-bar";
import { useState } from "react";

export default function DefaultTopbar() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  return (
      <TopBar isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}/>
  );
}
