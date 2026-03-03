"use client";

type AddInvoiceFormProps = {
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export function AddInvoiceForm({ onSuccess, onCancel }: AddInvoiceFormProps) {
  return (
    <div className="space-y-3">
      <p className="rounded-lg border border-border bg-main px-3 py-2 text-sm text-secondary-text">
        Invoice actions are planned but not yet available in this build.
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSuccess({ pending: true })}
          className="flex-1 rounded-lg bg-primary-text px-3 py-2 text-sm font-medium text-main"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}
