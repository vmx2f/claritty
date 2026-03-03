export type BlockTier = "mandatory" | "core" | "future";

export type BlockId =
  | "chat"
  | "notifications"
  | "settings"
  | "reports"
  | "products"
  | "clients"
  | "orders"
  | "incomes"
  | "outputs"
  | "suppliers"
  | "employees";

export type PermissionScope = "view" | "create" | "edit" | "delete";

export type BlockPresetId = "lean" | "standard" | "commerce" | "services";

export type BlockConfig = {
  id: BlockId;
  label: string;
  description: string;
  tier: BlockTier;
  icon: string;
  hardDependencies: BlockId[];
  softDependencies: BlockId[];
  enhancedBy: BlockId[];
  permissionScopes: PermissionScope[];
  dataTypes: string[];
  paletteActions: string[];
  navigationEntry?: {
    label: string;
    icon: string;
    route: string;
    order: number;
  };
  onDisable: "hide" | "archive";
};

export type OrganizationBlockState = {
  active: BlockId[];
  disabledAt: Partial<Record<BlockId, number>>;
  preset?: BlockPresetId;
};
