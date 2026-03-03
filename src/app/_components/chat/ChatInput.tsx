"use client";

import type { ActionDefinition } from "@/registry/types";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  suggestions: ActionDefinition[];
  onSelectAction: (action: ActionDefinition) => void;
};

export function ChatInput({ value, onChange, suggestions, onSelectAction }: ChatInputProps) {
  return (
    <div className="border-t border-border bg-card p-3">
      {value.trim().length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1">
          {suggestions.slice(0, 4).map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onSelectAction(action)}
              className="text-xs text-secondary-text underline-offset-2 transition-colors hover:text-primary-text hover:underline"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type a command..."
        className="w-full rounded-xl border border-border bg-main px-4 py-3 text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/40"
      />
    </div>
  );
}
