"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { isNavItemActive } from "@/blocks/runtime";
import { getBottomNavItems } from "@/app/_constants/navigation";
import { useOrganization } from "@/app/_components/providers/organization-provider";

export default function BottomNav() {
  const pathname = usePathname();
  const { activeBlocks } = useOrganization();
  const items = getBottomNavItems().filter((item) => isNavItemActive(item.key, activeBlocks));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.iconSolid : item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 py-2 min-w-0 ${
                isActive ? "text-primary-text" : "text-secondary-text"
              }`}
            >
              <Icon className="w-6 h-6 shrink-0" />
              <span className="text-[10px] font-medium truncate max-w-full">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
