"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chatStore";

export function useCommandPalette() {
  const toggle = useChatStore((state) => state.toggle);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      const isContentEditable = target?.isContentEditable;
      if (tag === "INPUT" || tag === "TEXTAREA" || isContentEditable) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);
}
