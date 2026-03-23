"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useOrganization } from "@/app/_components/providers/organization-provider";
import { useServiceLayer } from "@/hooks/useServiceLayer";

type DeleteProductFormProps = {
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export function DeleteProductForm({ onSuccess, onCancel }: DeleteProductFormProps) {
  const { selectedOrgId } = useOrganization();
  const products = useQuery(api.products.getProducts, selectedOrgId ? { orgId: selectedOrgId } : "skip");
  const { productService } = useServiceLayer();
  const [productId, setProductId] = useState<Id<"products"> | "">("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!productId || !confirmDelete) {
      return;
    }

    await productService.remove(productId);
    onSuccess({ productId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        value={productId}
        onChange={(event) => setProductId(event.target.value as Id<"products">)}
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
        required
      >
        <option value="">Select product</option>
        {products?.map((product) => (
          <option key={product._id} value={product._id}>
            {product.name}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm text-primary-text">
        <input
          type="checkbox"
          checked={confirmDelete}
          onChange={(event) => setConfirmDelete(event.target.checked)}
        />
        I confirm I want to remove this product.
      </label>

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!confirmDelete || !productId}
          className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </form>
  );
}
