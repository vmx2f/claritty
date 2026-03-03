import type { LogEntryType } from "@/services/logService";

export const MESSAGE_BUBBLE_STYLE_BY_TYPE: Record<LogEntryType, string> = {
  "user-action": "ml-auto bg-primary-text text-main",
  "system-log": "mr-auto bg-main text-primary-text border border-border",
  "inline-form": "mr-auto bg-main text-primary-text border border-border border-dashed",
  success: "mr-auto bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30",
  error: "mr-auto bg-red-500/15 text-red-900 dark:text-red-200 border border-red-500/30",
};
