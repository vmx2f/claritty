import type { NextRequest } from "next/server";
import type { ExportDateRange } from "@/lib/export/exportSchema";

export function getRangeFromRequest(request: NextRequest): ExportDateRange {
  const from = request.nextUrl.searchParams.get("from") ?? undefined;
  const to = request.nextUrl.searchParams.get("to") ?? undefined;
  return { from, to };
}

export function excelHeaders(filename: string) {
  return {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="${filename}"`,
  };
}

export function csvHeaders(filename: string) {
  return {
    "Content-Type": "text/csv",
    "Content-Disposition": `attachment; filename="${filename}"`,
  };
}
