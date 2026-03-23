import type { LogEntryType } from "@/services/logService";
import { 
  CheckIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserCircleIcon,
  CogIcon
} from "@heroicons/react/24/outline";

import type { ActionDefinition } from "@/registry/types";

export const LISTING_ROUTES: Partial<Record<ActionDefinition["id"], string>> = {
  "list-products": "/dashboard/products",
  "list-clients": "/dashboard/clients",
  "list-orders": "/dashboard/orders",
  "list-incomes": "/dashboard/transactions",
  "list-outputs": "/dashboard/transactions",
};


export const MESSAGE_CONFIG_BY_TYPE: Record<LogEntryType, { icon: React.ComponentType<{ className?: string }>; color: string; background: string }> = {
  "user-action": { icon: UserCircleIcon, color: "text-blue-500", background: "hover:bg-blue-500/10" },
  "system-log": { icon: InformationCircleIcon, color: "text-gray-500", background: "hover:bg-gray-500/10" },
  "inline-form": { icon: CogIcon, color: "text-purple-500", background: "hover:bg-purple-500/10" },
  success: { icon: CheckIcon, color: "text-emerald-500 ", background: "hover:bg-emerald-500/10" },
  error: { icon: ExclamationTriangleIcon, color: "text-red-500", background: "hover:bg-red-500/10" },
};
