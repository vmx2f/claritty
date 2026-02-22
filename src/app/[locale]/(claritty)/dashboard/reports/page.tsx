"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useOrganization } from "../../../../../contexts/OrganizationContext";
import { formatCurrency } from "../../../../../lib/currency";
import {
  ChartBarIcon,
  ShoppingCartIcon,
  UsersIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

export default function ReportsPage() {
  const { selectedOrgId } = useOrganization();
  const report = useQuery(
    api.reports.getDashboardReport,
    selectedOrgId ? { orgId: selectedOrgId } : "skip"
  );

  if (!selectedOrgId) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
          <ChartBarIcon className="w-16 h-16 text-secondary-text mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-primary-text mb-2">
            No Organization Selected
          </h3>
          <p className="text-secondary-text">
            Please select an organization from the sidebar to view reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-primary-text tracking-tight">
          Reports
        </h1>
        <p className="text-secondary-text mt-1">
          Overview and analytics for your organization (Peruvian Soles - S/)
        </p>
      </div>

      {!report ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-card border border-border rounded-xl"
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue (Orders)"
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

          {/* Recent Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-primary-text mb-4">
                Last 30 Days
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-secondary-text">Orders</span>
                  <span className="font-semibold text-primary-text">
                    {report.recentOrders}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-text">Revenue</span>
                  <span className="font-semibold text-primary-text">
                    {formatCurrency(report.recentRevenue)}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-primary-text mb-4">
                Orders by Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-secondary-text">Pending</span>
                  <span className="font-medium text-warning">
                    {report.ordersByStatus.pending}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-text">Paid</span>
                  <span className="font-medium text-primary-text">
                    {report.ordersByStatus.paid}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-text">Shipped</span>
                  <span className="font-medium text-success">
                    {report.ordersByStatus.shipped}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-text">Cancelled</span>
                  <span className="font-medium text-secondary-text">
                    {report.ordersByStatus.cancelled}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Orders"
              value={report.totalOrders.toString()}
              icon={ShoppingCartIcon}
            />
            <StatCard
              title="Total Clients"
              value={report.totalClients.toString()}
              icon={UsersIcon}
            />
            <StatCard
              title="Total Products"
              value={report.totalProducts.toString()}
              icon={CubeIcon}
            />
          </div>
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
  icon: any;
  variant?: "default" | "primary" | "success" | "warning" | "error";
}) {
  const variantClasses = {
    default: "bg-accent-color/10 text-accent-color",
    primary: "bg-blue-500/10 text-blue-500",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-red-500/10 text-red-500",
  };
  return (
    <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4">
      <div
        className={`p-3 rounded-lg ${variantClasses[variant]}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-secondary-text font-medium">{title}</p>
        <p className="text-xl font-semibold text-primary-text">{value}</p>
      </div>
    </div>
  );
}
