"use client";

import { formRegistry } from "@/registry/formRegistry";
import type { ActionId } from "@/registry/types";

type InlineFormRendererProps = {
  actionId: ActionId;
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export function InlineFormRenderer({ actionId, onSuccess, onCancel }: InlineFormRendererProps) {
  const FormComponent = formRegistry[actionId];

  if (!FormComponent) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-main p-4">
        <p className="text-sm text-secondary-text">This action does not have an inline form yet.</p>
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-3 py-2 text-sm">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-main p-4">
      <FormComponent onSuccess={onSuccess} onCancel={onCancel} />
    </div>
  );
}
