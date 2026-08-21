import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Trash2, Minus, Plus, Tag, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'
import couponsData from '../../data/coupons.json'
import { useState } from 'react'

export default function CartPage() {
  const { items, subtotal, shipping, total, coupon, couponDiscount, itemCount, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart()
  const toast = useToast()
  const [couponCode, setCouponCode] = useState('')

  const handleApplyCoupon = () => {
    const found = couponsData.coupons.find(c => c.code === couponCode.toUpperCase() && c.isActive)
    if (!found) { toast.error('Invalid coupon code'); return }
    if (subtotal < found.minOrder) { toast.error(`Minimum order ₹${found.minOrder} required`); return }
    let discount = 0
    if (found.discountType === 'percentage') {
      discount = Math.min(subtotal * found.discountValue / 100, found.maxDiscount)
    } else if (found.discountType === 'flat') {
      discount = found.discountValue
    } else {
      discount = shipping
    }
    applyCoupon(found.code, discount)
    toast.success(`Coupon ${found.code} applied! You save ${formatPrice(discount)}`)
    setCouponCode('')
  }

  if (items.length === 0) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 'var(--space-6)' }}>
        <ShoppingBag size={64} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }} />
        <h2 style={{ marginBottom: 'var(--space-2)' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>Looks like you haven't added anything yet</p>
        <Link to="/category/all" className="btn btn-primary btn-lg">Start Shopping <ArrowRight size={18} /></Link>
      </div>
    )
  }

  return (
    <div className="page" id="cart-page">
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <h1 className="page-title" style={{ marginBottom: 'var(--space-6)' }}>Shopping Cart ({itemCount} items)</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-8)', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}
                >
                  <Link to={`/product/${item.id}`}>
                    <img src={item.image} alt={item.name} style={{ width: 100, height: 125, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                  </Link>
                  <div style={{ flex: 1 }}>
                    <Link to={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>{item.name}</h3>
                    </Link>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                      Size: {item.selectedSize} · Color: {item.selectedColor}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{formatPrice(item.price)}</span>
                      {item.originalPrice > item.price && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>{formatPrice(item.originalPrice)}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="quantity-selector" style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <button onClick={() => updateQuantity(i, item.quantity - 1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Minus size={14} /></button>
                        <span style={{ width: 36, textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(i, item.quantity + 1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Plus size={14} /></button>
                      </div>
                      <button onClick={() => { removeItem(i); toast.info('Item removed') }} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)' }}>
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', position: 'sticky', top: 'calc(var(--navbar-height) + var(--space-4))' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-5)' }}>Order Summary</h3>

            {/* Coupon */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Tag size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="input"
                  style={{ paddingLeft: 36, fontSize: 'var(--text-sm)' }}
                />
              </div>
              <button className="btn btn-secondary" onClick={handleApplyCoupon}>Apply</button>
            </div>
            {coupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-success-bg)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>
                <span style={{ color: 'var(--color-success)' }}>✓ {coupon} applied</span>
                <button onClick={() => { removeCoupon(); toast.info('Coupon removed') }} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: 'var(--text-xs)' }}>Remove</button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                <span style={{ color: shipping === 0 ? 'var(--color-success)' : 'inherit' }}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-3)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-5)' }}>
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
            <Link to="/category/all" className="btn btn-ghost" style={{ width: '100%', marginTop: 'var(--space-2)', justifyContent: 'center' }}>
              Continue Shopping
            </Link>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 'var(--space-4)' }}>
              Try coupons: WELCOME10 · STYLE500 · FESTIVE20
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
