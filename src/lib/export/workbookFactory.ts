import ExcelJS from "exceljs";

export function createWorkbook(orgName: string): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = orgName;
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;
  return workbook;
}
