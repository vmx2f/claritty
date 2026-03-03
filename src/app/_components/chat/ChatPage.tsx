"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ChatInput } from "@/app/_components/chat/ChatInput";
import { ChatThread } from "@/app/_components/chat/ChatThread";
import { useRouter } from "@/i18n/navigation";
import { useActionResolver } from "@/hooks/useActionResolver";
import { useServiceLayer } from "@/hooks/useServiceLayer";
import { useOrganization } from "@/contexts/OrganizationContext";
import type { ActionDefinition } from "@/registry/types";
import { useChatStore } from "@/store/chatStore";
import { useLogStore } from "@/store/logStore";

export function ChatPage() {
  const router = useRouter();
  const { selectedOrgId, activeBlocks } = useOrganization();
  const { logService } = useServiceLayer();
  const logs = useQuery(api.logs.list, selectedOrgId ? { orgId: selectedOrgId, limit: 250 } : { limit: 250 });

  const entries = useLogStore((state) => state.entries);
  const setEntries = useLogStore((state) => state.setEntries);

  const query = useChatStore((state) => state.query);
  const setQuery = useChatStore((state) => state.setQuery);
  const activeActionId = useChatStore((state) => state.activeActionId);
  const setActiveActionId = useChatStore((state) => state.setActiveActionId);

  const suggestions = useActionResolver(query, 6, activeBlocks);

  const listingRoutes: Partial<Record<ActionDefinition["id"], string>> = {
    "list-products": "/dashboard/products",
    "list-clients": "/dashboard/clients",
    "list-orders": "/dashboard/orders",
    "list-incomes": "/dashboard/transactions",
    "list-outputs": "/dashboard/transactions",
  };

  useEffect(() => {
    if (!logs) {
      return;
    }

    setEntries(
      logs.map((entry) => ({
        id: entry._id,
        actionId: entry.actionId,
        actionLabel: entry.actionLabel,
        category: entry.category,
        entryType: entry.entryType,
        message: entry.message,
        createdAt: entry.createdAt,
        payload: entry.payload,
        orgId: entry.orgId,
      }))
    );
  }, [logs, setEntries]);

  const handleSelectAction = async (action: ActionDefinition) => {
    setQuery(action.label.toLowerCase());
    const route = listingRoutes[action.id];
    if (route) {
      router.push(route);
      setQuery("");
      return;
    }

    if (action.formId) {
      setActiveActionId(action.formId);
      await logService.record({
        orgId: selectedOrgId ?? undefined,
        actionId: action.id,
        actionLabel: action.label,
        category: action.category,
        entryType: "inline-form",
        message: `Opened ${action.label} form`,
        payload: { source: "chat" },
      });
      return;
    }

    await logService.record({
      orgId: selectedOrgId ?? undefined,
      actionId: action.id,
      actionLabel: action.label,
      category: action.category,
      entryType: action.fallbackEntryType ?? "user-action",
      message: `${action.label} selected`,
      payload: { source: "chat" },
    });
    setQuery("");
  };

  return (
    <section className="flex h-full flex-col">
      <ChatThread
        entries={entries}
        activeActionId={activeActionId}
        onCancelForm={() => setActiveActionId(null)}
        onSuccessForm={async () => {
          if (activeActionId) {
            await logService.record({
              orgId: selectedOrgId ?? undefined,
              actionId: activeActionId,
              actionLabel: activeActionId,
              category: "logs",
              entryType: "success",
              message: `${activeActionId} completed`,
              payload: { source: "chat" },
            });
          }
          setActiveActionId(null);
          setQuery("");
        }}
      />
      <ChatInput
        value={query}
        onChange={setQuery}
        suggestions={suggestions}
        onSelectAction={handleSelectAction}
      />
    </section>
  );
}
