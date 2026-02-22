"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  DocumentChartBarIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
  DocumentChartBarIcon as DocumentChartBarIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  ArrowTrendingUpIcon as ArrowTrendingUpIconSolid,
  UsersIcon as UsersIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from "@heroicons/react/24/solid";

const MOBILE_NAV_ITEMS = [
  { name: "Reports", href: "/dashboard/reports", icon: DocumentChartBarIcon, iconSolid: DocumentChartBarIconSolid },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCartIcon, iconSolid: ShoppingCartIconSolid },
  { name: "Caja", href: "/dashboard/transactions", icon: ArrowTrendingUpIcon, iconSolid: ArrowTrendingUpIconSolid },
  { name: "Clients", href: "/dashboard/clients", icon: UsersIcon, iconSolid: UsersIconSolid },
  { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.iconSolid : item.icon;

          return (
            <Link
              key={item.name}
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
