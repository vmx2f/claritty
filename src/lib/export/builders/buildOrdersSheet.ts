import type ExcelJS from "exceljs";
import type { ExportOrderRow } from "@/lib/export/exportSchema";
import {
  CURRENCY_FORMAT,
  INTEGER_FORMAT,
  styleAlternatingRow,
  styleHeaderRow,
} from "@/lib/export/builders/styles";

export function buildOrdersSheet(workbook: ExcelJS.Workbook, rows: ExportOrderRow[]): void {
  const sheet = workbook.addWorksheet("Orders", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Order ID", key: "orderId", width: 24 },
    { header: "Date", key: "createdAt", width: 20 },
    { header: "Client", key: "clientName", width: 22 },
    { header: "Email", key: "clientEmail", width: 26 },
    { header: "Product", key: "productName", width: 22 },
    { header: "Qty", key: "quantity", width: 8 },
    { header: "Unit Price", key: "unitPrice", width: 12 },
    { header: "Subtotal", key: "subtotal", width: 12 },
    { header: "Tax", key: "tax", width: 10 },
    { header: "Total", key: "total", width: 12 },
    { header: "Status", key: "status", width: 14 },
    { header: "Fulfilled At", key: "fulfilledAt", width: 20 },
  ];

  styleHeaderRow(sheet);

  rows.forEach((row, index) => {
    const sheetRow = sheet.addRow(row);
    sheetRow.height = 18;
    styleAlternatingRow(sheetRow, index);
    sheetRow.getCell("quantity").numFmt = INTEGER_FORMAT;
    sheetRow.getCell("unitPrice").numFmt = CURRENCY_FORMAT;
    sheetRow.getCell("subtotal").numFmt = CURRENCY_FORMAT;
    sheetRow.getCell("tax").numFmt = CURRENCY_FORMAT;
    sheetRow.getCell("total").numFmt = CURRENCY_FORMAT;
  });

  if (rows.length > 0) {
    const summaryRow = sheet.addRow({
      clientName: "TOTAL",
      subtotal: rows.reduce((sum, row) => sum + row.subtotal, 0),
      tax: rows.reduce((sum, row) => sum + row.tax, 0),
      total: rows.reduce((sum, row) => sum + row.total, 0),
    });
    summaryRow.font = { bold: true };
    summaryRow.getCell("subtotal").numFmt = CURRENCY_FORMAT;
    summaryRow.getCell("tax").numFmt = CURRENCY_FORMAT;
    summaryRow.getCell("total").numFmt = CURRENCY_FORMAT;
  }
}
