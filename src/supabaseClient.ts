import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://bwrmrbegjiunfitaemvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cm1yYmVnaml1bmZpdGFlbXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjcyMDQsImV4cCI6MjA3ODYwMzIwNH0.M02h2En7L0sAFGNYLPsQNQJmMPvJWz6Z0h96_nJbK74';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test function to fetch products from Supabase
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error };
    }

    console.log('✅ Supabase connected successfully!');
    console.log('Products fetched:', data?.length || 0);
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

// Helper functions for common Supabase operations

// Fetch all products
export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Add a new product
export const addProduct = async (product: any) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select();

  if (error) throw error;
  return data;
};

// Update a product
export const updateProduct = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

// Delete a product
export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Fetch all customers
export const fetchCustomers = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Fetch all sales
export const fetchSales = async () => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export default supabase;
