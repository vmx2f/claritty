import type { Id } from "../../convex/_generated/dataModel";
import type { LogRecordInput } from "@/services/logService";

export type ProductPayload = {
  orgId: Id<"organizations">;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  stock?: number;
  unit?: string;
};

type ProductServiceDeps = {
  createMutation: (input: ProductPayload) => Promise<Id<"products">>;
  updateMutation: (input: {
    productId: Id<"products">;
    name?: string;
    description?: string;
    price?: number;
    sku?: string;
    stock?: number;
    unit?: string;
  }) => Promise<Id<"products">>;
  deleteMutation: (input: { productId: Id<"products"> }) => Promise<null>;
  log: (entry: LogRecordInput) => Promise<Id<"actionLogs">>;
};

export function createProductService(deps: ProductServiceDeps) {
  return {
    async create(data: ProductPayload) {
      const result = await deps.createMutation(data);
      await deps.log({
        orgId: data.orgId,
        actionId: "add-product",
        actionLabel: "Add Product",
        category: "inventory",
        entryType: "success",
        message: `Product \"${data.name}\" created`,
        payload: { productId: result },
      });
      return result;
    },
    async update(productId: Id<"products">, data: Omit<ProductPayload, "orgId">) {
      const result = await deps.updateMutation({ productId, ...data });
      await deps.log({
        actionId: "edit-product",
        actionLabel: "Edit Product",
        category: "inventory",
        entryType: "success",
        message: `Product \"${data.name ?? productId}\" updated`,
        payload: { productId: result },
      });
      return result;
    },
    async remove(productId: Id<"products">) {
      await deps.deleteMutation({ productId });
      await deps.log({
        actionId: "delete-product",
        actionLabel: "Delete Product",
        category: "inventory",
        entryType: "system-log",
        message: "Product deleted",
        payload: { productId },
      });
      return null;
    },
  };
}
