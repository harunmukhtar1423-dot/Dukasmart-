import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('dukasmart.db');

export const initDatabase = async () => {
  try {
    // Create Stores table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS stores (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        email TEXT,
        logo TEXT,
        currency TEXT DEFAULT 'USD',
        ownerId TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );
    `);

    // Create Products table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT,
        category TEXT,
        description TEXT,
        costPrice REAL,
        sellingPrice REAL,
        quantity INTEGER,
        reorderLevel INTEGER,
        supplierId TEXT,
        storeId TEXT,
        barcode TEXT,
        image TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY (storeId) REFERENCES stores(id)
      );
    `);

    // Create Customers table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        totalDebt REAL DEFAULT 0,
        totalPurchases REAL DEFAULT 0,
        storeId TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY (storeId) REFERENCES stores(id)
      );
    `);

    // Create Suppliers table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        company TEXT,
        storeId TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY (storeId) REFERENCES stores(id)
      );
    `);

    // Create Sales table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        customerId TEXT,
        storeId TEXT,
        items TEXT NOT NULL,
        subtotal REAL,
        tax REAL,
        discount REAL,
        total REAL,
        paymentMethod TEXT,
        paymentStatus TEXT,
        amountPaid REAL,
        amountDue REAL,
        notes TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY (storeId) REFERENCES stores(id),
        FOREIGN KEY (customerId) REFERENCES customers(id)
      );
    `);

    // Create Debt Records table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS debt_records (
        id TEXT PRIMARY KEY,
        customerId TEXT NOT NULL,
        saleId TEXT,
        storeId TEXT,
        amount REAL,
        amountPaid REAL DEFAULT 0,
        amountRemaining REAL,
        status TEXT,
        dueDate TEXT,
        notes TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY (customerId) REFERENCES customers(id),
        FOREIGN KEY (storeId) REFERENCES stores(id)
      );
    `);

    // Create Debt Payments table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS debt_payments (
        id TEXT PRIMARY KEY,
        debtRecordId TEXT NOT NULL,
        amount REAL,
        paymentMethod TEXT,
        notes TEXT,
        createdAt TEXT,
        FOREIGN KEY (debtRecordId) REFERENCES debt_records(id)
      );
    `);

    // Create Todo Items table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS todo_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        priority TEXT,
        dueDate TEXT,
        storeId TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY (storeId) REFERENCES stores(id)
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export default db;
