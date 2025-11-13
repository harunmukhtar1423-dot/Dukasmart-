# Dukasmart Supabase Setup Guide

## 📋 Table of Contents
1. [Setting up the Database Schema](#1-setting-up-the-database-schema)
2. [Verifying the Connection](#2-verifying-the-connection)
3. [Using Supabase in Your App](#3-using-supabase-in-your-app)
4. [Real-time Subscriptions](#4-real-time-subscriptions)
5. [Migration from SQLite](#5-migration-from-sqlite)

---

## 1. Setting up the Database Schema

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase dashboard: https://bwrmrbegjiunfitaemvz.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Schema SQL

1. Open the file `supabase-schema.sql` in this project
2. Copy **all** the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl/Cmd + Enter)

You should see: ✅ **"Success. No rows returned"** and a notice saying **"Dukasmart database schema created successfully! 🎉"**

### Step 3: Verify Tables Created

1. Go to **Table Editor** in the left sidebar
2. You should see all these tables:
   - ✅ stores
   - ✅ products
   - ✅ customers
   - ✅ suppliers
   - ✅ sales
   - ✅ debt_records
   - ✅ debt_payments
   - ✅ todo_items

---

## 2. Verifying the Connection

The app automatically tests the Supabase connection when it starts. Check the console logs:

```
🔄 Testing Supabase connection...
✅ Supabase connected successfully!
✅ Supabase is connected and ready!
```

If you see an error, check:
- ✅ Your Supabase URL is correct
- ✅ Your anon key is correct
- ✅ The tables exist in Supabase
- ✅ RLS policies allow access

---

## 3. Using Supabase in Your App

### Basic Usage

```typescript
import supabaseService from './src/services/supabaseService';

// Get all products
const products = await supabaseService.products.getAll(storeId);

// Add a product
const newProduct = await supabaseService.products.create({
  name: 'New Product',
  selling_price: 29.99,
  quantity: 100,
  store_id: currentStoreId,
});

// Update a product
await supabaseService.products.update(productId, {
  quantity: 50,
});

// Delete a product
await supabaseService.products.delete(productId);
```

### Available Services

All services follow the same pattern:

- `supabaseService.products.*`
- `supabaseService.customers.*`
- `supabaseService.suppliers.*`
- `supabaseService.sales.*`
- `supabaseService.debts.*`
- `supabaseService.todos.*`
- `supabaseService.stores.*`
- `supabaseService.analytics.*`

---

## 4. Real-time Subscriptions

### Enable Real-time Updates

Each service has a `subscribe()` method for real-time updates:

```typescript
import supabaseService from './src/services/supabaseService';

// Subscribe to product changes
const subscription = supabaseService.products.subscribe(
  currentStoreId,
  (payload) => {
    console.log('Product changed:', payload);

    // Refresh your products list
    if (payload.eventType === 'INSERT') {
      // New product added
    } else if (payload.eventType === 'UPDATE') {
      // Product updated
    } else if (payload.eventType === 'DELETE') {
      // Product deleted
    }
  }
);

// Don't forget to unsubscribe when component unmounts
useEffect(() => {
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Example: Real-time Product List

```typescript
import React, { useEffect, useState } from 'react';
import supabaseService from '../services/supabaseService';

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const currentStoreId = 'your-store-id';

  useEffect(() => {
    // Load initial products
    loadProducts();

    // Subscribe to changes
    const subscription = supabaseService.products.subscribe(
      currentStoreId,
      (payload) => {
        console.log('Change detected:', payload);
        loadProducts(); // Reload the list
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [currentStoreId]);

  const loadProducts = async () => {
    try {
      const data = await supabaseService.products.getAll(currentStoreId);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // ... rest of your component
}
```

---

## 5. Migration from SQLite

### Strategy: Hybrid Approach (Recommended)

Use **both** SQLite (offline) and Supabase (cloud sync):

1. **Write operations**: Save to both SQLite AND Supabase
2. **Read operations**: Read from SQLite (faster)
3. **Sync**: Periodically sync from Supabase to SQLite

### Example: Hybrid Product Service

```typescript
import supabaseService from './src/services/supabaseService';
import db from './src/services/database';

export const hybridProducts = {
  // Create product - save to both
  create: async (product) => {
    try {
      // Save to Supabase first
      const cloudProduct = await supabaseService.products.create(product);

      // Then save to local SQLite
      await db.runAsync(
        `INSERT INTO products (...) VALUES (...)`,
        [cloudProduct.id, ...]
      );

      return cloudProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      // Fallback to SQLite only if Supabase fails
      await db.runAsync(...);
    }
  },

  // Read from SQLite (fast)
  getAll: async () => {
    return await db.getAllAsync('SELECT * FROM products');
  },

  // Sync from Supabase to SQLite
  sync: async (storeId) => {
    const cloudProducts = await supabaseService.products.getAll(storeId);

    // Clear local and re-insert
    await db.runAsync('DELETE FROM products');
    for (const product of cloudProducts) {
      await db.runAsync(
        `INSERT INTO products (...) VALUES (...)`,
        [product.id, ...]
      );
    }
  },
};
```

---

## 🎯 Quick Start Checklist

- [ ] Run `supabase-schema.sql` in Supabase SQL Editor
- [ ] Verify all tables are created
- [ ] Check app console for connection success message
- [ ] Test creating a product using Supabase
- [ ] Set up real-time subscriptions (optional)
- [ ] Implement hybrid SQLite + Supabase strategy

---

## 🔒 Security Notes

### Row Level Security (RLS)

The schema currently allows all access. For production, update RLS policies:

```sql
-- Example: Only allow users to see their own store's data
CREATE POLICY "Users see own store products" ON products
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );
```

### API Keys

- ✅ **anon key** - Safe to use in client apps (current setup)
- ⚠️ **service_role key** - NEVER expose to clients, only use server-side

---

## 🆘 Troubleshooting

### Error: "relation does not exist"
➡️ Run the schema SQL again in Supabase

### Error: "new row violates row-level security policy"
➡️ Check your RLS policies allow the operation

### Error: "duplicate key value"
➡️ Trying to insert with an existing ID, let Supabase auto-generate IDs

### Subscription not working
➡️ Enable Realtime in Supabase: Database → Replication → Enable for tables

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)

---

**🎉 You're all set! Your Dukasmart app is now cloud-enabled with Supabase!**
