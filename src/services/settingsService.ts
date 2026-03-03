import type { Id } from "../../convex/_generated/dataModel";
import type { LogRecordInput } from "@/services/logService";

export type OrgSettingsPayload = {
  organizationId: Id<"organizations">;
  name?: string;
  description?: string;
  imageStorageId?: Id<"_storage">;
};

export type UserSettingsPayload = {
  displayName: string;
  email: string;
  notifications: boolean;
  compactMode: boolean;
};

type SettingsServiceDeps = {
  updateOrgMutation: (input: OrgSettingsPayload) => Promise<null>;
  log: (entry: LogRecordInput) => Promise<Id<"actionLogs">>;
};

export function createSettingsService(deps: SettingsServiceDeps) {
  return {
    async saveOrgSettings(data: OrgSettingsPayload) {
      await deps.updateOrgMutation(data);
      await deps.log({
        orgId: data.organizationId,
        actionId: "org-settings",
        actionLabel: "Organization Settings",
        category: "settings",
        entryType: "success",
        message: "Organization settings updated",
        payload: data,
      });
      return null;
    },
    async saveUserSettings(data: UserSettingsPayload) {
      await deps.log({
        actionId: "user-settings",
        actionLabel: "User Settings",
        category: "settings",
        entryType: "success",
        message: "User settings updated",
        payload: data,
      });
      return data;
    },
  };
}
