"use client";

import { LoginForm } from "@/app/_components/auth/login-form";
import { useExtracted } from "next-intl";

export default function AuthPage() {
  const t = useExtracted('auth')

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoginForm/>
    </div>
  );
}