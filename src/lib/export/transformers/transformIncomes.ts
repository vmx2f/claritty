import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { ExportDateRange, ExportIncomeRow } from "@/lib/export/exportSchema";
import { formatDate, humanId, toTimestampRange } from "@/lib/export/transformers/utils";

export async function transformIncomes(
  orgId: Id<"organizations">,
  range?: ExportDateRange
): Promise<ExportIncomeRow[]> {
  const timestamps = toTimestampRange(range);

  const [incomeRows, orderPaymentRows, orders] = await Promise.all([
    fetchAuthQuery(api.transactions.getTransactions, {
      orgId,
      startDate: timestamps.from,
      endDate: timestamps.to,
      type: "income",
    }),
    fetchAuthQuery(api.transactions.getTransactions, {
      orgId,
      startDate: timestamps.from,
      endDate: timestamps.to,
      type: "order_payment",
    }),
    fetchAuthQuery(api.orders.getAllByOrg, { orgId }),
  ]);

  const ordersById = new Map(orders.map((order) => [order._id, order]));

  return [...incomeRows, ...orderPaymentRows].map((income) => {
    const linkedOrder = income.orderId ? ordersById.get(income.orderId) : null;
    return {
      incomeId: humanId(income._id, "INC"),
      date: formatDate(income.date) ?? "",
      description: income.description,
      amount: income.amount,
      category: income.type,
      linkedOrderId: linkedOrder ? humanId(linkedOrder._id, "ORD") : null,
      linkedClientName: linkedOrder?.customerName ?? null,
      paymentMethod: income.source ?? "manual",
      notes: null,
    } satisfies ExportIncomeRow;
  });
}
