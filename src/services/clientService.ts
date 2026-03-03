import type { Id } from "../../convex/_generated/dataModel";
import type { LogRecordInput } from "@/services/logService";

export type ClientPayload = {
  orgId: Id<"organizations">;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  status: "active" | "inactive" | "prospect";
};

type ClientServiceDeps = {
  createMutation: (input: ClientPayload) => Promise<Id<"clients">>;
  updateMutation: (input: {
    clientId: Id<"clients">;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    country?: string;
    notes?: string;
    status?: "active" | "inactive" | "prospect";
  }) => Promise<null>;
  deleteMutation: (input: { clientId: Id<"clients"> }) => Promise<null>;
  log: (entry: LogRecordInput) => Promise<Id<"actionLogs">>;
};

export function createClientService(deps: ClientServiceDeps) {
  return {
    async create(data: ClientPayload) {
      const result = await deps.createMutation(data);
      await deps.log({
        orgId: data.orgId,
        actionId: "add-client",
        actionLabel: "Add Client",
        category: "clients",
        entryType: "success",
        message: `Client \"${data.name}\" created`,
        payload: { clientId: result },
      });
      return result;
    },
    async update(clientId: Id<"clients">, data: Omit<ClientPayload, "orgId">) {
      await deps.updateMutation({ clientId, ...data });
      await deps.log({
        actionId: "edit-client",
        actionLabel: "Edit Client",
        category: "clients",
        entryType: "success",
        message: `Client \"${data.name ?? clientId}\" updated`,
        payload: { clientId },
      });
      return null;
    },
    async remove(clientId: Id<"clients">) {
      await deps.deleteMutation({ clientId });
      await deps.log({
        actionId: "delete-client",
        actionLabel: "Delete Client",
        category: "clients",
        entryType: "system-log",
        message: "Client deleted",
        payload: { clientId },
      });
      return null;
    },
  };
}
