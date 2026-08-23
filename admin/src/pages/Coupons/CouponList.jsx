import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Trash2, Tag, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'

const EMPTY_FORM = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minOrder: '',
  maxDiscount: '',
  validTill: '',
  isActive: true
}

const TYPE_LABELS = { percentage: '% Off', flat: 'Flat â‚¹ Off', shipping: 'Free Shipping' }

export default function CouponList() {
  const { getCoupons, addCoupon, deleteCoupon, toggleCoupon } = useAuth()
  const toast = useToast()
  const [coupons, setCoupons] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setCoupons(getCoupons())
  }, [])

  const refresh = () => setCoupons(getCoupons())
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleToggle = (couponId, code) => {
    toggleCoupon(couponId)
    refresh()
    toast.success(`Coupon ${code} toggled`)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteCoupon(deleteTarget.id)
    toast.success(`Coupon "${deleteTarget.code}" deleted`)
    setDeleteTarget(null)
    refresh()
  }

  const validate = () => {
    const e = {}
    if (!form.code.trim()) e.code = 'Code required'
    if (form.discountType !== 'shipping' && (!form.discountValue || isNaN(form.discountValue) || Number(form.discountValue) <= 0)) {
      e.discountValue = 'Valid discount value required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAddCoupon = () => {
    if (!validate()) return
    const existing = coupons.find(c => c.code === form.code.toUpperCase().trim())
    if (existing) {
      setErrors({ code: 'Coupon code already exists' })
      return
    }
    addCoupon({
      code: form.code,
      description: form.description,
      discountType: form.discountType,
      discountValue: form.discountType !== 'shipping' ? Number(form.discountValue) : 0,
      minOrder: form.minOrder ? Number(form.minOrder) : 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : 0,
      validTill: form.validTill || '2026-12-31',
      isActive: form.isActive
    })
    toast.success(`Coupon "${form.code.toUpperCase()}" created!`)
    setForm(EMPTY_FORM)
    setShowForm(false)
    refresh()
  }

  const activeCoupons = coupons.filter(c => c.isActive).length
  const expiredCoupons = coupons.filter(c => c.validTill && new Date(c.validTill) < new Date()).length

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') return `${coupon.discountValue}% off`
    if (coupon.discountType === 'flat') return `â‚¹${coupon.discountValue} off`
    return 'Free Shipping'
  }

  return (
    <div id="admin-coupons">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Coupons</h1>
          <p className="admin-page-subtitle">{coupons.length} coupons Â· {activeCoupons} active</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Coupons', value: coupons.length, color: '#c9a84c' },
          { label: 'Active', value: activeCoupons, color: '#34d399' },
          { label: 'Inactive', value: coupons.length - activeCoupons, color: '#6b6b7b' },
          { label: 'Expired', value: expiredCoupons, color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '16px 20px', borderTopColor: color, borderTopWidth: 2 }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Coupons Grid */}
      {coupons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
          <Tag size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ marginBottom: 16 }}>No coupons yet. Create your first coupon!</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Create Coupon
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          <AnimatePresence>
            {coupons.map((coupon, i) => {
              const isExpired = coupon.validTill && new Date(coupon.validTill) < new Date()
              return (
                <motion.div
                  key={coupon.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    opacity: !coupon.isActive ? 0.6 : 1,
                    transition: 'opacity 0.2s'
                  }}
                >
                  {/* Coupon ticket header */}
                  <div style={{
                    background: coupon.isActive && !isExpired
                      ? 'linear-gradient(135deg, rgba(var(--color-primary-rgb),0.15), rgba(var(--color-primary-rgb),0.05))'
                      : 'var(--bg-tertiary)',
                    padding: '16px 20px',
                    borderBottom: '2px dashed var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 'var(--text-lg)', color: coupon.isActive && !isExpired ? 'var(--color-primary)' : 'var(--text-tertiary)', letterSpacing: '0.15em' }}>
                        {coupon.code}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {TYPE_LABELS[coupon.discountType] || coupon.discountType}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, color: coupon.isActive && !isExpired ? 'var(--color-primary)' : 'var(--text-tertiary)' }}>
                        {formatDiscount(coupon)}
                      </div>
                      {isExpired && (
                        <span style={{ fontSize: 10, background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>EXPIRED</span>
                      )}
                    </div>
                  </div>

                  {/* Coupon body */}
                  <div style={{ padding: '14px 20px' }}>
                    {coupon.description && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 10 }}>{coupon.description}</p>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                      {coupon.minOrder > 0 && (
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 1 }}>Min Order</div>
                          {formatPrice(coupon.minOrder)}
                        </div>
                      )}
                      {coupon.maxDiscount > 0 && (
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 1 }}>Max Discount</div>
                          {formatPrice(coupon.maxDiscount)}
                        </div>
                      )}
                      {coupon.validTill && (
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 1 }}>Valid Till</div>
                          {new Date(coupon.validTill).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </div>
                      )}
                      {coupon.category && (
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 1 }}>Category</div>
                          <span style={{ textTransform: 'capitalize' }}>{coupon.category}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="admin-toggle">
                        <input
                          type="checkbox"
                          checked={coupon.isActive}
                          onChange={() => handleToggle(coupon.id, coupon.code)}
                        />
                        <span className="admin-toggle-track" />
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-error)', padding: '4px 8px' }}
                        onClick={() => setDeleteTarget(coupon)}
                        title="Delete coupon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create Coupon Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="admin-modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              className="admin-modal admin-modal-lg"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
              {/* Modal header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)' }}>Create New Coupon</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Fill in coupon details below</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={18} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="admin-form-grid">
                  <div className="admin-form-field">
                    <label className="admin-form-label">Coupon Code *</label>
                    <input
                      className="admin-form-input"
                      placeholder="e.g. SAVE20"
                      value={form.code}
                      onChange={e => set('code', e.target.value.toUpperCase())}
                      style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em' }}
                    />
                    {errors.code && <span style={{ fontSize: 10, color: 'var(--color-error)' }}>{errors.code}</span>}
                  </div>
                  <div className="admin-form-field">
                    <label className="admin-form-label">Discount Type</label>
                    <select className="admin-form-input" value={form.discountType} onChange={e => set('discountType', e.target.value)}>
                      <option value="percentage">Percentage (% off)</option>
                      <option value="flat">Flat Amount (â‚¹ off)</option>
                      <option value="shipping">Free Shipping</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-field">
                  <label className="admin-form-label">Description</label>
                  <input className="admin-form-input" placeholder="e.g. 20% off on orders above â‚¹999" value={form.description} onChange={e => set('description', e.target.value)} />
                </div>

                {form.discountType !== 'shipping' && (
                  <div className="admin-form-grid">
                    <div className="admin-form-field">
                      <label className="admin-form-label">
                        {form.discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (â‚¹)'} *
                      </label>
                      <input
                        className="admin-form-input"
                        type="number"
                        placeholder={form.discountType === 'percentage' ? '10' : '200'}
                        value={form.discountValue}
                        onChange={e => set('discountValue', e.target.value)}
                      />
                      {errors.discountValue && <span style={{ fontSize: 10, color: 'var(--color-error)' }}>{errors.discountValue}</span>}
                    </div>
                    <div className="admin-form-field">
                      <label className="admin-form-label">Max Discount Cap (â‚¹)</label>
                      <input className="admin-form-input" type="number" placeholder="500" value={form.maxDiscount} onChange={e => set('maxDiscount', e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="admin-form-grid">
                  <div className="admin-form-field">
                    <label className="admin-form-label">Minimum Order Value (â‚¹)</label>
                    <input className="admin-form-input" type="number" placeholder="999" value={form.minOrder} onChange={e => set('minOrder', e.target.value)} />
                  </div>
                  <div className="admin-form-field">
                    <label className="admin-form-label">Valid Till</label>
                    <input className="admin-form-input" type="date" value={form.validTill} onChange={e => set('validTill', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Active Immediately</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Customers can use this coupon right away</div>
                  </div>
                  <label className="admin-toggle">
                    <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                    <span className="admin-toggle-track" />
                  </label>
                </div>

                {/* Preview */}
                {form.code && (
                  <div style={{ padding: '12px 16px', background: 'rgba(var(--color-primary-rgb),0.08)', border: '1px dashed var(--color-primary)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--color-primary)' }}>{form.code}</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      {form.discountType === 'percentage' && form.discountValue ? `${form.discountValue}% off` :
                       form.discountType === 'flat' && form.discountValue ? `â‚¹${form.discountValue} off` :
                       form.discountType === 'shipping' ? 'Free Shipping' : 'â€”'}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setErrors({}) }}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={handleAddCoupon} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Tag size={14} /> Create Coupon
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
            <motion.div className="admin-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Delete Coupon</div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 20 }}>
                Delete coupon <strong style={{ color: 'var(--color-primary)', fontFamily: 'monospace' }}>{deleteTarget.code}</strong>? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn btn-sm admin-danger-btn" onClick={handleDelete}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
