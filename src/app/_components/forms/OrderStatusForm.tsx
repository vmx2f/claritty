"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useServiceLayer } from "@/hooks/useServiceLayer";

type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

type OrderStatusFormProps = {
  targetStatus: OrderStatus;
  title: string;
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export function OrderStatusForm({ targetStatus, title, onSuccess, onCancel }: OrderStatusFormProps) {
  const { selectedOrgId } = useOrganization();
  const { orderService } = useServiceLayer();
  const orders = useQuery(api.orders.getOrders, selectedOrgId ? { orgId: selectedOrgId } : "skip");
  const [orderId, setOrderId] = useState<Id<"orders"> | "">("");

  const candidates = useMemo(
    () => orders?.filter((order) => order.status !== targetStatus) ?? [],
    [orders, targetStatus]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!orderId) {
      return;
    }

    const result = await orderService.updateStatus(orderId, targetStatus);
    onSuccess({ orderId: result, status: targetStatus });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-secondary-text">{title}</p>
      <select
        value={orderId}
        onChange={(event) => setOrderId(event.target.value as Id<"orders">)}
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
        required
      >
        <option value="">Select order</option>
        {candidates.map((order) => (
          <option key={order._id} value={order._id}>
            {order.customerName} - {order.status}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm">
          Cancel
        </button>
        <button type="submit" disabled={!orderId} className="flex-1 rounded-lg bg-primary-text px-3 py-2 text-sm font-medium text-main disabled:opacity-60">
          Confirm
        </button>
      </div>
    </form>
  );
}
