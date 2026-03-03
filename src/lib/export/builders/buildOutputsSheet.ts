import type ExcelJS from "exceljs";
import type { ExportOutputRow } from "@/lib/export/exportSchema";
import { CURRENCY_FORMAT, styleAlternatingRow, styleHeaderRow } from "@/lib/export/builders/styles";

export function buildOutputsSheet(workbook: ExcelJS.Workbook, rows: ExportOutputRow[]): void {
  const sheet = workbook.addWorksheet("Outputs", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Output ID", key: "outputId", width: 24 },
    { header: "Date", key: "date", width: 20 },
    { header: "Description", key: "description", width: 28 },
    { header: "Amount", key: "amount", width: 12 },
    { header: "Category", key: "category", width: 16 },
    { header: "Vendor", key: "vendorName", width: 22 },
    { header: "Payment Method", key: "paymentMethod", width: 16 },
    { header: "Notes", key: "notes", width: 28 },
  ];

  styleHeaderRow(sheet);

  rows.forEach((row, index) => {
    const sheetRow = sheet.addRow(row);
    sheetRow.height = 18;
    styleAlternatingRow(sheetRow, index);
    sheetRow.getCell("amount").numFmt = CURRENCY_FORMAT;
  });
}
