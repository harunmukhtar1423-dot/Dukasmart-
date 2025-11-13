import { supabase } from '../supabaseClient';
import { Product, Customer, Supplier, Sale, DebtRecord, TodoItem, Store } from '../types';

// ===================================
// STORES
// ===================================
export const supabaseStores = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (store: Partial<Store>) => {
    const { data, error } = await supabase
      .from('stores')
      .insert([store])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Store>) => {
    const { data, error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ===================================
// PRODUCTS
// ===================================
export const supabaseProducts = {
  getAll: async (storeId?: string) => {
    let query = supabase.from('products').select('*');

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (product: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  getLowStock: async (storeId?: string) => {
    let query = supabase.from('products').select('*');

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data, error } = await query
      .lte('quantity', supabase.rpc('reorder_level'))
      .order('quantity', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Subscribe to real-time product changes
  subscribe: (storeId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`products:${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `store_id=eq.${storeId}`,
        },
        callback
      )
      .subscribe();
  },
};

// ===================================
// CUSTOMERS
// ===================================
export const supabaseCustomers = {
  getAll: async (storeId?: string) => {
    let query = supabase.from('customers').select('*');

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (customer: Partial<Customer>) => {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Customer>) => {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  subscribe: (storeId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`customers:${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `store_id=eq.${storeId}`,
        },
        callback
      )
      .subscribe();
  },
};

// ===================================
// SUPPLIERS
// ===================================
export const supabaseSuppliers = {
  getAll: async (storeId?: string) => {
    let query = supabase.from('suppliers').select('*');

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (supplier: Partial<Supplier>) => {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplier])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Supplier>) => {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  subscribe: (storeId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`suppliers:${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suppliers',
          filter: `store_id=eq.${storeId}`,
        },
        callback
      )
      .subscribe();
  },
};

// ===================================
// SALES
// ===================================
export const supabaseSales = {
  getAll: async (storeId?: string) => {
    let query = supabase.from('sales').select('*, customers(name)');

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('sales')
      .select('*, customers(name, phone)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (sale: Partial<Sale>) => {
    const { data, error } = await supabase
      .from('sales')
      .insert([sale])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Sale>) => {
    const { data, error } = await supabase
      .from('sales')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  getTodaysSales: async (storeId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('store_id', storeId)
      .gte('created_at', today.toISOString());

    if (error) throw error;
    return data;
  },

  subscribe: (storeId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`sales:${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales',
          filter: `store_id=eq.${storeId}`,
        },
        callback
      )
      .subscribe();
  },
};

// ===================================
// DEBT RECORDS
// ===================================
export const supabaseDebts = {
  getAll: async (storeId?: string) => {
    let query = supabase.from('debt_records').select('*, customers(name, phone)');

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getActive: async (storeId: string) => {
    const { data, error } = await supabase
      .from('debt_records')
      .select('*, customers(name, phone)')
      .eq('store_id', storeId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  create: async (debt: Partial<DebtRecord>) => {
    const { data, error } = await supabase
      .from('debt_records')
      .insert([debt])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<DebtRecord>) => {
    const { data, error } = await supabase
      .from('debt_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  recordPayment: async (debtId: string, amount: number, paymentMethod: string) => {
    // Get current debt
    const { data: debt, error: debtError } = await supabase
      .from('debt_records')
      .select('*')
      .eq('id', debtId)
      .single();

    if (debtError) throw debtError;

    // Create payment record
    const { error: paymentError } = await supabase
      .from('debt_payments')
      .insert([{
        debt_record_id: debtId,
        amount,
        payment_method: paymentMethod,
      }]);

    if (paymentError) throw paymentError;

    // Update debt record
    const newAmountPaid = debt.amount_paid + amount;
    const newAmountRemaining = debt.amount_remaining - amount;
    const newStatus = newAmountRemaining <= 0 ? 'paid' : 'active';

    const { data, error } = await supabase
      .from('debt_records')
      .update({
        amount_paid: newAmountPaid,
        amount_remaining: newAmountRemaining,
        status: newStatus,
      })
      .eq('id', debtId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  subscribe: (storeId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`debt_records:${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'debt_records',
          filter: `store_id=eq.${storeId}`,
        },
        callback
      )
      .subscribe();
  },
};

// ===================================
// TODO ITEMS
// ===================================
export const supabaseTodos = {
  getAll: async (storeId?: string) => {
    let query = supabase.from('todo_items').select('*');

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (todo: Partial<TodoItem>) => {
    const { data, error } = await supabase
      .from('todo_items')
      .insert([todo])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<TodoItem>) => {
    const { data, error } = await supabase
      .from('todo_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('todo_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  subscribe: (storeId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`todo_items:${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todo_items',
          filter: `store_id=eq.${storeId}`,
        },
        callback
      )
      .subscribe();
  },
};

// ===================================
// ANALYTICS
// ===================================
export const supabaseAnalytics = {
  getDashboardStats: async (storeId: string) => {
    const [salesData, productsData, customersData, debtsData] = await Promise.all([
      supabase.from('sales').select('total').eq('store_id', storeId),
      supabase.from('products').select('quantity, reorder_level').eq('store_id', storeId),
      supabase.from('customers').select('id').eq('store_id', storeId),
      supabase.from('debt_records').select('amount_remaining').eq('store_id', storeId).eq('status', 'active'),
    ]);

    const totalRevenue = salesData.data?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;
    const lowStockCount = productsData.data?.filter(p => p.quantity <= p.reorder_level).length || 0;
    const totalDebt = debtsData.data?.reduce((sum, debt) => sum + Number(debt.amount_remaining), 0) || 0;

    return {
      totalSales: salesData.data?.length || 0,
      totalRevenue,
      totalProducts: productsData.data?.length || 0,
      lowStockCount,
      totalCustomers: customersData.data?.length || 0,
      totalDebt,
    };
  },
};

// Export all services
export const supabaseService = {
  stores: supabaseStores,
  products: supabaseProducts,
  customers: supabaseCustomers,
  suppliers: supabaseSuppliers,
  sales: supabaseSales,
  debts: supabaseDebts,
  todos: supabaseTodos,
  analytics: supabaseAnalytics,
};

export default supabaseService;
