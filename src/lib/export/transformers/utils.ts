import type { ExportDateRange } from "@/lib/export/exportSchema";

export function toTimestampRange(range?: ExportDateRange) {
  const from = range?.from ? Date.parse(range.from) : undefined;
  const to = range?.to ? Date.parse(range.to) : undefined;

  return {
    from: Number.isFinite(from) ? from : undefined,
    to: Number.isFinite(to) ? to : undefined,
  };
}

export function formatDate(value: number | null | undefined) {
  if (!value) {
    return null;
  }
  return new Date(value).toISOString();
}

export function humanId(value: string, prefix: string) {
  return `${prefix}-${value.slice(-8)}`;
}
