"use client";

import { useEffect, useRef, useState } from "react";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { useRouter } from "@/i18n/navigation";
import { useActionResolver } from "@/hooks/useActionResolver";
import { useServiceLayer } from "@/hooks/useServiceLayer";
import { useOrganization } from "@/app/_components/providers/organization-provider";
import { actionRegistry } from "@/registry/actionRegistry";
import type { ActionDefinition } from "@/registry/types";
import { useChatStore } from "@/store/chatStore";
import { InlineFormRenderer } from "./InlineFormRenderer";
import { PaletteInput } from "./PaletteInput";
import { SuggestionList } from "./SuggestionList";

export function CommandPalette() {
  const router = useRouter();
  const { logService } = useServiceLayer();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { activeBlocks } = useOrganization();

  const isOpen = useChatStore((state) => state.isOpen);
  const query = useChatStore((state) => state.query);
  const activeActionId = useChatStore((state) => state.activeActionId);
  const setQuery = useChatStore((state) => state.setQuery);
  const setActiveActionId = useChatStore((state) => state.setActiveActionId);
  const close = useChatStore((state) => state.close);
  const reset = useChatStore((state) => state.reset);

  const matches = useActionResolver(query, 6, activeBlocks);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    inputRef.current?.focus();
  }, [isOpen]);

  const clearAndClose = () => {
    close();
    reset();
    setActiveIndex(0);
  };

  const listingRoutes: Partial<Record<ActionDefinition["id"], string>> = {
    "list-products": "/dashboard/products",
    "list-clients": "/dashboard/clients",
    "list-orders": "/dashboard/orders",
    "list-incomes": "/dashboard/transactions",
    "list-outputs": "/dashboard/transactions",
  };

  const executeFallbackAction = async (action: ActionDefinition) => {
    const route = listingRoutes[action.id];
    if (route) {
      router.push(route);
      return;
    }

    if (action.id === "view-logs") {
      router.push("/dashboard/chat");
      return;
    }

    await logService.record({
      actionId: action.id,
      actionLabel: action.label,
      category: action.category,
      entryType: action.fallbackEntryType ?? "system-log",
      message: `${action.label} selected`,
      payload: { source: "palette" },
    });
  };

  const onActionSelect = async (action: ActionDefinition) => {
    if (action.formId) {
      setActiveActionId(action.formId);
      await logService.record({
        actionId: action.id,
        actionLabel: action.label,
        category: action.category,
        entryType: "inline-form",
        message: `Opened ${action.label} form`,
        payload: { source: "palette" },
      });
      return;
    }

    await executeFallbackAction(action);
    clearAndClose();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => useChatStore.getState().open()}
        className="hidden items-center gap-2 rounded-full border border-border bg-card/85 px-3 py-2 text-xs text-secondary-text shadow-lg backdrop-blur-sm md:flex"
        type="button"
      >
        <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
        Command Menu
        <span className="rounded-md border border-border text-[10px] text-primary-text">Ctrl+K</span>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh] backdrop-blur-md"
      onClick={clearAndClose}
      role="presentation"
    >
      <div
        className="w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={async (event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            if (activeActionId) {
              setActiveActionId(null);
            } else {
              clearAndClose();
            }
          }

          if (activeActionId) {
            return;
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((prev) => (matches.length === 0 ? 0 : (prev + 1) % matches.length));
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((prev) => (matches.length === 0 ? 0 : (prev - 1 + matches.length) % matches.length));
          }

          if (event.key === "Enter") {
            event.preventDefault();
            const selected = matches[activeIndex];
            if (selected) {
              await onActionSelect(selected);
            }
          }
        }}
      >
        {!activeActionId ? (
          <>
            <PaletteInput
              inputRef={inputRef}
              value={query}
              onChange={(value) => {
                setQuery(value);
                setActiveIndex(0);
              }}
            />
            <SuggestionList
              actions={matches}
              activeIndex={activeIndex}
              onHover={setActiveIndex}
              onSelect={onActionSelect}
            />
            <div className="border-t border-border px-4 py-2 text-xs text-secondary-text">
              Enter to open, arrows to navigate, Esc to close.
            </div>
          </>
        ) : (
          <div className="p-3">
            <InlineFormRenderer
              actionId={activeActionId}
              onCancel={() => setActiveActionId(null)}
              onSuccess={async () => {
                const action = actionRegistry.find((entry) => entry.id === activeActionId);
                if (action) {
                  await logService.record({
                    actionId: action.id,
                    actionLabel: action.label,
                    category: action.category,
                    entryType: "success",
                    message: `${action.label} completed`,
                    payload: { source: "palette" },
                  });
                }
                clearAndClose();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
