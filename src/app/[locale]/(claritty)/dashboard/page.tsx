"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

export default function Dashboard() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/chat");
  }, [router]);
  return null;
}
