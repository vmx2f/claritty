import type { Id } from "../../convex/_generated/dataModel";

export type LogEntryType = "user-action" | "system-log" | "inline-form" | "success" | "error";

export type LogRecordInput = {
  orgId?: Id<"organizations">;
  actionId: string;
  actionLabel: string;
  category: string;
  entryType: LogEntryType;
  message: string;
  payload?: unknown;
};

type LogServiceDeps = {
  recordMutation: (input: LogRecordInput) => Promise<Id<"actionLogs">>;
  clearMutation: (input: { orgId?: Id<"organizations"> }) => Promise<null>;
};

export function createLogService(deps: LogServiceDeps) {
  return {
    async record(input: LogRecordInput) {
      return deps.recordMutation(input);
    },
    async clear(orgId?: Id<"organizations">) {
      return deps.clearMutation({ orgId });
    },
  };
}
