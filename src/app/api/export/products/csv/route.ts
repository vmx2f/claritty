import { NextRequest, NextResponse } from "next/server";
import { getOrgFromRequest } from "@/lib/auth/getOrgFromRequest";
import { logExportEvent } from "@/lib/export/audit";
import { toCSV } from "@/lib/export/csvSerializer";
import { csvHeaders, getRangeFromRequest } from "@/lib/export/http";
import { checkExportRateLimit } from "@/lib/export/rateLimit";
import { transformProducts } from "@/lib/export/transformers/transformProducts";

export async function GET(request: NextRequest) {
  const { org, error } = await getOrgFromRequest(request, {
    requiredBlock: "products",
    requiredScope: "view",
  });
  if (error || !org) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  const rate = checkExportRateLimit(`${org.id}:products:csv`);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many export requests" },
      { status: 429, headers: { "Retry-After": `${Math.ceil(rate.retryAfterMs / 1000)}` } }
    );
  }

  const range = getRangeFromRequest(request);
  const rows = await transformProducts(org.id, range);
  const csv = toCSV(rows);

  await logExportEvent({ orgId: org.id, block: "products", format: "csv", from: range.from, to: range.to });

  return new Response(csv, {
    headers: csvHeaders(`products-${org.slug}-${Date.now()}.csv`),
  });
}
