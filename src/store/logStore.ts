import { create } from "zustand";
import type { Id } from "../../convex/_generated/dataModel";
import type { LogEntryType } from "@/services/logService";

export type LogEntry = {
  id: string;
  actionId: string;
  actionLabel: string;
  category: string;
  entryType: LogEntryType;
  message: string;
  createdAt: number;
  payload?: unknown;
  orgId?: Id<"organizations">;
};

type LogStore = {
  entries: LogEntry[];
  setEntries: (entries: LogEntry[]) => void;
  add: (entry: LogEntry) => void;
  clear: () => void;
};

export const useLogStore = create<LogStore>((set, get) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
  add: (entry) => set({ entries: [...get().entries, entry] }),
  clear: () => set({ entries: [] }),
}));
