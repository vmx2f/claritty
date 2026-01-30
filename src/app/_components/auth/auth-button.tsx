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
    <div className="flex text-sm items-center gap-4">
      <Link
        href="/login"
        className="border rounded-full p-1 px-3"
      >
        {t('Log in')}
      </Link>
      <Link
        href="/register"
        className="border bg-primary-text text-main rounded-full p-1 px-3"
      >
        {t('Register')}
      </Link>
    </div>
  );
}
