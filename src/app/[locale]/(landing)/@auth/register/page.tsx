"use client";

import { RegisterForm } from "@/app/_components/auth/register-form";
import { useExtracted } from "next-intl";

export default function AuthPage() {
  const t = useExtracted('auth')

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm/>
    </div>
  );
}