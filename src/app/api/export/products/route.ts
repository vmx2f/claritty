import { NextRequest, NextResponse } from "next/server";
import { getOrgFromRequest } from "@/lib/auth/getOrgFromRequest";
import { logExportEvent } from "@/lib/export/audit";
import { buildProductsSheet } from "@/lib/export/builders/buildProductsSheet";
import { excelHeaders, getRangeFromRequest } from "@/lib/export/http";
import { checkExportRateLimit } from "@/lib/export/rateLimit";
import { transformProducts } from "@/lib/export/transformers/transformProducts";
import { createWorkbook } from "@/lib/export/workbookFactory";

export async function GET(request: NextRequest) {
  const { org, error } = await getOrgFromRequest(request, {
    requiredBlock: "products",
    requiredScope: "view",
  });
  if (error || !org) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  const rate = checkExportRateLimit(`${org.id}:products:xlsx`);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many export requests" },
      { status: 429, headers: { "Retry-After": `${Math.ceil(rate.retryAfterMs / 1000)}` } }
    );
  }

  const range = getRangeFromRequest(request);
  const rows = await transformProducts(org.id, range);
  const workbook = createWorkbook(org.name);
  buildProductsSheet(workbook, rows);

  const buffer = await workbook.xlsx.writeBuffer();
  await logExportEvent({ orgId: org.id, block: "products", format: "xlsx", from: range.from, to: range.to });

  return new Response(Buffer.from(buffer as ArrayBuffer), {
    headers: excelHeaders(`products-${org.slug}-${Date.now()}.xlsx`),
  });
}
