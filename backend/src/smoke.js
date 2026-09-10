// Offline smoke test — verifies API route wiring + row mapping
// WITHOUT needing a real DATABASE_URL.
// Usage: node src/smoke.js
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://u:p@localhost:5432/smoke'

const { toProduct, toCoupon, toOrder, toUser } = await import('./rows.js')

let failures = 0
const check = (name, cond) => {
  console.log(`${cond ? '✅' : '❌'} ${name}`)
  if (!cond) failures++
}

// ── Row mapping matches the old Firestore shape ──
const p = toProduct({
  id: 'm001', name: 'Shirt', description: 'd', price: '1299',
  original_price: '2499', discount: 48, category: 'men', subcategory: 'shirts',
  sizes: ['S', 'M'], colors: [{ name: 'White', hex: '#fff' }],
  images: ['http://x/y.jpg'], in_stock: true, is_featured: true, is_new: false,
  tags: ['bestseller'], rating: '4.5', review_count: 10, created_at: '2026-01-01'
})
check('product keeps camelCase (originalPrice, reviewCount, inStock)', (
  p.originalPrice === 2499 && p.reviewCount === 10 && p.inStock === true &&
  p.isFeatured === true && Array.isArray(p.sizes) && p.colors[0].hex === '#fff'
))

const o = toOrder({
  id: 'ORD123', user_id: 'u1', user_name: 'A', user_email: 'a@b.c',
  items: [{ id: 'm001', quantity: 1 }], address: { city: 'Mumbai' },
  payment_method: 'cod', utr_number: null, subtotal: '1299', shipping: '0',
  coupon: null, coupon_discount: 0, total: '1299', status: 'confirmed',
  status_history: [{ status: 'placed', date: 'x' }], estimated_delivery: null,
  created_at: '2026-01-01'
})
check('order keeps camelCase (userId, paymentMethod, statusHistory)', (
  o.userId === 'u1' && o.paymentMethod === 'cod' && o.statusHistory.length === 1 &&
  o.address.city === 'Mumbai'
))

const c = toCoupon({
  id: 'coupon-1', code: 'WELCOME10', description: 'd', discount_type: 'percentage',
  discount_value: '10', min_order: '999', max_discount: '500',
  valid_till: '2026-12-31', category: null, is_active: true
})
check('coupon keeps camelCase (discountType, minOrder, isActive)', (
  c.discountType === 'percentage' && c.minOrder === 999 && c.isActive === true
))

const u = toUser({
  id: 'u1', name: 'Admin', email: 'a@b.c', phone: '9',
  is_admin: true, addresses: [], created_at: '2026-01-01'
})
check('user exposes uid alias + isAdmin', u.uid === 'u1' && u.isAdmin === true)

// ── Every frontend/admin call has a matching backend route ──
const src = (await import('fs')).readFileSync(new URL('./index.js', import.meta.url), 'utf8')
const routes = [
  ['POST', '/api/auth/signup'], ['POST', '/api/auth/login'],
  ['GET', '/api/auth/me'], ['PATCH', '/api/auth/me'],
  ['GET', '/api/products'], ['GET', '/api/products/:id'],
  ['POST', '/api/products'], ['PUT', '/api/products/:id'],
  ['DELETE', '/api/products/:id'], ['PATCH', '/api/products/:id/stock'],
  ['GET', '/api/coupons'], ['POST', '/api/coupons'],
  ['PATCH', '/api/coupons/:id'], ['DELETE', '/api/coupons/:id'],
  ['POST', '/api/orders'], ['GET', '/api/orders'],
  ['GET', '/api/orders/mine'], ['GET', '/api/orders/:id'],
  ['PATCH', '/api/orders/:id/status'], ['DELETE', '/api/orders/:id'],
  ['GET', '/api/users'], ['DELETE', '/api/users/:id'],
  ['POST', '/api/admin/seed'], ['GET', '/api/health']
]
for (const [method, path] of routes) {
  const verb = `app.${method.toLowerCase()}('${path}'`
  check(`${method} ${path}`, src.includes(verb))
}

console.log(failures ? `\n❌ ${failures} check(s) failed` : '\n✅ all smoke checks passed')
process.exit(failures ? 1 : 0)
