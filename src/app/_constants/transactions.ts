export const INCOME_SOURCES = [
  { id: "venta", label: "Venta" },
  { id: "orden", label: "Orden" },
  { id: "proveedor", label: "Proveedor / Reembolso" },
  { id: "otro", label: "Otro" },
] as const;

export const EXPENSE_SOURCES = [
  { id: "proveedor", label: "Proveedor" },
  { id: "orden", label: "Orden / Gasto" },
  { id: "inventario", label: "Inventario" },
  { id: "operativo", label: "Gasto operativo" },
  { id: "otro", label: "Otro" },
] as const;
