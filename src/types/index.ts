// Core Data Types

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  reorderLevel: number;
  supplierId?: string;
  storeId: string;
  barcode?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalDebt: number;
  totalPurchases: number;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  company?: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  logo?: string;
  currency: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  storeId: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'credit';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  amountPaid: number;
  amountDue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DebtRecord {
  id: string;
  customerId: string;
  saleId?: string;
  storeId: string;
  amount: number;
  amountPaid: number;
  amountRemaining: number;
  status: 'active' | 'paid' | 'overdue';
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebtPayment {
  id: string;
  debtRecordId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  notes?: string;
  createdAt: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  totalDebt: number;
  lowStockItems: number;
  totalCustomers: number;
  todaySales: number;
  todayRevenue: number;
  monthSales: number;
  monthRevenue: number;
}

export interface SalesData {
  date: string;
  sales: number;
  revenue: number;
}

// Navigation Types
export type RootStackParamList = {
  Tabs: undefined;
  ProductDetails: { productId: string };
  CustomerDetails: { customerId: string };
  SupplierDetails: { supplierId: string };
  AddEditProduct: { productId?: string };
  AddEditCustomer: { customerId?: string };
  AddEditSupplier: { supplierId?: string };
  DebtDetails: { debtId: string };
  SaleReceipt: { saleId: string };
};

export type TabParamList = {
  Dashboard: undefined;
  POS: undefined;
  Inventory: undefined;
  Customers: undefined;
  More: undefined;
};
