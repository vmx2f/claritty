"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useServiceLayer } from "@/hooks/useServiceLayer";

type EditProductFormProps = {
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export function EditProductForm({ onSuccess, onCancel }: EditProductFormProps) {
  const { selectedOrgId } = useOrganization();
  const products = useQuery(api.products.getProducts, selectedOrgId ? { orgId: selectedOrgId } : "skip");
  const { productService } = useServiceLayer();
  const [selectedProductId, setSelectedProductId] = useState<Id<"products"> | "">("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");

  const selected = useMemo(
    () => products?.find((product) => product._id === selectedProductId),
    [products, selectedProductId]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProductId || !selectedOrgId || !selected) {
      return;
    }

    const nextStock = stock ? Number(stock) : selected.stock;
    const nextPrice = price ? Number(price) : selected.price;

    const result = await productService.update(selectedProductId, {
      name: selected.name,
      description: selected.description,
      sku: selected.sku,
      unit: selected.unit,
      stock: Number.isFinite(nextStock) ? nextStock : selected.stock,
      price: Number.isFinite(nextPrice) ? nextPrice : selected.price,
    });
    onSuccess(result);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        value={selectedProductId}
        onChange={(event) => setSelectedProductId(event.target.value as Id<"products">)}
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
      <div className="grid grid-cols-2 gap-2">
        <input
          value={stock}
          onChange={(event) => setStock(event.target.value)}
          type="number"
          placeholder="Stock"
          className="rounded-lg border border-border bg-main px-3 py-2 text-sm"
        />
        <input
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          type="number"
          step="0.01"
          placeholder="Price"
          className="rounded-lg border border-border bg-main px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm">
          Cancel
        </button>
        <button type="submit" className="flex-1 rounded-lg bg-primary-text px-3 py-2 text-sm font-medium text-main">
          Update
        </button>
      </div>
    </form>
  );
}
