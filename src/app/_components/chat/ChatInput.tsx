"use client";

import type { ActionDefinition } from "@/registry/types";
import { PALETTE_ICON_MAP } from "@/app/_constants/palette";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  suggestions: ActionDefinition[];
  onSelectAction: (action: ActionDefinition) => void;
};

export function ChatInput({ value, onChange, suggestions, onSelectAction }: ChatInputProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected = suggestions[activeIndex];
      if (selected) {
        onSelectAction(selected);
      }
    }
  };

if (suggestions.length === 0) {
    return (
      <div className="border-t border-border bg-card p-3">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type a command..."
          className="w-full rounded-xl border border-border bg-main px-4 py-3 text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/40"
        />
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-card" ref={containerRef} onKeyDown={handleKeyDown}>
      {suggestions.length > 0 && (
        <div className="max-h-[48vh] overflow-y-auto p-2">
          {suggestions.slice(0, 4).map((action, index) => {
            const Icon = PALETTE_ICON_MAP[action.icon as keyof typeof PALETTE_ICON_MAP] ?? ClipboardDocumentListIcon;
            const isActive = index === activeIndex;

            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onSelectAction(action)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-primary-text text-main"
                    : "bg-card/70 text-primary-text hover:bg-main"
                }`}
              >
                <span className={`rounded-lg p-2 ${
                  isActive ? "bg-main/20" : "border border-border bg-main"
                }`}>
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
                <span className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                  isActive
                    ? "border border-main/30 text-main/90"
                    : "border border-border text-secondary-text"
                }`}>
                  {action.category}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type a command..."
        className="w-full rounded-xl border border-border bg-main px-4 py-3 text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/40"
      />
    </div>
  );
}
