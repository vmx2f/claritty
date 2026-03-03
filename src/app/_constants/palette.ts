import {
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CubeIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ShoppingCartIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export const PALETTE_ICON_MAP = {
  "package-plus": CubeIcon,
  "pencil-square": PencilSquareIcon,
  trash: TrashIcon,
  scale: ClipboardDocumentListIcon,
  "user-plus": UsersIcon,
  "user-pen": UserIcon,
  receipt: DocumentTextIcon,
  "wallet-check": ClipboardDocumentListIcon,
  "shopping-cart-plus": ShoppingCartIcon,
  "x-circle": TrashIcon,
  truck: ShoppingCartIcon,
  "user-cog": Cog6ToothIcon,
  "building-cog": BuildingOffice2Icon,
  "clipboard-list": ClipboardDocumentListIcon,
} as const;
