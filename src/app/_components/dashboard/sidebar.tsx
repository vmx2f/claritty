"use client";

import { getSidebarNavItems} from "@/app/_constants/navigation";
import OrganizationProfile from "./organization-profile";
import SidebarBlocks from "./sidebar-blocks";
import SidebarProfile from "./sidebar-profile";
import { ChevronLeftIcon } from "@heroicons/react/16/solid";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const navigation = getSidebarNavItems();

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <div className={`border-r border-border transition-all duration-100 flex flex-col relative ${isCollapsed ? "w-14" : "w-52"}`}>
      <OrganizationProfile isCollapsed={isCollapsed} onToggle={onToggle} />
      <SidebarBlocks isCollapsed={isCollapsed} onToggle={onToggle} />
      <SidebarProfile isCollapsed={isCollapsed} onToggle={onToggle} />
      
      {/* Sidebar collapse button - right border */}
      {onToggle && (
        <button onClick={onToggle}
          className="absolute right-0 top-4.5 translate-x-full p-1 mr-3 btn btn-border"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeftIcon className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}
