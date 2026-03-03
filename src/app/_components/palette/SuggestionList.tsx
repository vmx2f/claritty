"use client";

import {
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { PALETTE_ICON_MAP } from "@/app/_constants/palette";
import type { ActionDefinition } from "@/registry/types";

type SuggestionListProps = {
  actions: ActionDefinition[];
  activeIndex: number;
  onHover: (index: number) => void;
  onSelect: (action: ActionDefinition) => void;
};

export function SuggestionList({ actions, activeIndex, onHover, onSelect }: SuggestionListProps) {
  if (actions.length === 0) {
    return <p className="px-3 py-8 text-center text-sm text-secondary-text">No commands found.</p>;
  }

  return (
    <div className="max-h-[48vh] overflow-y-auto p-2">
      {actions.map((action, index) => {
        const Icon = PALETTE_ICON_MAP[action.icon as keyof typeof PALETTE_ICON_MAP] ?? ClipboardDocumentListIcon;
        const isActive = index === activeIndex;

        return (
          <button
            key={action.id}
            type="button"
            onMouseEnter={() => onHover(index)}
            onClick={() => onSelect(action)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
              isActive
                ? "bg-primary-text text-main"
                : "bg-card/70 text-primary-text hover:bg-main"
            }`}
          >
            <span
              className={`rounded-lg p-2 ${
                isActive ? "bg-main/20" : "border border-border bg-main"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-main" : "text-primary-text"}`} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-sm font-medium ${isActive ? "text-main" : "text-primary-text"}`}>
                {action.label}
              </span>
              <span className={`block truncate text-xs ${isActive ? "text-main/80" : "text-secondary-text"}`}>
                {action.description}
              </span>
            </span>
            <span
              className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                isActive
                  ? "border border-main/30 text-main/90"
                  : "border border-border text-secondary-text"
              }`}
            >
              {action.category}
            </span>
          </button>
        );
      })}
    </div>
  );
}
