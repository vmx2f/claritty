"use client";

import { useState } from "react";
import { useOrganization } from "@/app/_components/providers/organization-provider";
import { useServiceLayer } from "@/hooks/useServiceLayer";

type AddProductFormProps = {
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export function AddProductForm({ onSuccess, onCancel }: AddProductFormProps) {
  const { selectedOrgId } = useOrganization();
  const { productService } = useServiceLayer();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [category, setCategory] = useState("inventory");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrgId || !name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await productService.create({
        orgId: selectedOrgId,
        name: name.trim(),
        description: `${category}: ${description.trim()}`,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
      });
      onSuccess(result);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Product name"
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="Price"
          className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
          required
        />
        <input
          type="number"
          value={stock}
          onChange={(event) => setStock(event.target.value)}
          placeholder="Stock"
          className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
        />
      </div>
      <input
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        placeholder="Category"
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
      />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-main px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !selectedOrgId}
          className="flex-1 rounded-lg bg-primary-text px-3 py-2 text-sm font-medium text-main disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Create"}
        </button>
      </div>
    </form>
  );
}
