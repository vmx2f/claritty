import type ExcelJS from "exceljs";
import type { ExportClientRow } from "@/lib/export/exportSchema";
import {
  CURRENCY_FORMAT,
  INTEGER_FORMAT,
  styleAlternatingRow,
  styleHeaderRow,
} from "@/lib/export/builders/styles";

export function buildClientsSheet(workbook: ExcelJS.Workbook, rows: ExportClientRow[]): void {
  const sheet = workbook.addWorksheet("Clients", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Client ID", key: "clientId", width: 24 },
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 26 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Address", key: "address", width: 30 },
    { header: "Total Orders", key: "totalOrders", width: 12 },
    { header: "Total Spent", key: "totalSpent", width: 12 },
    { header: "Last Order", key: "lastOrderDate", width: 20 },
    { header: "Created", key: "createdAt", width: 20 },
  ];

  styleHeaderRow(sheet);

  rows.forEach((row, index) => {
    const sheetRow = sheet.addRow(row);
    sheetRow.height = 18;
    styleAlternatingRow(sheetRow, index);
    sheetRow.getCell("totalOrders").numFmt = INTEGER_FORMAT;
    sheetRow.getCell("totalSpent").numFmt = CURRENCY_FORMAT;
  });
}
