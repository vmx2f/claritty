"use client";

import type { LogEntry } from "@/store/logStore";
import { MESSAGE_CONFIG_BY_TYPE } from "@/app/_constants/chat";

type MessageBubbleProps = {
  entry: LogEntry;
};

export function MessageBubble({ entry }: MessageBubbleProps) {
  const config = MESSAGE_CONFIG_BY_TYPE[entry.entryType];
  const Icon = config.icon;

  return (
    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm flex justify-between`}>
      <div className="flex gap-2">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <p>{entry.message}</p>
      </div>
      <p className="mt-1 text-[11px] opacity-70">{new Date(entry.createdAt).toLocaleString()}</p>
    </div>
  );
}
