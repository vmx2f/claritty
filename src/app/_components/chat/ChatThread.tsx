"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "@/app/_components/chat/MessageBubble";
import { InlineFormBubble } from "@/app/_components/chat/InlineFormBubble";
import type { ActionId } from "@/registry/types";
import type { LogEntry } from "@/store/logStore";

type ChatThreadProps = {
  entries: LogEntry[];
  activeActionId: ActionId | null;
  onCancelForm: () => void;
  onSuccessForm: (payload?: unknown) => void;
};

export function ChatThread({ entries, activeActionId, onCancelForm, onSuccessForm }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, activeActionId]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      {entries.length === 0 && !activeActionId ? (
        <div className="rounded-xl border-border bg-card p-6 text-sm text-secondary-text">
          Try typing <span className="font-semibold text-primary-text">add product</span> or
          <span className="font-semibold text-primary-text"> settings</span>.
        </div>
      ) : null}

      {entries.map((entry) => (
        <MessageBubble key={entry.id} entry={entry} />
      ))}

      {activeActionId ? (
        <InlineFormBubble actionId={activeActionId} onCancel={onCancelForm} onSuccess={onSuccessForm} />
      ) : null}

      <div ref={bottomRef} />
    </div>
  );
}
