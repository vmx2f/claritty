"use client";

import { useState } from "react";
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    BuildingOfficeIcon,
    UsersIcon,
    CheckCircleIcon,
    ClockIcon,
    EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";

// Mock Data
const MOCK_ORGANIZATIONS = [
    {
        id: "1",
        name: "Acme Corp",
        slug: "acme-corp",
        role: "Admin",
        status: "active",
        members: 12,
        createdAt: "2024-01-15",
        logo: null
    },
    {
        id: "2",
        name: "Globex Corporation",
        slug: "globex",
        role: "Member",
        status: "active",
        members: 45,
        createdAt: "2023-11-20",
        logo: null
    },
    {
        id: "3",
        name: "Soylent Corp",
        slug: "soylent",
        role: "Admin",
        status: "pending",
        members: 3,
        createdAt: "2024-02-01",
        logo: null
    },
    {
        id: "4",
        name: "Umbrella Academy",
        slug: "umbrella",
        role: "Viewer",
        status: "inactive",
        members: 8,
        createdAt: "2023-08-10",
        logo: null
    },
    {
        id: "5",
        name: "Cyberdyne Systems",
        slug: "cyberdyne",
        role: "Admin",
        status: "active",
        members: 156,
        createdAt: "2024-01-05",
        logo: null
    }
];

export default function OrganizationsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredOrgs = MOCK_ORGANIZATIONS.filter(org => {
        const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || org.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-success/10 text-success border-success/20';
            case 'pending': return 'bg-warning/10 text-warning border-warning/20';
            case 'inactive': return 'bg-secondary-text/10 text-secondary-text border-secondary-text/20';
            default: return 'bg-primary-text/5 text-primary-text border-primary-text/10';
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary-text tracking-tight">Organizations</h1>
                    <p className="text-secondary-text mt-1">Manage your workspaces and teams.</p>
                </div>
                <button className="flex items-center gap-2 bg-primary-text text-main px-6 py-2.5 rounded-full hover:bg-text-hover transition-all shadow-lg hover:shadow-xl active:scale-95 font-medium">
                    <PlusIcon className="w-5 h-5" />
                    <span>New Organization</span>
                </button>
            </div>

            {/* Statistics Section (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Organizations"
                    value={MOCK_ORGANIZATIONS.length.toString()}
                    icon={BuildingOfficeIcon}
                />
                <StatCard
                    title="Total Members"
                    value={MOCK_ORGANIZATIONS.reduce((acc, org) => acc + org.members, 0).toString()}
                    icon={UsersIcon}
                />
                <StatCard
                    title="Active Workspaces"
                    value={MOCK_ORGANIZATIONS.filter(o => o.status === 'active').length.toString()}
                    icon={CheckCircleIcon}
                />
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
                    <input
                        type="text"
                        placeholder="Search organizations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-main border border-border rounded-lg pl-10 pr-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50 transition-all"
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-main border border-border rounded-lg pl-10 pr-10 py-2 text-primary-text appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-color/50 transition-all"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Organizations Grid */}
            {filteredOrgs.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
                    <BuildingOfficeIcon className="w-16 h-16 text-secondary-text mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-primary-text">No organizations found</h3>
                    <p className="text-secondary-text">Try adjusting your search or create a new one.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrgs.map((org) => (
                        <div
                            key={org.id}
                            className="group bg-card hover:bg-hover border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-custom flex flex-col h-full relative overflow-hidden"
                        >
                            {/* Decorative gradient blob */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-color/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-opacity duration-300 opacity-50 group-hover:opacity-100"></div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="w-12 h-12 rounded-lg bg-main border border-border flex items-center justify-center text-xl font-bold text-primary-text shadow-sm group-hover:scale-105 transition-transform">
                                    {org.name.charAt(0)}
                                </div>
                                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(org.status)} capitalize`}>
                                    {org.status}
                                </div>
                            </div>

                            <div className="mb-4 relative z-10">
                                <h3 className="text-lg font-semibold text-primary-text group-hover:text-accent-color transition-colors truncate">
                                    {org.name}
                                </h3>
                                <p className="text-sm text-secondary-text truncate">/{org.slug}</p>
                            </div>

                            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-sm text-secondary-text relative z-10">
                                <div className="flex items-center gap-1.5">
                                    <UsersIcon className="w-4 h-4" />
                                    <span>{org.members} members</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="bg-primary-text/10 px-2 py-0.5 rounded text-xs font-medium text-primary-text">
                                        {org.role}
                                    </span>
                                </div>
                            </div>

                            <button className="absolute top-4 right-4 p-1 text-secondary-text hover:text-primary-text rounded-full hover:bg-black/5 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                                <EllipsisHorizontalIcon className="w-6 h-6" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon: Icon }: { title: string, value: string, icon: any }) {
    return (
        <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-accent-color/10 rounded-lg text-accent-color">
                <Icon className="w-6 h-6 text-primary-text" />
            </div>
            <div>
                <p className="text-sm text-secondary-text font-medium">{title}</p>
                <p className="text-2xl font-semibold text-primary-text">{value}</p>
            </div>
        </div>
    );
}
