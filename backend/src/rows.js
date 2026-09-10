// Convert snake_case Postgres rows → camelCase objects
// matching the old Firestore shape, so the frontend code
// barely has to change.
const j = (v, fallback) => {
  if (v == null) return fallback
  if (typeof v === 'string') {
    try { return JSON.parse(v) } catch { return fallback }
  }
  return v
}

export const toProduct = (r) => r && {
  id: r.id,
  name: r.name,
  description: r.description || '',
  price: Number(r.price),
  originalPrice: r.original_price != null ? Number(r.original_price) : Number(r.price),
  discount: Number(r.discount || 0),
  category: r.category,
  subcategory: r.subcategory || '',
  sizes: j(r.sizes, []),
  colors: j(r.colors, []),
  images: j(r.images, []),
  inStock: r.in_stock !== false,
  isFeatured: !!r.is_featured,
  isNew: !!r.is_new,
  tags: j(r.tags, []),
  rating: Number(r.rating || 0),
  reviewCount: Number(r.review_count || 0),
  createdAt: r.created_at
}

export const toCoupon = (r) => r && {
  id: r.id,
  code: r.code,
  description: r.description || '',
  discountType: r.discount_type,
  discountValue: Number(r.discount_value || 0),
  minOrder: Number(r.min_order || 0),
  maxDiscount: Number(r.max_discount || 0),
  validTill: r.valid_till || '',
  category: r.category || undefined,
  isActive: !!r.is_active
}

export const toOrder = (r) => r && {
  id: r.id,
  userId: r.user_id,
  userName: r.user_name,
  userEmail: r.user_email,
  items: j(r.items, []),
  address: j(r.address, {}),
  paymentMethod: r.payment_method,
  utrNumber: r.utr_number || null,
  subtotal: Number(r.subtotal || 0),
  shipping: Number(r.shipping || 0),
  coupon: r.coupon || null,
  couponDiscount: Number(r.coupon_discount || 0),
  total: Number(r.total || 0),
  status: r.status,
  statusHistory: j(r.status_history, []),
  estimatedDelivery: r.estimated_delivery,
  createdAt: r.created_at
}

export const toUser = (r) => r && {
  id: r.id,
  uid: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone || '',
  isAdmin: !!r.is_admin,
  addresses: j(r.addresses, []),
  createdAt: r.created_at
}
