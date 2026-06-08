import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.sqlite');

// Open SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

// Wrap sqlite3 methods in Promises for async/await usage
export const query = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// Database Initialization & Migrations
async function initializeDatabase() {
  try {
    // 1. Create settings table
    await query.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    // 2. Create invoices table
    await query.run(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT UNIQUE NOT NULL,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        billing_address TEXT NOT NULL,
        order_type TEXT NOT NULL,
        invoice_date TEXT NOT NULL,
        items TEXT NOT NULL, -- JSON serialized array
        discount_percent REAL DEFAULT 0,
        subtotal REAL NOT NULL,
        discount_amount REAL NOT NULL,
        total REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables verified/created successfully.');

    // Migration: Add missing columns if they do not exist
    try {
      await query.run('ALTER TABLE invoices ADD COLUMN order_date TEXT');
      console.log('Migrated: Added order_date column to invoices.');
    } catch (err) {
      // Ignore if column already exists
    }

    try {
      await query.run("ALTER TABLE invoices ADD COLUMN bank_choice TEXT DEFAULT 'axis'");
      console.log('Migrated: Added bank_choice column to invoices.');
    } catch (err) {
      // Ignore if column already exists
    }

    // 3. Seed default settings if empty
    const rowCount = await query.get('SELECT COUNT(*) as count FROM settings');
    if (rowCount.count === 0) {
      console.log('Seeding default settings...');
      const defaultSettings = [
        ['company_name', 'DOUM TECHNOLOGIES & INNOVATIONS PRIVATE LIMITED'],
        ['company_address', '32, CHOWRINGHEE ROAD, OM TOWER, 7TH FLOOR, UNIT NO- 706, PARK STREET KOLKATA-700071'],
        ['registered_office', 'DOUM Technologies & Innovations Private Limited , 2, CHOWRINGHEE ROAD, OM TOWER, 7TH FLOOR, UNIT NO- 706, PARK STREET KOLKATA-700071'],
        ['company_cin', 'U63122WB2025PTC279262'],
        ['company_phone', '+91 8910973623'],
        ['company_email', 'info@doum.in'],
        ['company_website', 'www.doum.in'],
        ['bank_name', 'Axis Bank'],
        ['bank_branch', 'Metropolitan Branch'],
        ['bank_acc_no', '925020025783209'],
        ['bank_ifsc', 'UTIB0002783'],
        ['bank_payee_name', 'DOUM & TECHNOLOGIES INNOVATIONS PVT. LTD.'],
        ['upi_id', ''],
        ['upi_confirmed', 'false'],
        ['invoice_prefix', 'FBF602500'],
        ['order_prefix', 'OD333819548761'],
        ['next_order_val', '4'],
        ['next_invoice_val', '4']
      ];

      for (const [key, val] of defaultSettings) {
        await query.run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, val]);
      }
      console.log('Default settings seeded successfully.');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

export default db;
