"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useOrganization } from "@/app/_components/providers/organization-provider";
import { useServiceLayer } from "@/hooks/useServiceLayer";

type AddOrderFormProps = {
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export function AddOrderForm({ onSuccess, onCancel }: AddOrderFormProps) {
  const { selectedOrgId } = useOrganization();
  const { orderService } = useServiceLayer();
  const clients = useQuery(api.clients.getClients, selectedOrgId ? { orgId: selectedOrgId } : "skip");
  const products = useQuery(api.products.getProducts, selectedOrgId ? { orgId: selectedOrgId } : "skip");

  const [clientId, setClientId] = useState<Id<"clients"> | "">("");
  const [productId, setProductId] = useState<Id<"products"> | "">("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");

  const selectedClient = useMemo(
    () => clients?.find((client) => client._id === clientId),
    [clientId, clients]
  );

  const selectedProduct = useMemo(
    () => products?.find((product) => product._id === productId),
    [productId, products]
  );

  const total = (Number(quantity) || 1) * (selectedProduct?.price ?? 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrgId || !selectedProduct || !selectedClient) {
      return;
    }

    const qty = Math.max(1, Number(quantity) || 1);
    const result = await orderService.create({
      orgId: selectedOrgId,
      clientId: selectedClient._id,
      customerName: selectedClient.name,
      items: [
        {
          product: selectedProduct.name,
          quantity: qty,
          price: selectedProduct.price,
        },
      ],
      total,
    });

    await orderService.updateStatus(result, "pending");

    onSuccess(result);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        value={clientId}
        onChange={(event) => setClientId(event.target.value as Id<"clients">)}
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
        required
      >
        <option value="">Select client</option>
        {clients?.map((client) => (
          <option key={client._id} value={client._id}>
            {client.name}
          </option>
        ))}
      </select>
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
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
        placeholder="Quantity"
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
      />
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={2}
        placeholder="Notes"
        className="w-full resize-none rounded-lg border border-border bg-main px-3 py-2 text-sm"
      />
      <div className="rounded-lg border border-border bg-main px-3 py-2 text-sm">Total: S/{total.toFixed(2)}</div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selectedOrgId || !selectedClient || !selectedProduct}
          className="flex-1 rounded-lg bg-primary-text px-3 py-2 text-sm font-medium text-main disabled:opacity-60"
        >
          Create
        </button>
      </div>
    </form>
  );
}
