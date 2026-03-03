export function toCSV<T extends object>(rows: T[]): string {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0] as object);

  const escapeValue = (value: unknown) => {
    const normalized = value === null || value === undefined ? "" : String(value);
    if (
      normalized.includes(",") ||
      normalized.includes('"') ||
      normalized.includes("\n") ||
      normalized.includes("\r")
    ) {
      return `"${normalized.replace(/"/g, '""')}"`;
    }
    return normalized;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) => {
      const record = row as Record<string, unknown>;
      return headers.map((header) => escapeValue(record[header])).join(",");
    }),
  ];

  return lines.join("\r\n");
}
