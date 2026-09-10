// Shared Postgres pool. Uses node-postgres directly (no Prisma)
// so the backend stays tiny and works on Vercel serverless.
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL is not set — API will fail until you add it (.env)')
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon free + Vercel serverless: keep the pool small, require SSL
  max: Number(process.env.PG_POOL_MAX || 5),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false }
})

pool.on('error', (err) => console.error('PG pool error:', err.message))

// ── Schema (idempotent — safe to run on every boot) ─────────────
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      description   TEXT DEFAULT '',
      price         DOUBLE PRECISION NOT NULL,
      original_price DOUBLE PRECISION,
      discount      INTEGER DEFAULT 0,
      category      TEXT NOT NULL,
      subcategory   TEXT DEFAULT '',
      sizes         JSONB DEFAULT '[]',
      colors        JSONB DEFAULT '[]',
      images        JSONB DEFAULT '[]',
      in_stock      BOOLEAN DEFAULT TRUE,
      is_featured   BOOLEAN DEFAULT FALSE,
      is_new        BOOLEAN DEFAULT TRUE,
      tags          JSONB DEFAULT '[]',
      rating        DOUBLE PRECISION DEFAULT 0,
      review_count  INTEGER DEFAULT 0,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS coupons (
      id             TEXT PRIMARY KEY,
      code           TEXT UNIQUE NOT NULL,
      description    TEXT DEFAULT '',
      discount_type  TEXT DEFAULT 'percentage',
      discount_value DOUBLE PRECISION DEFAULT 0,
      min_order      DOUBLE PRECISION DEFAULT 0,
      max_discount   DOUBLE PRECISION DEFAULT 0,
      valid_till     TEXT DEFAULT '',
      category       TEXT,
      is_active      BOOLEAN DEFAULT TRUE
    );
    CREATE TABLE IF NOT EXISTS users (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT UNIQUE NOT NULL,
      phone      TEXT DEFAULT '',
      password   TEXT NOT NULL,
      is_admin   BOOLEAN DEFAULT FALSE,
      addresses  JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id                 TEXT PRIMARY KEY,
      user_id            TEXT DEFAULT 'guest',
      user_name          TEXT DEFAULT 'Guest',
      user_email         TEXT DEFAULT '',
      items              JSONB DEFAULT '[]',
      address            JSONB DEFAULT '{}',
      payment_method     TEXT DEFAULT 'cod',
      utr_number         TEXT,
      subtotal           DOUBLE PRECISION DEFAULT 0,
      shipping           DOUBLE PRECISION DEFAULT 0,
      coupon             TEXT,
      coupon_discount    DOUBLE PRECISION DEFAULT 0,
      total              DOUBLE PRECISION DEFAULT 0,
      status             TEXT DEFAULT 'placed',
      status_history     JSONB DEFAULT '[]',
      estimated_delivery TIMESTAMPTZ,
      created_at         TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  `)
  console.log('✅ tables ready')
}
