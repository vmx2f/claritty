"use client";

import type { RefObject } from "react";

type PaletteInputProps = {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
};

export function PaletteInput({ value, onChange, inputRef }: PaletteInputProps) {
  return (
    <div className="border-b border-border p-3">
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Try: add product, settings, add client"
        className="w-full rounded-xl border border-border bg-main px-4 py-3 text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/40"
      />
    </div>
  );
}
