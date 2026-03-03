import { NextRequest, NextResponse } from "next/server";
import { getOrgFromRequest } from "@/lib/auth/getOrgFromRequest";
import { logExportEvent } from "@/lib/export/audit";
import { buildClientsSheet } from "@/lib/export/builders/buildClientsSheet";
import { buildIncomesSheet } from "@/lib/export/builders/buildIncomesSheet";
import { buildOrdersSheet } from "@/lib/export/builders/buildOrdersSheet";
import { buildOutputsSheet } from "@/lib/export/builders/buildOutputsSheet";
import { buildProductsSheet } from "@/lib/export/builders/buildProductsSheet";
import { buildSummarySheet } from "@/lib/export/builders/buildSummarySheet";
import { excelHeaders, getRangeFromRequest } from "@/lib/export/http";
import { checkExportRateLimit } from "@/lib/export/rateLimit";
import { transformClients } from "@/lib/export/transformers/transformClients";
import { transformIncomes } from "@/lib/export/transformers/transformIncomes";
import { transformOrders } from "@/lib/export/transformers/transformOrders";
import { transformOutputs } from "@/lib/export/transformers/transformOutputs";
import { transformProducts } from "@/lib/export/transformers/transformProducts";
import { createWorkbook } from "@/lib/export/workbookFactory";

export async function GET(request: NextRequest) {
  const { org, error } = await getOrgFromRequest(request, { requiredScope: "view" });
  if (error || !org) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  const rate = checkExportRateLimit(`${org.id}:full:xlsx`);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many export requests" },
      { status: 429, headers: { "Retry-After": `${Math.ceil(rate.retryAfterMs / 1000)}` } }
    );
  }

  const range = getRangeFromRequest(request);
  const active = new Set(org.activeBlocks);

  const [orders, products, clients, incomes, outputs] = await Promise.all([
    active.has("orders") ? transformOrders(org.id, range) : Promise.resolve([]),
    active.has("products") ? transformProducts(org.id, range) : Promise.resolve([]),
    active.has("clients") ? transformClients(org.id, range) : Promise.resolve([]),
    active.has("incomes") ? transformIncomes(org.id, range) : Promise.resolve([]),
    active.has("outputs") ? transformOutputs(org.id, range) : Promise.resolve([]),
  ]);

  const workbook = createWorkbook(org.name);
  buildSummarySheet(workbook, {
    orgName: org.name,
    exportedAt: new Date().toISOString(),
    includedBlocks: org.activeBlocks,
    orders,
    products,
    clients,
    incomes,
    outputs,
  });

  if (orders.length > 0) buildOrdersSheet(workbook, orders);
  if (products.length > 0) buildProductsSheet(workbook, products);
  if (clients.length > 0) buildClientsSheet(workbook, clients);
  if (incomes.length > 0) buildIncomesSheet(workbook, incomes);
  if (outputs.length > 0) buildOutputsSheet(workbook, outputs);

  const buffer = await workbook.xlsx.writeBuffer();
  await logExportEvent({ orgId: org.id, block: "full", format: "xlsx", from: range.from, to: range.to });

  return new Response(Buffer.from(buffer as ArrayBuffer), {
    headers: excelHeaders(`export-${org.slug}-${Date.now()}.xlsx`),
  });
}
