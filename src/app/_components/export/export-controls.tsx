"use client";

import { useMemo, useState } from "react";
import type { BlockId } from "@/blocks/types";

type ExportFormat = "xlsx" | "csv";
type ExportTarget = "full" | "orders" | "products" | "clients" | "incomes" | "outputs";

type ExportControlsProps = {
  orgId: string;
  activeBlocks: BlockId[];
};

const TARGET_LABELS: Record<ExportTarget, string> = {
  full: "Full Organization",
  orders: "Orders",
  products: "Products",
  clients: "Clients",
  incomes: "Incomes",
  outputs: "Outputs",
};

const BLOCK_TO_TARGET: Partial<Record<BlockId, ExportTarget>> = {
  orders: "orders",
  products: "products",
  clients: "clients",
  incomes: "incomes",
  outputs: "outputs",
};

export function ExportControls({ orgId, activeBlocks }: ExportControlsProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [target, setTarget] = useState<ExportTarget>("full");
  const [format, setFormat] = useState<ExportFormat>("xlsx");

  const targets = useMemo(() => {
    const activeTargets = activeBlocks
      .map((blockId) => BLOCK_TO_TARGET[blockId])
      .filter((value): value is ExportTarget => Boolean(value));

    return ["full", ...Array.from(new Set(activeTargets))] as ExportTarget[];
  }, [activeBlocks]);

  const effectiveFormat: ExportFormat = target === "full" ? "xlsx" : format;

  const runExport = () => {
    const query = new URLSearchParams({ orgId });
    if (from) query.set("from", from);
    if (to) query.set("to", to);

    const path =
      target === "full"
        ? "/api/export/full"
        : effectiveFormat === "csv"
          ? `/api/export/${target}/csv`
          : `/api/export/${target}`;

    window.open(`${path}?${query.toString()}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <label className="flex min-w-40 flex-col gap-1 text-xs text-secondary-text">
          Export Scope
          <select
            value={target}
            onChange={(event) => setTarget(event.target.value as ExportTarget)}
            className="rounded-lg border border-border bg-main px-3 py-2 text-sm text-primary-text"
          >
            {targets.map((value) => (
              <option key={value} value={value}>
                {TARGET_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-28 flex-col gap-1 text-xs text-secondary-text">
          Format
          <select
            value={effectiveFormat}
            onChange={(event) => setFormat(event.target.value as ExportFormat)}
            disabled={target === "full"}
            className="rounded-lg border border-border bg-main px-3 py-2 text-sm text-primary-text disabled:opacity-60"
          >
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
          </select>
        </label>

        <label className="flex min-w-32 flex-col gap-1 text-xs text-secondary-text">
          From
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="rounded-lg border border-border bg-main px-3 py-2 text-sm text-primary-text"
          />
        </label>

        <label className="flex min-w-32 flex-col gap-1 text-xs text-secondary-text">
          To
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="rounded-lg border border-border bg-main px-3 py-2 text-sm text-primary-text"
          />
        </label>

        <button
          type="button"
          onClick={runExport}
          className="rounded-lg bg-primary-text px-4 py-2 text-sm font-medium text-main hover:bg-text-hover"
        >
          Export
        </button>
      </div>

      <p className="text-xs text-secondary-text">
        Uses server-side exports with your selected organization and optional date range.
      </p>
    </div>
  );
}
