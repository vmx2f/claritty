import type ExcelJS from "exceljs";
import type { ExportSummaryInput } from "@/lib/export/exportSchema";
import { CURRENCY_FORMAT, INTEGER_FORMAT } from "@/lib/export/builders/styles";

export function buildSummarySheet(workbook: ExcelJS.Workbook, summary: ExportSummaryInput): void {
  const sheet = workbook.addWorksheet("Summary", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Metric", key: "metric", width: 28 },
    { header: "Value", key: "value", width: 30 },
  ];

  const titleRow = sheet.getRow(1);
  titleRow.getCell(1).value = `Export Summary - ${summary.orgName}`;
  titleRow.getCell(1).font = { bold: true, size: 13 };
  titleRow.getCell(2).value = summary.exportedAt;
  titleRow.getCell(2).alignment = { horizontal: "right" };

  sheet.addRow({ metric: "Included Blocks", value: summary.includedBlocks.join(", ") || "None" });
  sheet.addRow({ metric: "Total Orders", value: summary.orders.length });
  sheet.addRow({ metric: "Total Products", value: summary.products.length });
  sheet.addRow({ metric: "Total Clients", value: summary.clients.length });

  const totalIncome = summary.incomes.reduce((sum, row) => sum + row.amount, 0);
  const totalOutputs = summary.outputs.reduce((sum, row) => sum + row.amount, 0);
  sheet.addRow({ metric: "Total Incomes", value: totalIncome });
  sheet.addRow({ metric: "Total Outputs", value: totalOutputs });
  sheet.addRow({ metric: "Net Cash Flow", value: totalIncome - totalOutputs });

  const blockRowsStart = sheet.rowCount + 2;
  sheet.addRow({ metric: "Block", value: "Record Count" });
  [
    ["Orders", summary.orders.length],
    ["Products", summary.products.length],
    ["Clients", summary.clients.length],
    ["Incomes", summary.incomes.length],
    ["Outputs", summary.outputs.length],
  ].forEach(([metric, value]) => {
    sheet.addRow({ metric, value });
  });

  for (let rowIndex = 3; rowIndex <= sheet.rowCount; rowIndex += 1) {
    const metric = sheet.getRow(rowIndex).getCell(1).value;
    if (metric === "Total Incomes" || metric === "Total Outputs" || metric === "Net Cash Flow") {
      sheet.getRow(rowIndex).getCell(2).numFmt = CURRENCY_FORMAT;
    } else if (typeof sheet.getRow(rowIndex).getCell(2).value === "number") {
      sheet.getRow(rowIndex).getCell(2).numFmt = INTEGER_FORMAT;
    }
  }

  sheet.getRow(blockRowsStart).font = { bold: true };
}
