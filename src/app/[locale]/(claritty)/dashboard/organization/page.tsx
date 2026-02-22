"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

export default function OrganizationPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/settings");
  }, [router]);
  return null;
}
