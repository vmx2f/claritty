"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useOrganization } from "../../../../../contexts/OrganizationContext";
import { formatCurrency } from "../../../../../lib/currency";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const INCOME_SOURCES = [
  { id: "venta", label: "Venta" },
  { id: "orden", label: "Orden" },
  { id: "proveedor", label: "Proveedor / Reembolso" },
  { id: "otro", label: "Otro" },
];

const EXPENSE_SOURCES = [
  { id: "proveedor", label: "Proveedor" },
  { id: "orden", label: "Orden / Gasto" },
  { id: "inventario", label: "Inventario" },
  { id: "operativo", label: "Gasto operativo" },
  { id: "otro", label: "Otro" },
];

export default function TransactionsPage() {
  const { selectedOrgId } = useOrganization();
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(true);
  const [createProductInline, setCreateProductInline] = useState(false);
  const [newTx, setNewTx] = useState({
    amount: 0,
    description: "",
    source: "venta",
    productId: "" as Id<"products"> | "",
    orderId: "" as Id<"orders"> | "",
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
  });

  const transactions = useQuery(
    api.transactions.getTransactions,
    selectedOrgId ? { orgId: selectedOrgId } : "skip"
  );
  const summary = useQuery(
    api.transactions.getTransactionSummary,
    selectedOrgId ? { orgId: selectedOrgId } : "skip"
  );
  const products = useQuery(
    api.products.getProducts,
    selectedOrgId ? { orgId: selectedOrgId } : "skip"
  );
  const orders = useQuery(
    api.orders.getOrders,
    selectedOrgId ? { orgId: selectedOrgId } : "skip"
  );
  const createTx = useMutation(api.transactions.createTransaction);
  const createProduct = useMutation(api.products.createProduct);

  const incomeTypes = ["income", "order_payment"];
  const isProviderExpense = !isAdding && newTx.source === "proveedor";

  const handleCreate = async () => {
    if (!selectedOrgId || !newTx.description || newTx.amount <= 0) return;

    let productId: Id<"products"> | undefined;
    if (isProviderExpense && createProductInline && newProduct.name.trim()) {
      const id = await createProduct({
        orgId: selectedOrgId,
        name: newProduct.name.trim(),
        price: newProduct.price,
      });
      productId = id;
    } else if (isProviderExpense && newTx.productId) {
      productId = newTx.productId;
    }

    try {
      await createTx({
        orgId: selectedOrgId,
        type: isAdding ? "income" : "expense",
        amount: newTx.amount,
        description: newTx.description,
        source: newTx.source,
        productId: productId || (newTx.productId || undefined),
        orderId: newTx.orderId || undefined,
      });
      setShowModal(false);
      resetForm();
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setNewTx({ amount: 0, description: "", source: isAdding ? "venta" : "proveedor", productId: "", orderId: "" });
    setNewProduct({ name: "", price: 0 });
    setCreateProductInline(false);
  };

  const openAddModal = () => {
    setIsAdding(true);
    setNewTx({ amount: 0, description: "", source: "venta", productId: "", orderId: "" });
    setCreateProductInline(false);
    setShowModal(true);
  };

  const openPullModal = () => {
    setIsAdding(false);
    setNewTx({ amount: 0, description: "", source: "proveedor", productId: "", orderId: "" });
    setCreateProductInline(false);
    setShowModal(true);
  };

  if (!selectedOrgId) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
          <BanknotesIcon className="w-16 h-16 text-secondary-text mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-primary-text mb-2">
            No Organization Selected
          </h3>
          <p className="text-secondary-text">
            Select an organization to manage ingresos y salidas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-primary-text tracking-tight">
          Ingresos y Salidas
        </h1>
        <p className="text-secondary-text mt-1">
          Total en caja y movimientos (S/)
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-sm text-secondary-text uppercase tracking-wider mb-2">
          Total disponible
        </p>
        <p
          className={`text-4xl font-bold ${
            (summary?.balance ?? 0) >= 0 ? "text-success" : "text-red-500"
          }`}
        >
          {summary ? formatCurrency(summary.balance) : "—"}
        </p>
        <div className="flex justify-center gap-6 mt-4">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-2.5 bg-success text-white rounded-full hover:bg-success/90 font-medium"
          >
            <ArrowTrendingUpIcon className="w-5 h-5" />
            Ingresar dinero
          </button>
          <button
            onClick={openPullModal}
            className="flex items-center gap-2 px-6 py-2.5 bg-warning text-white rounded-full hover:bg-warning/90 font-medium"
          >
            <ArrowTrendingDownIcon className="w-5 h-5" />
            Sacar dinero
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-primary-text">Historial</h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {(transactions?.length ?? 0) === 0 ? (
            <div className="py-12 text-center text-secondary-text">
              No hay movimientos. Ingresa o saca dinero para empezar.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions?.map((tx) => {
                const isIncome = incomeTypes.includes(tx.type);
                const sourceLabel = tx.source || tx.type;
                return (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-hover/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isIncome ? "bg-success/10" : "bg-warning/10"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowTrendingUpIcon className="w-5 h-5 text-success" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-5 h-5 text-warning" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-primary-text">
                          {tx.description}
                        </p>
                        <p className="text-xs text-secondary-text">
                          {sourceLabel}
                          {tx.orderId && " • Orden"}
                          {tx.productId && " • Producto"}
                          {" • "}
                          {new Date(tx.date).toLocaleDateString("es-PE")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${
                        isIncome ? "text-success" : "text-warning"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary-text">
                {isAdding ? "Ingresar dinero" : "Sacar dinero"}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-hover rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">
                  Origen / Destino
                </label>
                <select
                  value={newTx.source}
                  onChange={(e) => {
                    setNewTx((p) => ({ ...p, source: e.target.value, productId: "", orderId: "" }));
                    setCreateProductInline(false);
                  }}
                  className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text"
                >
                  {(isAdding ? INCOME_SOURCES : EXPENSE_SOURCES).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {isAdding && newTx.source === "orden" && orders && orders.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Vincular a orden (opcional)
                  </label>
                  <select
                    value={newTx.orderId}
                    onChange={(e) => {
                      const id = e.target.value as Id<"orders"> | "";
                      const order = orders.find((o) => o._id === id);
                      setNewTx((p) => ({
                        ...p,
                        orderId: id,
                        amount: order ? order.total : p.amount,
                        description: order ? `Pago orden - ${order.customerName}` : p.description,
                      }));
                    }}
                    className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text"
                  >
                    <option value="">Ninguna</option>
                    {orders
                      .filter((o) => o.status !== "cancelled")
                      .map((o) => (
                        <option key={o._id} value={o._id}>
                          {o.customerName} - {formatCurrency(o.total)}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {isProviderExpense && (
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Producto gastado (opcional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <select
                      value={createProductInline ? "__new__" : (newTx.productId || "")}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "__new__") {
                          setCreateProductInline(true);
                          setNewTx((p) => ({ ...p, productId: "" }));
                        } else {
                          setCreateProductInline(false);
                          setNewTx((p) => ({ ...p, productId: v as Id<"products"> }));
                        }
                      }}
                      className="flex-1 bg-main border border-border rounded-lg px-4 py-2 text-primary-text"
                    >
                      <option value="">Ninguno</option>
                      {products?.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({formatCurrency(p.price)})
                        </option>
                      ))}
                      <option value="__new__">+ Crear nuevo producto</option>
                    </select>
                  </div>
                  {createProductInline && (
                    <div className="flex gap-2 p-3 bg-main rounded-lg border border-border">
                      <input
                        value={newProduct.name}
                        onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Nombre producto"
                        className="flex-1 bg-card border border-border rounded px-3 py-2 text-sm text-primary-text"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.price || ""}
                        onChange={(e) => setNewProduct((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                        placeholder="Precio"
                        className="w-24 bg-card border border-border rounded px-3 py-2 text-sm text-primary-text"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">
                  Monto (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newTx.amount || ""}
                  onChange={(e) =>
                    setNewTx((p) => ({
                      ...p,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={newTx.description}
                  onChange={(e) =>
                    setNewTx((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text"
                  placeholder="Ej: Pago cliente Juan, Compra materiales"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-hover text-primary-text"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newTx.description || newTx.amount <= 0}
                  className="flex-1 px-4 py-2 bg-primary-text text-white rounded-lg hover:bg-text-hover font-medium disabled:opacity-50"
                >
                  {isAdding ? "Ingresar" : "Sacar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
