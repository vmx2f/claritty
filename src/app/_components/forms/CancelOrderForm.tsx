"use client";

import { OrderStatusForm } from "@/app/_components/forms/OrderStatusForm";

type CancelOrderFormProps = {
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export function CancelOrderForm({ onSuccess, onCancel }: CancelOrderFormProps) {
  return <OrderStatusForm targetStatus="cancelled" title="Choose an order to cancel." onSuccess={onSuccess} onCancel={onCancel} />;
}
