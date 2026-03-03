"use client";

import { OrderStatusForm } from "@/app/_components/forms/OrderStatusForm";

type MarkPaidFormProps = {
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export function MarkPaidForm({ onSuccess, onCancel }: MarkPaidFormProps) {
  return <OrderStatusForm targetStatus="paid" title="Choose an order to mark as paid." onSuccess={onSuccess} onCancel={onCancel} />;
}
