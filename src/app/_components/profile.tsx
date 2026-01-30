"use client";

import { useState, useEffect } from "react";
import { useExtracted } from "next-intl";
import { authClient } from "@/lib/auth-client";
import ThemeSwitch from "./layout/theme-switch";
import LanguageToggle from "./providers/language-toggle";

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const t = useExtracted('navbar');

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await authClient.getSession();
                setUser(session.data?.user || null);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleSignOut = async () => {
        try {
            await authClient.signOut();
            setUser(null);
            window.location.href = "/";
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="size-8 rounded-full  animate-pulse"></div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <a
                    href="/login"
                    className="text-sm hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                    Login
                </a>
                <a
                    href="/register"
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Register
                </a>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-sm flex items-center justify-center h-9 w-5 rounded-full text-primary-text bg-accent-color/90 font-semibold hover:bg-accent-color transition-colors"
            >
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                        </p>
                    </div>

                    <div className="p-2 space-y-1">
                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                            <ThemeSwitch />
                        </div>

                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Language</span>
                            <LanguageToggle />
                        </div>
                    </div>

                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleSignOut}
                            className="w-full text-left p-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}