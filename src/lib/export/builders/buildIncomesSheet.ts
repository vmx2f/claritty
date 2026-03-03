import type ExcelJS from "exceljs";
import type { ExportIncomeRow } from "@/lib/export/exportSchema";
import { CURRENCY_FORMAT, styleAlternatingRow, styleHeaderRow } from "@/lib/export/builders/styles";

export function buildIncomesSheet(workbook: ExcelJS.Workbook, rows: ExportIncomeRow[]): void {
  const sheet = workbook.addWorksheet("Incomes", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Income ID", key: "incomeId", width: 24 },
    { header: "Date", key: "date", width: 20 },
    { header: "Description", key: "description", width: 28 },
    { header: "Amount", key: "amount", width: 12 },
    { header: "Category", key: "category", width: 16 },
    { header: "Order", key: "linkedOrderId", width: 20 },
    { header: "Client", key: "linkedClientName", width: 22 },
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
