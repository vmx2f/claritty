import { NextRequest, NextResponse } from "next/server";
import { getOrgFromRequest } from "@/lib/auth/getOrgFromRequest";
import { logExportEvent } from "@/lib/export/audit";
import { buildClientsSheet } from "@/lib/export/builders/buildClientsSheet";
import { excelHeaders, getRangeFromRequest } from "@/lib/export/http";
import { checkExportRateLimit } from "@/lib/export/rateLimit";
import { transformClients } from "@/lib/export/transformers/transformClients";
import { createWorkbook } from "@/lib/export/workbookFactory";

export async function GET(request: NextRequest) {
  const { org, error } = await getOrgFromRequest(request, {
    requiredBlock: "clients",
    requiredScope: "view",
  });
  if (error || !org) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  const rate = checkExportRateLimit(`${org.id}:clients:xlsx`);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many export requests" },
      { status: 429, headers: { "Retry-After": `${Math.ceil(rate.retryAfterMs / 1000)}` } }
    );
  }

  const range = getRangeFromRequest(request);
  const rows = await transformClients(org.id, range);
  const workbook = createWorkbook(org.name);
  buildClientsSheet(workbook, rows);

  const buffer = await workbook.xlsx.writeBuffer();
  await logExportEvent({ orgId: org.id, block: "clients", format: "xlsx", from: range.from, to: range.to });

  return new Response(Buffer.from(buffer as ArrayBuffer), {
    headers: excelHeaders(`clients-${org.slug}-${Date.now()}.xlsx`),
  });
}
