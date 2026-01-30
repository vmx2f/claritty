"use client";

import { usePathname } from "@/i18n/navigation";
import { navigation } from "./sidebar";

export default function TopBar() {
    const pathname = usePathname();

    // Find the current page name from the navigation array
    const currentPage = navigation.find(item => item.href === pathname);

    // Construct the breadcrumb text
    // Default to "Home" if on the main dashboard page or route not found in explicit nav
    const pageName = currentPage ? currentPage.name : (pathname === "/dashboard" ? "Home" : "Overview");

    return (
        <header className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <p className="text-sm text-secondary-text hover:text-primary-text transition-colors">Dashboard</p>
                    <span className="mx-2 text-sm text-secondary-text">/</span>
                    <p className="text-sm font-medium text-primary-text">{pageName}</p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* <NotificationsDropdown /> */}
                </div>
            </div>
        </header>
    );
}