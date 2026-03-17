import type { LogEntryType } from "@/services/logService";
import { 
  CheckIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserCircleIcon,
  CogIcon
} from "@heroicons/react/24/outline";

export const MESSAGE_CONFIG_BY_TYPE: Record<LogEntryType, { icon: any; color: string }> = {
  "user-action": { icon: UserCircleIcon, color: "text-blue-500" },
  "system-log": { icon: InformationCircleIcon, color: "text-gray-500" },
  "inline-form": { icon: CogIcon, color: "text-purple-500" },
  success: { icon: CheckIcon, color: "text-emerald-500" },
  error: { icon: ExclamationTriangleIcon, color: "text-red-500" },
};
