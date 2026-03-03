import { NextRequest, NextResponse } from "next/server";
import { getOrgFromRequest } from "@/lib/auth/getOrgFromRequest";
import { logExportEvent } from "@/lib/export/audit";
import { buildOutputsSheet } from "@/lib/export/builders/buildOutputsSheet";
import { excelHeaders, getRangeFromRequest } from "@/lib/export/http";
import { checkExportRateLimit } from "@/lib/export/rateLimit";
import { transformOutputs } from "@/lib/export/transformers/transformOutputs";
import { createWorkbook } from "@/lib/export/workbookFactory";

export async function GET(request: NextRequest) {
  const { org, error } = await getOrgFromRequest(request, {
    requiredBlock: "outputs",
    requiredScope: "view",
  });
  if (error || !org) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  const rate = checkExportRateLimit(`${org.id}:outputs:xlsx`);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many export requests" },
      { status: 429, headers: { "Retry-After": `${Math.ceil(rate.retryAfterMs / 1000)}` } }
    );
  }

  const range = getRangeFromRequest(request);
  const rows = await transformOutputs(org.id, range);
  const workbook = createWorkbook(org.name);
  buildOutputsSheet(workbook, rows);

  const buffer = await workbook.xlsx.writeBuffer();
  await logExportEvent({ orgId: org.id, block: "outputs", format: "xlsx", from: range.from, to: range.to });

  return new Response(Buffer.from(buffer as ArrayBuffer), {
    headers: excelHeaders(`outputs-${org.slug}-${Date.now()}.xlsx`),
  });
}
