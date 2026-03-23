"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useOrganization } from "../../../../_components/providers/organization-provider";
import { formatCurrency } from "../../../../../lib/currency";
import {
  PlusIcon,
  CubeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function ProductsPage() {
  const { selectedOrgId } = useOrganization();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    sku: "",
    stock: 0,
    unit: "unit",
  });

  const products = useQuery(
    api.products.getProducts,
    selectedOrgId ? { orgId: selectedOrgId } : "skip"
  );
  const createProduct = useMutation(api.products.createProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);

  const filtered =
    products?.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: 0,
      sku: "",
      stock: 0,
      unit: "unit",
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleSave = async () => {
    if (!selectedOrgId || !form.name || form.price < 0) return;
    try {
      if (editingId) {
        await updateProduct({
          productId: editingId,
          name: form.name,
          description: form.description || undefined,
          price: form.price,
          sku: form.sku || undefined,
          stock: form.stock,
          unit: form.unit,
        });
      } else {
        await createProduct({
          orgId: selectedOrgId,
          name: form.name,
          description: form.description || undefined,
          price: form.price,
          sku: form.sku || undefined,
          stock: form.stock,
          unit: form.unit,
        });
      }
      resetForm();
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (p: NonNullable<typeof products>[number]) => {
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      sku: p.sku ?? "",
      stock: p.stock ?? 0,
      unit: p.unit ?? "unit",
    });
    setEditingId(p._id);
    setShowModal(true);
  };

  if (!selectedOrgId) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
          <CubeIcon className="w-16 h-16 text-secondary-text mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-primary-text mb-2">
            No Organization Selected
          </h3>
          <p className="text-secondary-text">
            Select an organization to manage products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-text tracking-tight">
            Productos
          </h1>
          <p className="text-secondary-text mt-1">
            Gestiona tu catálogo de productos (precios en S/)
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary-text text-main px-6 py-2.5 rounded-full hover:bg-text-hover transition-all font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo producto
        </button>
      </div>

      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-main border border-border rounded-lg pl-10 pr-4 py-2 text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product) => (
          <div
            key={product._id}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-custom transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="w-12 h-12 rounded-lg bg-accent-color/10 flex items-center justify-center">
                <CubeIcon className="w-6 h-6 text-accent-color" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(product)}
                  className="p-1.5 hover:bg-hover rounded-lg text-secondary-text hover:text-primary-text"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("¿Eliminar este producto?"))
                      deleteProduct({ productId: product._id });
                  }}
                  className="p-1.5 hover:bg-red-500/10 rounded-lg text-secondary-text hover:text-red-500"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-primary-text truncate">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm text-secondary-text mt-1 line-clamp-2">
                {product.description}
              </p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-bold text-primary-text">
                {formatCurrency(product.price)}
              </span>
              {product.stock != null && (
                <span className="text-sm text-secondary-text">
                  Stock: {product.stock} {product.unit ?? "u"}
                </span>
              )}
            </div>
            {product.sku && (
              <p className="text-xs text-secondary-text mt-2">SKU: {product.sku}</p>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
          <CubeIcon className="w-12 h-12 text-secondary-text mx-auto mb-3 opacity-50" />
          <p className="text-secondary-text">No hay productos</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 text-accent-color hover:underline text-sm"
          >
            Agregar primer producto
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary-text">
                {editingId ? "Editar producto" : "Nuevo producto"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-hover rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">
                  Nombre *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text"
                  placeholder="Ej: Producto A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={2}
                  className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text resize-none"
                  placeholder="Opcional"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Precio (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price || ""}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={form.stock || ""}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        stock: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    SKU
                  </label>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                    className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text"
                    placeholder="Código"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Unidad
                  </label>
                  <select
                    value={form.unit}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, unit: e.target.value }))
                    }
                    className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text"
                  >
                    <option value="unit">Unidad</option>
                    <option value="kg">kg</option>
                    <option value="box">Caja</option>
                    <option value="m">m</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-hover text-primary-text"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.name || form.price < 0}
                  className="flex-1 px-4 py-2 bg-primary-text text-main rounded-lg hover:bg-text-hover font-medium disabled:opacity-50"
                >
                  {editingId ? "Guardar" : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
