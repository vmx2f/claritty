import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
 
export const env = createEnv({
  server: {
    CONVEX_DEPLOYMENT: z.string().min(1), // Just ensure it's not empty
    SITE_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    SITE_URL: process.env.SITE_URL,
  },
  emptyStringAsUndefined: true,
});