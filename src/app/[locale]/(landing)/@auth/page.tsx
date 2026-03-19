"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useExtracted } from "next-intl";
import { useState } from "react";


export default function AuthPage() {
  const t = useExtracted('auth')

  const { data: session } = authClient.useSession();
  const [user, setUser] = useState<any>(null);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (session?.user) {
    return (
      <div className="lg:w-1/2 bg-main/60 flex items-center justify-center flex-col gap-8 py-12">
        <h2>{t(`You're already loged in`)}</h2>
        <Link href="/dashboard" className="btn btn-reverse w-64">
          {t('Go to dashboard')}
        </Link>
        <button onClick={handleSignOut} className="btn w-64">
          {t('Log out')}
        </button>
      </div>
    );
  }

  return (
    <div className="lg:w-1/2 bg-main/60 flex items-center justify-center flex-col gap-8 py-12">
      <h2>{t('Login or register')}</h2>
      <Link href="/login" className="btn btn-reverse w-64">
        {t('Login')}
      </Link>
      <Link href="/register" className="btn w-64">
        {t('Register')}
      </Link>
    </div>
  );
}