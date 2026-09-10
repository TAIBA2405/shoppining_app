// One-time seed: products + coupons from the existing JSON data files,
// plus the default admin account. Idempotent — safe to run twice.
// Usage:  DATABASE_URL=... npm run seed
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import { pool, initDb } from './db.js'
import { ensureAdmin } from './ensure-admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))

await initDb()

// ── Products ──
const productsPath = path.join(__dirname, '../../admin/src/data/products.json')
const { products } = readJson(productsPath)
let productCount = 0
for (const p of products) {
  await pool.query(
    `INSERT INTO products
      (id, name, description, price, original_price, discount, category, subcategory,
       sizes, colors, images, in_stock, is_featured, is_new, tags, rating, review_count)
     VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12,$13,$14,$15::jsonb,$16,$17)
     ON CONFLICT (id) DO NOTHING`,
    [
      p.id, p.name, p.description || '', Number(p.price),
      p.originalPrice != null ? Number(p.originalPrice) : Number(p.price),
      Number(p.discount || 0), p.category, p.subcategory || '',
      JSON.stringify(p.sizes || []), JSON.stringify(p.colors || []),
      JSON.stringify(p.images || []),
      p.inStock !== false, !!p.isFeatured, !!p.isNew,
      JSON.stringify(p.tags || []), Number(p.rating || 0), Number(p.reviewCount || 0)
    ]
  )
  productCount++
}

// ── Coupons ──
const couponsPath = path.join(__dirname, '../../admin/src/data/coupons.json')
const { coupons } = readJson(couponsPath)
let couponCount = 0
for (const [i, c] of coupons.entries()) {
  await pool.query(
    `INSERT INTO coupons
      (id, code, description, discount_type, discount_value, min_order, max_discount, valid_till, category, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (code) DO NOTHING`,
    [
      `coupon-${i + 1}`, c.code.toUpperCase().trim(), c.description || '',
      c.discountType || 'percentage', Number(c.discountValue || 0),
      Number(c.minOrder || 0), Number(c.maxDiscount || 0),
      c.validTill || '2026-12-31', c.category || null, c.isActive !== false
    ]
  )
  couponCount++
}

// ── Admin account (admin@styleverse.com / admin123) ──
await ensureAdmin().catch((e) => console.warn('admin seed skipped:', e.message))

console.log(`✅ seeded ${productCount} products, ${couponCount} coupons`)
await pool.end()
process.exit(0)
