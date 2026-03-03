import type ExcelJS from "exceljs";
import type { ExportProductRow } from "@/lib/export/exportSchema";
import {
  CURRENCY_FORMAT,
  INTEGER_FORMAT,
  styleAlternatingRow,
  styleHeaderRow,
} from "@/lib/export/builders/styles";

export function buildProductsSheet(workbook: ExcelJS.Workbook, rows: ExportProductRow[]): void {
  const sheet = workbook.addWorksheet("Products", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Product ID", key: "productId", width: 24 },
    { header: "Name", key: "name", width: 24 },
    { header: "Category", key: "category", width: 18 },
    { header: "Unit Price", key: "unitPrice", width: 12 },
    { header: "Stock", key: "stock", width: 10 },
    { header: "Stock Value", key: "stockValue", width: 14 },
    { header: "Provider", key: "providerName", width: 20 },
    { header: "Created", key: "createdAt", width: 20 },
    { header: "Updated", key: "updatedAt", width: 20 },
  ];

  styleHeaderRow(sheet);

  rows.forEach((row, index) => {
    const sheetRow = sheet.addRow(row);
    sheetRow.height = 18;
    styleAlternatingRow(sheetRow, index);
    sheetRow.getCell("unitPrice").numFmt = CURRENCY_FORMAT;
    sheetRow.getCell("stock").numFmt = INTEGER_FORMAT;
    sheetRow.getCell("stockValue").numFmt = CURRENCY_FORMAT;
  });
}
