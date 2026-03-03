"use client";

import type { LogEntry } from "@/store/logStore";
import { MESSAGE_BUBBLE_STYLE_BY_TYPE } from "@/app/_constants/chat";

type MessageBubbleProps = {
  entry: LogEntry;
};

export function MessageBubble({ entry }: MessageBubbleProps) {
  return (
    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${MESSAGE_BUBBLE_STYLE_BY_TYPE[entry.entryType]}`}>
      <p>{entry.message}</p>
      <p className="mt-1 text-[11px] opacity-70">{new Date(entry.createdAt).toLocaleString()}</p>
    </div>
  );
}
