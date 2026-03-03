import type { Id } from "../../convex/_generated/dataModel";
import type { LogRecordInput } from "@/services/logService";

export type OrderItemPayload = {
  product: string;
  quantity: number;
  price: number;
};

export type OrderPayload = {
  orgId: Id<"organizations">;
  clientId?: Id<"clients">;
  customerName: string;
  items: OrderItemPayload[];
  total: number;
};

type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

type OrderServiceDeps = {
  createMutation: (input: OrderPayload) => Promise<Id<"orders">>;
  updateStatusMutation: (input: { orderId: Id<"orders">; status: OrderStatus }) => Promise<Id<"orders">>;
  log: (entry: LogRecordInput) => Promise<Id<"actionLogs">>;
};

export function createOrderService(deps: OrderServiceDeps) {
  return {
    async create(data: OrderPayload) {
      const result = await deps.createMutation(data);
      await deps.log({
        orgId: data.orgId,
        actionId: "add-order",
        actionLabel: "Add Order",
        category: "orders",
        entryType: "success",
        message: `Order created for ${data.customerName}`,
        payload: { orderId: result },
      });
      return result;
    },
    async updateStatus(orderId: Id<"orders">, status: OrderStatus) {
      const result = await deps.updateStatusMutation({ orderId, status });
      await deps.log({
        actionId: status === "cancelled" ? "cancel-order" : "fulfil-order",
        actionLabel: status === "cancelled" ? "Cancel Order" : "Fulfil Order",
        category: "orders",
        entryType: "system-log",
        message: `Order status updated to ${status}`,
        payload: { orderId: result, status },
      });
      return result;
    },
  };
}
