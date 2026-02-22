'use client';

import { useState, useEffect } from "react";
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    XMarkIcon,
    EllipsisHorizontalIcon,
    PencilIcon,
    TrashIcon
} from "@heroicons/react/24/outline";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useOrganization } from "../../../../../contexts/OrganizationContext";
import { formatCurrency } from "../../../../../lib/currency";

export default function DashboardClients() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [newClient, setNewClient] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        city: "",
        country: "",
        notes: "",
        status: "prospect" as "active" | "inactive" | "prospect"
    });

    // Get selected organization from context
    const { selectedOrgId } = useOrganization();
    
    const clients = useQuery(api.clients.getClients, selectedOrgId ? { orgId: selectedOrgId } : "skip");
    const stats = useQuery(api.clients.getClientStats, selectedOrgId ? { orgId: selectedOrgId } : "skip");
    const createClientMutation = useMutation(api.clients.createClient);
    const updateClientMutation = useMutation(api.clients.updateClient);
    const deleteClientMutation = useMutation(api.clients.deleteClient);

    const filteredClients = clients?.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "all" || client.status === statusFilter;
        return matchesSearch && matchesStatus;
    }) || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-success/10 text-success border-success/20';
            case 'prospect': return 'bg-warning/10 text-warning border-warning/20';
            case 'inactive': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-primary-text/5 text-primary-text border-primary-text/10';
        }
    };

    const createClient = async () => {
        if (!selectedOrgId || !newClient.name.trim() || !newClient.email.trim()) return;
        
        try {
            await createClientMutation({
                orgId: selectedOrgId,
                name: newClient.name.trim(),
                email: newClient.email.trim(),
                phone: newClient.phone.trim() || undefined,
                company: newClient.company.trim() || undefined,
                address: newClient.address.trim() || undefined,
                city: newClient.city.trim() || undefined,
                country: newClient.country.trim() || undefined,
                notes: newClient.notes.trim() || undefined,
                status: newClient.status,
            });
            setShowCreateModal(false);
            setNewClient({
                name: "",
                email: "",
                phone: "",
                company: "",
                address: "",
                city: "",
                country: "",
                notes: "",
                status: "prospect"
            });
        } catch (error) {
            console.error("Failed to create client:", error);
        }
    };

    const updateClient = async () => {
        if (!editingClient) return;
        
        try {
            await updateClientMutation({
                clientId: editingClient._id,
                name: editingClient.name.trim(),
                email: editingClient.email.trim(),
                phone: editingClient.phone?.trim() || undefined,
                company: editingClient.company?.trim() || undefined,
                address: editingClient.address?.trim() || undefined,
                city: editingClient.city?.trim() || undefined,
                country: editingClient.country?.trim() || undefined,
                notes: editingClient.notes?.trim() || undefined,
                status: editingClient.status,
            });
            setShowEditModal(false);
            setEditingClient(null);
        } catch (error) {
            console.error("Failed to update client:", error);
        }
    };

    const deleteClient = async (clientId: Id<"clients">) => {
        if (!confirm("Are you sure you want to delete this client?")) return;
        
        try {
            await deleteClientMutation({ clientId });
        } catch (error) {
            console.error("Failed to delete client:", error);
        }
    };

    const openEditModal = (client: any) => {
        setEditingClient(client);
        setShowEditModal(true);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            {/* Check if organization exists */}
            {!selectedOrgId ? (
                <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-primary-text mb-2">No Organization Selected</h3>
                        <p className="text-secondary-text mb-4">Please select an organization from the sidebar to manage clients.</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-primary-text tracking-tight">Clients</h1>
                            <p className="text-secondary-text mt-1">Manage your client relationships and track interactions.</p>
                        </div>
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 bg-primary-text text-main px-6 py-2.5 rounded-full hover:bg-text-hover transition-all shadow-lg hover:shadow-xl active:scale-95 font-medium"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>New Client</span>
                        </button>
                    </div>

                    {/* Statistics Section */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <StatCard
                            title="Total Clients"
                            value={(stats?.totalClients || 0).toString()}
                            icon={UserIcon}
                        />
                        <StatCard
                            title="Active"
                            value={(stats?.activeClients || 0).toString()}
                            icon={UserIcon}
                        />
                        <StatCard
                            title="Prospects"
                            value={(stats?.prospectClients || 0).toString()}
                            icon={UserIcon}
                        />
                        <StatCard
                            title="Inactive"
                            value={(stats?.inactiveClients || 0).toString()}
                            icon={UserIcon}
                        />
                        <StatCard
                            title="Total Revenue"
                            value={formatCurrency(stats?.totalRevenue || 0)}
                            icon={BuildingOfficeIcon}
                        />
                    </div>

                    {/* Filters and Search */}
                    <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
                            <input
                                type="text"
                                placeholder="Search clients..."
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
                                <option value="prospect">Prospect</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Clients Grid */}
                    {filteredClients.length === 0 ? (
                        <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
                            <UserIcon className="w-16 h-16 text-secondary-text mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-primary-text">No clients found</h3>
                            <p className="text-secondary-text">Try adjusting your search or create a new client.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredClients.map((client) => (
                                <div
                                    key={client._id}
                                    className="group bg-card hover:bg-hover border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-custom flex flex-col h-full relative overflow-hidden"
                                >
                                    {/* Decorative gradient blob */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-color/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-opacity duration-300 opacity-50 group-hover:opacity-100"></div>

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="w-12 h-12 rounded-lg bg-main border border-border flex items-center justify-center text-xl font-bold text-primary-text shadow-sm group-hover:scale-105 transition-transform">
                                            <UserIcon className="w-6 h-6" />
                                        </div>
                                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusColor(client.status)}`}>
                                            {client.status}
                                        </div>
                                    </div>

                                    <div className="mb-4 relative z-10">
                                        <h3 className="text-lg font-semibold text-primary-text group-hover:text-accent-color transition-colors truncate">
                                            {client.name}
                                        </h3>
                                        <p className="text-sm text-secondary-text">Client #{client._id.slice(0, 8)}</p>
                                    </div>

                                    <div className="mb-4 relative z-10 space-y-2">
                                        {client.email && (
                                            <div className="flex items-center text-sm text-secondary-text">
                                                <EnvelopeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span className="truncate">{client.email}</span>
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className="flex items-center text-sm text-secondary-text">
                                                <PhoneIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span className="truncate">{client.phone}</span>
                                            </div>
                                        )}
                                        {client.company && (
                                            <div className="flex items-center text-sm text-secondary-text">
                                                <BuildingOfficeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span className="truncate">{client.company}</span>
                                            </div>
                                        )}
                                        {(client.city || client.country) && (
                                            <div className="flex items-center text-sm text-secondary-text">
                                                <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span className="truncate">{[client.city, client.country].filter(Boolean).join(", ")}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between relative z-10">
                                        <div className="text-sm text-secondary-text">
                                            <div className="font-medium text-primary-text">{formatCurrency(client.totalSpent)}</div>
                                            <div className="text-xs">{client.totalOrders} orders</div>
                                        </div>
                                        <div className="text-xs text-secondary-text">
                                            {new Date(client.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button 
                                            onClick={() => openEditModal(client)}
                                            className="p-1 text-secondary-text hover:text-primary-text rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => deleteClient(client._id)}
                                            className="p-1 text-secondary-text hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Create Client Modal */}
                    {showCreateModal && (
                        <ClientModal
                            title="Create New Client"
                            client={newClient}
                            setClient={setNewClient}
                            onSubmit={createClient}
                            onClose={() => setShowCreateModal(false)}
                        />
                    )}

                    {/* Edit Client Modal */}
                    {showEditModal && editingClient && (
                        <ClientModal
                            title="Edit Client"
                            client={editingClient}
                            setClient={setEditingClient}
                            onSubmit={updateClient}
                            onClose={() => {
                                setShowEditModal(false);
                                setEditingClient(null);
                            }}
                        />
                    )}
                </>
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

function ClientModal({ 
    title, 
    client, 
    setClient, 
    onSubmit, 
    onClose 
}: { 
    title: string; 
    client: any; 
    setClient: (client: any) => void; 
    onSubmit: () => void; 
    onClose: () => void; 
}) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary-text">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-hover rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5 text-secondary-text" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={client.name}
                                onChange={(e) => setClient({ ...client, name: e.target.value })}
                                className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                                placeholder="Enter client name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={client.email}
                                onChange={(e) => setClient({ ...client, email: e.target.value })}
                                className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                                placeholder="Enter email address"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={client.phone}
                                onChange={(e) => setClient({ ...client, phone: e.target.value })}
                                className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                                placeholder="Enter phone number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                Company
                            </label>
                            <input
                                type="text"
                                value={client.company}
                                onChange={(e) => setClient({ ...client, company: e.target.value })}
                                className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                                placeholder="Enter company name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                Address
                            </label>
                            <input
                                type="text"
                                value={client.address}
                                onChange={(e) => setClient({ ...client, address: e.target.value })}
                                className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                                placeholder="Street address"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                City
                            </label>
                            <input
                                type="text"
                                value={client.city}
                                onChange={(e) => setClient({ ...client, city: e.target.value })}
                                className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                                placeholder="City"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                Country
                            </label>
                            <input
                                type="text"
                                value={client.country}
                                onChange={(e) => setClient({ ...client, country: e.target.value })}
                                className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                                placeholder="Country"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-text mb-2">
                            Status
                        </label>
                        <select
                            value={client.status}
                            onChange={(e) => setClient({ ...client, status: e.target.value as any })}
                            className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                        >
                            <option value="prospect">Prospect</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-text mb-2">
                            Notes
                        </label>
                        <textarea
                            value={client.notes}
                            onChange={(e) => setClient({ ...client, notes: e.target.value })}
                            className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50 resize-none"
                            placeholder="Additional notes about the client"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-2.5 border border-border rounded-lg hover:bg-hover transition-colors text-primary-text font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={!client.name.trim() || !client.email.trim()}
                            className="flex-1 px-6 py-2.5 bg-primary-text text-main rounded-lg hover:bg-text-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {title.includes("Edit") ? "Update" : "Create"} Client
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
