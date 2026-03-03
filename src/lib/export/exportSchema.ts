export type ExportDateRange = {
  from?: string;
  to?: string;
};

export interface ExportOrderRow {
  orderId: string;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  fulfilledAt: string | null;
}

export interface ExportProductRow {
  productId: string;
  name: string;
  category: string;
  unitPrice: number;
  stock: number;
  stockValue: number;
  providerName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExportClientRow {
  clientId: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  createdAt: string;
}

export interface ExportIncomeRow {
  incomeId: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  linkedOrderId: string | null;
  linkedClientName: string | null;
  paymentMethod: string;
  notes: string | null;
}

export interface ExportOutputRow {
  outputId: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  vendorName: string | null;
  paymentMethod: string;
  notes: string | null;
}

export type ExportSummaryInput = {
  orgName: string;
  exportedAt: string;
  includedBlocks: string[];
  orders: ExportOrderRow[];
  products: ExportProductRow[];
  clients: ExportClientRow[];
  incomes: ExportIncomeRow[];
  outputs: ExportOutputRow[];
};
