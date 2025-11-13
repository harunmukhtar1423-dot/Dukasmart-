import { create } from 'zustand';
import { Product, Customer, Supplier, Store, Sale, DebtRecord, TodoItem, SaleItem } from '../types';
import db from '../services/database';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  currentStore: Store | null;
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  debts: DebtRecord[];
  todos: TodoItem[];
  cart: SaleItem[];

  // Store actions
  setCurrentStore: (store: Store) => void;

  // Product actions
  loadProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Customer actions
  loadCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Supplier actions
  loadSuppliers: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  // Sale actions
  loadSales: () => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;

  // Cart actions
  addToCart: (item: SaleItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Debt actions
  loadDebts: () => Promise<void>;
  addDebt: (debt: Omit<DebtRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;

  // Todo actions
  loadTodos: () => Promise<void>;
  addTodo: (todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTodo: (id: string, todo: Partial<TodoItem>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentStore: null,
  products: [],
  customers: [],
  suppliers: [],
  sales: [],
  debts: [],
  todos: [],
  cart: [],

  setCurrentStore: (store) => set({ currentStore: store }),

  // Product actions
  loadProducts: async () => {
    try {
      const result = await db.getAllAsync<Product>('SELECT * FROM products ORDER BY name');
      set({ products: result });
    } catch (error) {
      console.error('Error loading products:', error);
    }
  },

  addProduct: async (product) => {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO products (id, name, sku, category, description, costPrice, sellingPrice,
         quantity, reorderLevel, supplierId, storeId, barcode, image, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, product.name, product.sku, product.category, product.description || '',
         product.costPrice, product.sellingPrice, product.quantity, product.reorderLevel,
         product.supplierId || '', product.storeId, product.barcode || '', product.image || '', now, now]
      );
      await get().loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  updateProduct: async (id, product) => {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      Object.entries(product).forEach(([key, value]) => {
        if (key !== 'id') {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });

      updates.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(id);

      await db.runAsync(
        `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      await get().loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await db.runAsync('DELETE FROM products WHERE id = ?', [id]);
      await get().loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Customer actions
  loadCustomers: async () => {
    try {
      const result = await db.getAllAsync<Customer>('SELECT * FROM customers ORDER BY name');
      set({ customers: result });
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  },

  addCustomer: async (customer) => {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO customers (id, name, phone, email, address, totalDebt, totalPurchases, storeId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, customer.name, customer.phone, customer.email || '', customer.address || '',
         customer.totalDebt, customer.totalPurchases, customer.storeId, now, now]
      );
      await get().loadCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  },

  updateCustomer: async (id, customer) => {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      Object.entries(customer).forEach(([key, value]) => {
        if (key !== 'id') {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });

      updates.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(id);

      await db.runAsync(
        `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      await get().loadCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    try {
      await db.runAsync('DELETE FROM customers WHERE id = ?', [id]);
      await get().loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Supplier actions
  loadSuppliers: async () => {
    try {
      const result = await db.getAllAsync<Supplier>('SELECT * FROM suppliers ORDER BY name');
      set({ suppliers: result });
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  },

  addSupplier: async (supplier) => {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO suppliers (id, name, phone, email, address, company, storeId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, supplier.name, supplier.phone, supplier.email || '', supplier.address || '',
         supplier.company || '', supplier.storeId, now, now]
      );
      await get().loadSuppliers();
    } catch (error) {
      console.error('Error adding supplier:', error);
      throw error;
    }
  },

  updateSupplier: async (id, supplier) => {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      Object.entries(supplier).forEach(([key, value]) => {
        if (key !== 'id') {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });

      updates.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(id);

      await db.runAsync(
        `UPDATE suppliers SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      await get().loadSuppliers();
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  },

  deleteSupplier: async (id) => {
    try {
      await db.runAsync('DELETE FROM suppliers WHERE id = ?', [id]);
      await get().loadSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  },

  // Sale actions
  loadSales: async () => {
    try {
      const result = await db.getAllAsync<any>('SELECT * FROM sales ORDER BY createdAt DESC');
      const sales = result.map(sale => ({
        ...sale,
        items: JSON.parse(sale.items)
      }));
      set({ sales });
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  },

  addSale: async (sale) => {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO sales (id, customerId, storeId, items, subtotal, tax, discount, total,
         paymentMethod, paymentStatus, amountPaid, amountDue, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, sale.customerId || '', sale.storeId, JSON.stringify(sale.items), sale.subtotal,
         sale.tax, sale.discount, sale.total, sale.paymentMethod, sale.paymentStatus,
         sale.amountPaid, sale.amountDue, sale.notes || '', now, now]
      );

      // Update product quantities
      for (const item of sale.items) {
        await db.runAsync(
          'UPDATE products SET quantity = quantity - ? WHERE id = ?',
          [item.quantity, item.productId]
        );
      }

      // Create debt record if payment is partial or unpaid
      if (sale.paymentStatus !== 'paid' && sale.amountDue > 0 && sale.customerId) {
        await get().addDebt({
          customerId: sale.customerId,
          saleId: id,
          storeId: sale.storeId,
          amount: sale.total,
          amountPaid: sale.amountPaid,
          amountRemaining: sale.amountDue,
          status: 'active'
        });
      }

      await get().loadSales();
      await get().loadProducts();
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  },

  // Cart actions
  addToCart: (item) => {
    const cart = get().cart;
    const existingItem = cart.find(i => i.productId === item.productId);

    if (existingItem) {
      set({
        cart: cart.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity, total: (i.quantity + item.quantity) * i.unitPrice }
            : i
        )
      });
    } else {
      set({ cart: [...cart, item] });
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter(i => i.productId !== productId) });
  },

  updateCartItem: (productId, quantity) => {
    set({
      cart: get().cart.map(i =>
        i.productId === productId
          ? { ...i, quantity, total: quantity * i.unitPrice }
          : i
      )
    });
  },

  clearCart: () => set({ cart: [] }),

  // Debt actions
  loadDebts: async () => {
    try {
      const result = await db.getAllAsync<DebtRecord>('SELECT * FROM debt_records ORDER BY createdAt DESC');
      set({ debts: result });
    } catch (error) {
      console.error('Error loading debts:', error);
    }
  },

  addDebt: async (debt) => {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO debt_records (id, customerId, saleId, storeId, amount, amountPaid,
         amountRemaining, status, dueDate, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, debt.customerId, debt.saleId || '', debt.storeId, debt.amount, debt.amountPaid,
         debt.amountRemaining, debt.status, debt.dueDate || '', debt.notes || '', now, now]
      );

      // Update customer total debt
      await db.runAsync(
        'UPDATE customers SET totalDebt = totalDebt + ? WHERE id = ?',
        [debt.amountRemaining, debt.customerId]
      );

      await get().loadDebts();
      await get().loadCustomers();
    } catch (error) {
      console.error('Error adding debt:', error);
      throw error;
    }
  },

  // Todo actions
  loadTodos: async () => {
    try {
      const result = await db.getAllAsync<any>('SELECT * FROM todo_items ORDER BY createdAt DESC');
      const todos = result.map(todo => ({
        ...todo,
        completed: todo.completed === 1
      }));
      set({ todos });
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  },

  addTodo: async (todo) => {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO todo_items (id, title, description, completed, priority, dueDate, storeId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, todo.title, todo.description || '', 0, todo.priority, todo.dueDate || '', todo.storeId, now, now]
      );
      await get().loadTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
      throw error;
    }
  },

  updateTodo: async (id, todo) => {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      Object.entries(todo).forEach(([key, value]) => {
        if (key !== 'id') {
          if (key === 'completed') {
            updates.push(`${key} = ?`);
            values.push(value ? 1 : 0);
          } else {
            updates.push(`${key} = ?`);
            values.push(value);
          }
        }
      });

      updates.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(id);

      await db.runAsync(
        `UPDATE todo_items SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      await get().loadTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  },

  deleteTodo: async (id) => {
    try {
      await db.runAsync('DELETE FROM todo_items WHERE id = ?', [id]);
      await get().loadTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },
}));
