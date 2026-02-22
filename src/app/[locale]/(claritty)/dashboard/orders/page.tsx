"use client";

import { useState, useEffect } from "react";
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ShoppingCartIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    ClockIcon,
    TruckIcon,
    XMarkIcon,
    EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useOrganization } from "../../../../../contexts/OrganizationContext";
import { formatCurrency } from "../../../../../lib/currency";

export default function DashboardOrders() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newOrder, setNewOrder] = useState({
        clientId: "" as Id<"clients"> | "",
        customerName: "",
        items: [{ product: "", quantity: 1, price: 0 }],
        total: 0
    });

    // Get selected organization from context
    const { selectedOrgId } = useOrganization();

    const orders = useQuery(api.orders.getOrders, selectedOrgId ? { orgId: selectedOrgId } : "skip");
    const clients = useQuery(api.clients.getClients, selectedOrgId ? { orgId: selectedOrgId } : "skip");
    const createOrderMutation = useMutation(api.orders.createOrder);
    const updateOrderStatusMutation = useMutation(api.orders.updateOrderStatus);

    const filteredOrders = orders?.filter(order => {
        const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some(item => item.product.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    }) || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-warning/10 text-warning border-warning/20';
            case 'paid': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'shipped': return 'bg-success/10 text-success border-success/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-primary-text/5 text-primary-text border-primary-text/10';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return ClockIcon;
            case 'paid': return CurrencyDollarIcon;
            case 'shipped': return TruckIcon;
            case 'cancelled': return XMarkIcon;
            default: return CheckCircleIcon;
        }
    };

    const addItem = () => {
        setNewOrder(prev => ({
            ...prev,
            items: [...prev.items, { product: "", quantity: 1, price: 0 }]
        }));
    };

    const removeItem = (index: number) => {
        setNewOrder(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        setNewOrder(prev => {
            const updatedItems = [...prev.items];
            updatedItems[index] = { ...updatedItems[index], [field]: value };
            const total = updatedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            return { ...prev, items: updatedItems, total };
        });
    };

    const createOrder = async () => {
        if (!selectedOrgId) {
            console.error("No organization selected");
            return;
        }

        try {
            await createOrderMutation({
                orgId: selectedOrgId,
                clientId: newOrder.clientId || undefined,
                customerName: newOrder.customerName,
                items: newOrder.items,
                total: newOrder.total
            });
            setShowCreateModal(false);
            setNewOrder({
                clientId: "" as Id<"clients"> | "",
                customerName: "",
                items: [{ product: "", quantity: 1, price: 0 }],
                total: 0
            });
        } catch (error) {
            console.error("Failed to create order:", error);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Check if organization exists */}
            {!selectedOrgId ? (
                <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-primary-text mb-2">No Organization Selected</h3>
                        <p className="text-secondary-text mb-4">Please select an organization from the sidebar to manage orders.</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-primary-text tracking-tight">Orders</h1>
                            <p className="text-secondary-text mt-1">Manage customer orders and track shipments.</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 bg-primary-text text-main px-6 py-2.5 rounded-full hover:bg-text-hover transition-all shadow-lg hover:shadow-xl active:scale-95 font-medium"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>New Order</span>
                        </button>
                    </div>

                    {/* Statistics Section */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Orders"
                            value={(orders?.length || 0).toString()}
                            icon={ShoppingCartIcon}
                        />
                        <StatCard
                            title="Pending"
                            value={(orders?.filter(o => o.status === 'pending').length || 0).toString()}
                            icon={ClockIcon}
                        />
                        <StatCard
                            title="Paid"
                            value={(orders?.filter(o => o.status === 'paid').length || 0).toString()}
                            icon={CurrencyDollarIcon}
                        />
                        <StatCard
                            title="Shipped"
                            value={(orders?.filter(o => o.status === 'shipped').length || 0).toString()}
                            icon={TruckIcon}
                        />
                    </div>

                    {/* Filters and Search */}
                    <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
                            <input
                                type="text"
                                placeholder="Search orders..."
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
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="shipped">Shipped</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Orders Grid */}
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
                            <ShoppingCartIcon className="w-16 h-16 text-secondary-text mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-primary-text">No orders found</h3>
                            <p className="text-secondary-text">Try adjusting your search or create a new order.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOrders.map((order) => {
                                const StatusIcon = getStatusIcon(order.status);
                                return (
                                    <div
                                        key={order._id}
                                        className="group bg-card hover:bg-hover border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-custom flex flex-col h-full relative overflow-hidden"
                                    >
                                        {/* Decorative gradient blob */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-color/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-opacity duration-300 opacity-50 group-hover:opacity-100"></div>

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className="w-12 h-12 rounded-lg bg-main border border-border flex items-center justify-center text-xl font-bold text-primary-text shadow-sm group-hover:scale-105 transition-transform">
                                                <ShoppingCartIcon className="w-6 h-6" />
                                            </div>
                                            <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(order.status)} capitalize`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {order.status}
                                            </div>
                                        </div>

                                        <div className="mb-4 relative z-10">
                                            <h3 className="text-lg font-semibold text-primary-text group-hover:text-accent-color transition-colors truncate">
                                                {order.customerName}
                                            </h3>
                                            <p className="text-sm text-secondary-text">Order #{order._id.slice(0, 8)}</p>
                                        </div>

                                        <div className="mb-4 relative z-10">
                                            <div className="text-sm text-secondary-text space-y-1">
                                                {order.items.slice(0, 2).map((item, idx) => (
                                                    <div key={idx} className="flex justify-between">
                                                        <span className="truncate">{item.product} x{item.quantity}</span>
                                                        <span className="font-medium text-primary-text">{formatCurrency(item.price * item.quantity)}</span>
                                                    </div>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <div className="text-xs text-secondary-text">+{order.items.length - 2} more items</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between relative z-10">
                                            <div className="text-lg font-semibold text-primary-text">
                                                {formatCurrency(order.total)}
                                            </div>
                                            <div className="text-xs text-secondary-text">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <button className="absolute top-4 right-4 p-1 text-secondary-text hover:text-primary-text rounded-full hover:bg-black/5 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                                            <EllipsisHorizontalIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Create Order Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                            <div className="bg-card rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-primary-text">Create New Order</h2>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="p-2 hover:bg-hover rounded-lg transition-colors"
                                    >
                                        <XMarkIcon className="w-5 h-5 text-secondary-text" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-primary-text mb-2">
                                            Select Client *
                                        </label>
                                        <select
                                            value={newOrder.clientId}
                                            onChange={(e) => {
                                                const selectedClientId = e.target.value as Id<"clients">;
                                                const selectedClient = clients?.find(c => c._id === selectedClientId);
                                                setNewOrder(prev => ({
                                                    ...prev,
                                                    clientId: selectedClientId,
                                                    customerName: selectedClient?.name || ""
                                                }));
                                            }}
                                            className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                                        >
                                            <option value="">Choose a client...</option>
                                            {clients?.map((client) => (
                                                <option key={client._id} value={client._id}>
                                                    {client.name} {client.company && `(${client.company})`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-primary-text mb-2">
                                            Customer Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newOrder.customerName}
                                            onChange={(e) => setNewOrder(prev => ({ ...prev, customerName: e.target.value }))}
                                            className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                                            placeholder="Customer name (auto-filled from client selection)"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-primary-text">
                                                Items
                                            </label>
                                            <button
                                                onClick={addItem}
                                                className="text-sm text-accent-color hover:text-accent-color/80 transition-colors"
                                            >
                                                + Add Item
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {newOrder.items.map((item, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={item.product}
                                                        onChange={(e) => updateItem(index, 'product', e.target.value)}
                                                        className="flex-1 bg-main border border-border rounded-lg px-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                                                        placeholder="Product name"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                        className="w-20 bg-main border border-border rounded-lg px-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                                                        placeholder="Qty"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                                        className="w-24 bg-main border border-border rounded-lg px-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                                                        placeholder="Price"
                                                    />
                                                    {newOrder.items.length > 1 && (
                                                        <button
                                                            onClick={() => removeItem(index)}
                                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-primary-text">Total:</span>
                                            <span className="text-2xl font-bold text-primary-text">{formatCurrency(newOrder.total)}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1 px-6 py-2.5 border border-border rounded-lg hover:bg-hover transition-colors text-primary-text font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={createOrder}
                                            disabled={!newOrder.clientId || !newOrder.customerName || newOrder.items.some(item => !item.product)}
                                            className="flex-1 px-6 py-2.5 bg-primary-text text-main rounded-lg hover:bg-text-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Create Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
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
