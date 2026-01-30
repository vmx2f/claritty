"use client";

import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { env } from "@/env/client";

let convex: ConvexReactClient;

try {
  convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);
} catch (error) {
  console.error("Failed to initialize Convex client:", error);
  throw error;
}

export function ConvexClientProvider({ children, initialToken }: { children: ReactNode; initialToken?: string | null; }) {
  return (
    <ConvexBetterAuthProvider 
      client={convex}
      authClient={authClient}
      initialToken={initialToken}
    >
      {children}
    </ConvexBetterAuthProvider>
  );
}