import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { ExportClientRow, ExportDateRange } from "@/lib/export/exportSchema";
import { formatDate, humanId, toTimestampRange } from "@/lib/export/transformers/utils";

export async function transformClients(
  orgId: Id<"organizations">,
  range?: ExportDateRange
): Promise<ExportClientRow[]> {
  const timestamps = toTimestampRange(range);

  const [clients, orders] = await Promise.all([
    fetchAuthQuery(api.clients.getAllByOrg, {
      orgId,
      from: timestamps.from,
      to: timestamps.to,
    }),
    fetchAuthQuery(api.orders.getAllByOrg, { orgId }),
  ]);

  return clients.map((client) => {
    const linkedOrders = orders.filter((order) => order.clientId === client._id);
    const lastOrder = linkedOrders.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

    return {
      clientId: humanId(client._id, "CLT"),
      name: client.name,
      email: client.email,
      phone: client.phone ?? null,
      address: [client.address, client.city, client.country].filter(Boolean).join(", ") || null,
      totalOrders: linkedOrders.length,
      totalSpent: linkedOrders.reduce((sum, order) => sum + order.total, 0),
      lastOrderDate: formatDate(lastOrder?.createdAt),
      createdAt: formatDate(client.createdAt) ?? "",
    } satisfies ExportClientRow;
  });
}
