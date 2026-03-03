import type { LogEntryType } from "@/services/logService";
import type { BlockId } from "@/blocks/types";

export type ActionCategory = "inventory" | "clients" | "invoices" | "orders" | "settings" | "logs";

export type ActionId =
  | "add-product"
  | "edit-product"
  | "delete-product"
  | "adjust-stock"
  | "add-client"
  | "edit-client"
  | "add-invoice"
  | "mark-paid"
  | "add-order"
  | "cancel-order"
  | "fulfil-order"
  | "user-settings"
  | "org-settings"
  | "view-logs";

export type ActionDefinition = {
  id: ActionId;
  label: string;
  description: string;
  keywords: string[];
  category: ActionCategory;
  blockId: BlockId;
  icon: string;
  formId?: ActionId;
  requiresConfirm: boolean;
  fallbackEntryType?: LogEntryType;
  usageWeight?: number;
};
