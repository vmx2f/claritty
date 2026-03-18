"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import Profile from "../profile";
import { useExtracted } from "next-intl";

export function AuthButton() {
  const t = useExtracted('auth')
  const { data: session } = authClient.useSession();

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <Profile/>
      </div>
    );
  }

  return (
      <Link
        href="/register"
        className="text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-text/10 transition-colors"
      >
        {t('Register')}
      </Link>
  );
}
