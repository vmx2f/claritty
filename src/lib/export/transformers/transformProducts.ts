import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { ExportDateRange, ExportProductRow } from "@/lib/export/exportSchema";
import { formatDate, humanId, toTimestampRange } from "@/lib/export/transformers/utils";

export async function transformProducts(
  orgId: Id<"organizations">,
  range?: ExportDateRange
): Promise<ExportProductRow[]> {
  const timestamps = toTimestampRange(range);

  const products = await fetchAuthQuery(api.products.getAllByOrg, {
    orgId,
    from: timestamps.from,
    to: timestamps.to,
  });

  return products.map((product) => {
    const stock = product.stock ?? 0;
    const category = product.description?.split(":")[0]?.trim() || "General";
    return {
      productId: humanId(product._id, "PRD"),
      name: product.name,
      category,
      unitPrice: product.price,
      stock,
      stockValue: product.price * stock,
      providerName: null,
      createdAt: formatDate(product.createdAt) ?? "",
      updatedAt: formatDate(product.updatedAt) ?? "",
    } satisfies ExportProductRow;
  });
}
