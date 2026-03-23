"use client";

import type { LogEntry } from "@/store/logStore";
import { MESSAGE_CONFIG_BY_TYPE } from "@/app/_constants/chat";
import { ArrowRightIcon } from "@heroicons/react/16/solid";
import Link from "next/link";

type MessageBubbleProps = {
  entry: LogEntry;
};

export function MessageBubble({ entry }: MessageBubbleProps) {
  const config = MESSAGE_CONFIG_BY_TYPE[entry.entryType];
  const Icon = config.icon;

  return (
    <Link href={'/'} className={`px-3 py-2 text-sm flex justify-between items-center btn btn-border border-0 ${config.background}`}>
      <div className="flex gap-2 items-center">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <p className="text-sm font-light">{entry.message}</p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-[0.69rem] opacity-70">{new Date(entry.createdAt).toLocaleString()}</p>
        <button >
          <ArrowRightIcon className="size-3 opacity-70" />
        </button>
      </div>
    </Link>
  );
}
