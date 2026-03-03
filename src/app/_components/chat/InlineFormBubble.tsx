"use client";

import type { ActionId } from "@/registry/types";
import { InlineFormRenderer } from "@/app/_components/palette/InlineFormRenderer";

type InlineFormBubbleProps = {
  actionId: ActionId;
  onCancel: () => void;
  onSuccess: (payload?: unknown) => void;
};

export function InlineFormBubble({ actionId, onCancel, onSuccess }: InlineFormBubbleProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <p className="mb-2 text-xs uppercase tracking-wide text-secondary-text">Inline Action</p>
      <InlineFormRenderer actionId={actionId} onCancel={onCancel} onSuccess={onSuccess} />
    </div>
  );
}
