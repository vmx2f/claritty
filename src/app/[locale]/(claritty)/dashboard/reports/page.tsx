"use client";

import { useMemo, useState, type ComponentType } from "react";
import { useQuery } from "convex/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../../../../../../convex/_generated/api";
import { ExportControls } from "@/app/_components/export/export-controls";
import { useOrganization } from "../../../../_components/providers/organization-provider";
import { formatCurrency } from "../../../../../lib/currency";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ChartBarIcon,
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

type ReportView = "overview" | "financial" | "sales";

const CHART_COLORS = {
  income: "#0ea5a4",
  expenses: "#ef4444",
  revenue: "#2563eb",
  orders: "#f59e0b",
  paid: "#16a34a",
  shipped: "#0ea5a4",
  pending: "#f59e0b",
  cancelled: "#6b7280",
};

export default function ReportsPage() {
  const { selectedOrgId, activeBlocks } = useOrganization();
  const [view, setView] = useState<ReportView>("overview");

  const report = useQuery(
    api.reports.getDashboardReport,
    selectedOrgId ? { orgId: selectedOrgId } : "skip"
  );

  const orders = useQuery(
    api.orders.getOrders,
    selectedOrgId ? { orgId: selectedOrgId } : "skip"
  );

  const transactions = useQuery(
    api.transactions.getTransactions,
    selectedOrgId ? { orgId: selectedOrgId } : "skip"
  );

  const availableViews = useMemo(() => {
    const next: Array<{ id: ReportView; label: string; description: string }> = [
      { id: "overview", label: "Overview", description: "High-level health metrics" },
    ];

    if (activeBlocks.includes("incomes") || activeBlocks.includes("outputs")) {
      next.push({
        id: "financial",
        label: "Financial",
        description: "Income, expense, and balance trends",
      });
    }

    if (activeBlocks.includes("orders")) {
      next.push({
        id: "sales",
        label: "Sales",
        description: "Orders, revenue, and status distribution",
      });
    }

    return next;
  }, [activeBlocks]);

  const monthlyData = useMemo(() => {
    if (!orders || !transactions) {
      return [];
    }

    const now = new Date();
    const labels: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-US", { month: "short" });
      labels.push({ key, label });
    }

    const base = labels.map(({ key, label }) => ({
      key,
      month: label,
      income: 0,
      expenses: 0,
      orders: 0,
      revenue: 0,
    }));

    const byKey = new Map(base.map((row) => [row.key, row]));

    for (const tx of transactions) {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const row = byKey.get(key);
      if (!row) continue;

      if (tx.type === "income" || tx.type === "order_payment") {
        row.income += tx.amount;
      } else {
        row.expenses += tx.amount;
      }
    }

    for (const order of orders) {
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const row = byKey.get(key);
      if (!row) continue;

      row.orders += 1;
      if (order.status !== "cancelled") {
        row.revenue += order.total;
      }
    }

    return base.map((row) => ({
      ...row,
      balance: row.income - row.expenses,
    }));
  }, [orders, transactions]);

  if (!selectedOrgId) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
          <ChartBarIcon className="w-16 h-16 text-secondary-text mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-primary-text mb-2">No Organization Selected</h3>
          <p className="text-secondary-text">Please select an organization from the sidebar to view reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text tracking-tight">Reports</h1>
          <p className="text-secondary-text mt-1">Interactive business analytics for your active blocks.</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {availableViews.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                view === item.id
                  ? "border-primary-text bg-primary-text/10"
                  : "border-border bg-card hover:bg-hover"
              }`}
            >
              <p className="text-sm font-semibold text-primary-text">{item.label}</p>
              <p className="text-[11px] text-secondary-text">{item.description}</p>
            </button>
          ))}
        </div>
      </div>

      <ExportControls orgId={selectedOrgId} activeBlocks={activeBlocks} />

      {!report ? (
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-card border border-border rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(report.totalRevenue)}
              icon={BanknotesIcon}
              variant="primary"
            />
            <StatCard
              title="Total Income"
              value={formatCurrency(report.totalIncome)}
              icon={ArrowTrendingUpIcon}
              variant="success"
            />
            <StatCard
              title="Total Expenses"
              value={formatCurrency(report.totalExpenses)}
              icon={ArrowTrendingDownIcon}
              variant="warning"
            />
            <StatCard
              title="Balance"
              value={formatCurrency(report.balance)}
              icon={ChartBarIcon}
              variant={report.balance >= 0 ? "success" : "error"}
            />
          </div>

          {view === "overview" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 bg-card border border-border rounded-xl p-5">
                <h3 className="text-lg font-semibold text-primary-text mb-1">Cash Flow Snapshot</h3>
                <p className="text-xs text-secondary-text mb-4">Income vs expenses in the last 6 months</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" opacity={0.3} />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                      <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill={CHART_COLORS.income} radius={[6, 6, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill={CHART_COLORS.expenses} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-lg font-semibold text-primary-text mb-1">Order Status</h3>
                <p className="text-xs text-secondary-text mb-4">Current distribution</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Pending", value: report.ordersByStatus.pending },
                          { name: "Paid", value: report.ordersByStatus.paid },
                          { name: "Shipped", value: report.ordersByStatus.shipped },
                          { name: "Cancelled", value: report.ordersByStatus.cancelled },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={92}
                      >
                        <Cell fill={CHART_COLORS.pending} />
                        <Cell fill={CHART_COLORS.paid} />
                        <Cell fill={CHART_COLORS.shipped} />
                        <Cell fill={CHART_COLORS.cancelled} />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {view === "financial" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-lg font-semibold text-primary-text mb-1">Income vs Expenses Trend</h3>
                <p className="text-xs text-secondary-text mb-4">Line comparison by month</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" opacity={0.3} />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                      <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                      <Legend />
                      <Line type="monotone" dataKey="income" name="Income" stroke={CHART_COLORS.income} strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="expenses" name="Expenses" stroke={CHART_COLORS.expenses} strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-lg font-semibold text-primary-text mb-1">Monthly Balance</h3>
                <p className="text-xs text-secondary-text mb-4">Net movement (income - expenses)</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" opacity={0.3} />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                      <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                      <Area type="monotone" dataKey="balance" name="Balance" stroke={CHART_COLORS.revenue} fill="#93c5fd" fillOpacity={0.4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {view === "sales" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-lg font-semibold text-primary-text mb-1">Orders and Revenue</h3>
                <p className="text-xs text-secondary-text mb-4">Monthly volume and sales value</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" opacity={0.3} />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis yAxisId="left" stroke="#6b7280" />
                      <YAxis yAxisId="right" orientation="right" stroke="#6b7280" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                      <Tooltip formatter={(value: number | undefined, key: string | undefined) => (key === "orders" ? value || 0 : formatCurrency(value || 0))} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="orders" name="Orders" fill={CHART_COLORS.orders} radius={[6, 6, 0, 0]} />
                      <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill={CHART_COLORS.revenue} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-lg font-semibold text-primary-text mb-1">Operations Snapshot</h3>
                <p className="text-xs text-secondary-text mb-4">Current workload and catalog size</p>
                <div className="grid grid-cols-1 gap-3">
                  <MiniMetric label="Total Orders" value={report.totalOrders.toString()} icon={ShoppingCartIcon} />
                  <MiniMetric label="Total Clients" value={report.totalClients.toString()} icon={UsersIcon} />
                  <MiniMetric label="Total Products" value={report.totalProducts.toString()} icon={CubeIcon} />
                  <MiniMetric label="Recent Orders (30d)" value={report.recentOrders.toString()} icon={ChartBarIcon} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  variant?: "default" | "primary" | "success" | "warning" | "error";
}) {
  const variantClasses = {
    default: "bg-slate-200/40 text-slate-700",
    primary: "bg-blue-500/12 text-blue-600",
    success: "bg-emerald-500/12 text-emerald-600",
    warning: "bg-amber-500/15 text-amber-600",
    error: "bg-red-500/12 text-red-600",
  };

  return (
    <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-lg ${variantClasses[variant]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-secondary-text font-medium">{title}</p>
        <p className="text-xl font-semibold text-primary-text">{value}</p>
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-main/40 px-3 py-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-secondary-text" />
        <span className="text-sm text-secondary-text">{label}</span>
      </div>
      <span className="text-sm font-semibold text-primary-text">{value}</span>
    </div>
  );
}
