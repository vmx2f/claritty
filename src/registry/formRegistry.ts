import type { ComponentType } from "react";
import type { ActionId } from "@/registry/types";
import { AddClientForm } from "@/app/_components/forms/AddClientForm";
import { AddInvoiceForm } from "@/app/_components/forms/AddInvoiceForm";
import { AddOrderForm } from "@/app/_components/forms/AddOrderForm";
import { AddProductForm } from "@/app/_components/forms/AddProductForm";
import { CancelOrderForm } from "@/app/_components/forms/CancelOrderForm";
import { DeleteProductForm } from "@/app/_components/forms/DeleteProductForm";
import { EditClientForm } from "@/app/_components/forms/EditClientForm";
import { EditProductForm } from "@/app/_components/forms/EditProductForm";
import { FulfilOrderForm } from "@/app/_components/forms/FulfilOrderForm";
import { MarkPaidForm } from "@/app/_components/forms/MarkPaidForm";
import { OrgSettingsForm } from "@/app/_components/forms/OrgSettingsForm";
import { UserSettingsForm } from "@/app/_components/forms/UserSettingsForm";

export type InlineFormProps = {
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export const formRegistry: Partial<Record<ActionId, ComponentType<InlineFormProps>>> = {
  "add-product": AddProductForm,
  "edit-product": EditProductForm,
  "adjust-stock": EditProductForm,
  "add-client": AddClientForm,
  "edit-client": EditClientForm,
  "add-invoice": AddInvoiceForm,
  "mark-paid": MarkPaidForm,
  "add-order": AddOrderForm,
  "cancel-order": CancelOrderForm,
  "fulfil-order": FulfilOrderForm,
  "delete-product": DeleteProductForm,
  "user-settings": UserSettingsForm,
  "org-settings": OrgSettingsForm,
};
