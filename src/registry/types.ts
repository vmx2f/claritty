import type { LogEntryType } from "@/services/logService";
import type { BlockId } from "@/blocks/types";

export type ActionCategory = "inventory" | "clients" | "invoices" | "orders" | "settings" | "logs";

export type ActionId =
  | "add-product"
  | "list-products"
  | "edit-product"
  | "delete-product"
  | "adjust-stock"
  | "add-client"
  | "list-clients"
  | "edit-client"
  | "add-invoice"
  | "list-incomes"
  | "mark-paid"
  | "add-order"
  | "list-orders"
  | "cancel-order"
  | "fulfil-order"
  | "list-outputs"
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
