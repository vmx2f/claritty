"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import Profile from "../profile";
import { useExtracted } from "next-intl";

export function AuthButton() {
  const t = useExtracted('auth')
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <Profile/>
      </div>
    );
  }

  return (
    <div className="text-sm font-medium">
      <Link
        href="/login"
        className="border rounded-full p-1 px-3 mr-2"
      >
        {t('Log in')}
      </Link>
      <Link
        href="/register"
        className="text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-text/10 transition-colors"
      >
        {t('Register')}
      </Link>
    </div>
  );
}
