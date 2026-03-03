import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { ExportDateRange, ExportOutputRow } from "@/lib/export/exportSchema";
import { formatDate, humanId, toTimestampRange } from "@/lib/export/transformers/utils";

export async function transformOutputs(
  orgId: Id<"organizations">,
  range?: ExportDateRange
): Promise<ExportOutputRow[]> {
  const timestamps = toTimestampRange(range);

  const [expenseRows, inventoryRows] = await Promise.all([
    fetchAuthQuery(api.transactions.getTransactions, {
      orgId,
      startDate: timestamps.from,
      endDate: timestamps.to,
      type: "expense",
    }),
    fetchAuthQuery(api.transactions.getTransactions, {
      orgId,
      startDate: timestamps.from,
      endDate: timestamps.to,
      type: "inventory_purchase",
    }),
  ]);

  return [...expenseRows, ...inventoryRows].map((output) => {
    return {
      outputId: humanId(output._id, "OUT"),
      date: formatDate(output.date) ?? "",
      description: output.description,
      amount: output.amount,
      category: output.type,
      vendorName: output.source ?? null,
      paymentMethod: output.source ?? "manual",
      notes: null,
    } satisfies ExportOutputRow;
  });
}
