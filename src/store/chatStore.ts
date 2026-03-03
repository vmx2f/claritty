import { create } from "zustand";
import type { ActionId } from "@/registry/types";

type ChatStore = {
  isOpen: boolean;
  query: string;
  activeActionId: ActionId | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  setActiveActionId: (actionId: ActionId | null) => void;
  reset: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  query: "",
  activeActionId: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setQuery: (query) => set({ query }),
  setActiveActionId: (activeActionId) => set({ activeActionId }),
  reset: () => set({ query: "", activeActionId: null }),
}));
