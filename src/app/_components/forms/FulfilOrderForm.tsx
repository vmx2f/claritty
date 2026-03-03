"use client";

import { OrderStatusForm } from "@/app/_components/forms/OrderStatusForm";

type FulfilOrderFormProps = {
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export function FulfilOrderForm({ onSuccess, onCancel }: FulfilOrderFormProps) {
  return <OrderStatusForm targetStatus="shipped" title="Choose an order to fulfil (ship)." onSuccess={onSuccess} onCancel={onCancel} />;
}
