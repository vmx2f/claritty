import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { ExportDateRange, ExportOrderRow } from "@/lib/export/exportSchema";
import { formatDate, humanId, toTimestampRange } from "@/lib/export/transformers/utils";

export async function transformOrders(
  orgId: Id<"organizations">,
  range?: ExportDateRange
): Promise<ExportOrderRow[]> {
  const timestamps = toTimestampRange(range);

  const [orders, clients] = await Promise.all([
    fetchAuthQuery(api.orders.getAllByOrg, {
      orgId,
      from: timestamps.from,
      to: timestamps.to,
    }),
    fetchAuthQuery(api.clients.getAllByOrg, { orgId }),
  ]);

  const clientsById = new Map(clients.map((client) => [client._id, client]));

  return orders.flatMap((order) => {
    const client = order.clientId ? clientsById.get(order.clientId) : null;

    return order.items.map((item) => {
      const subtotal = item.quantity * item.price;
      return {
        orderId: humanId(order._id, "ORD"),
        createdAt: formatDate(order.createdAt) ?? "",
        clientName: client?.name ?? order.customerName ?? "-",
        clientEmail: client?.email ?? "-",
        productName: item.product,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal,
        tax: 0,
        total: subtotal,
        status: order.status,
        fulfilledAt: formatDate(order.shippedAt ?? order.paidAt ?? null),
      } satisfies ExportOrderRow;
    });
  });
}
