import { fetchAuthMutation } from "@/lib/auth-server";
import type { BlockId } from "@/blocks/types";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type AuditInput = {
  orgId: Id<"organizations">;
  block: BlockId | "full";
  format: "xlsx" | "csv";
  from?: string;
  to?: string;
};

export async function logExportEvent(input: AuditInput) {
  await fetchAuthMutation(api.logs.record, {
    orgId: input.orgId,
    actionId: "data-export",
    actionLabel: "Data Export",
    category: "logs",
    entryType: "system-log",
    message: `Exported ${input.block} as ${input.format}`,
    payload: {
      block: input.block,
      format: input.format,
      from: input.from ?? null,
      to: input.to ?? null,
    },
  });
}
