import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { MapPin, CreditCard, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'

export default function CheckoutPage() {
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [utrNumber, setUtrNumber] = useState('')
  const [placing, setPlacing] = useState(false)
  const { items, subtotal, shipping, total, coupon, couponDiscount, clearCart } = useCart()
  const { user, placeOrder } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div>
          <h2>Your cart is empty</h2>
          <Link to="/category/all" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Shop Now</Link>
        </div>
      </div>
    )
  }

  const handlePlaceOrder = async () => {
    if (step === 1) {
      if (!address.name || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
        toast.error('Please fill all address fields'); return
      }
      setStep(2); return
    }
    if (step === 2) {
      setPlacing(true)
      try {
        const order = await placeOrder({
          items,
          address,
          paymentMethod,
          utrNumber: paymentMethod === 'upi' ? utrNumber : null,
          subtotal, shipping, coupon, couponDiscount, total
        })
        clearCart()
        navigate(`/order-confirmation/${order.id}`)
      } catch (err) {
        console.error('Order placement failed:', err)
        toast.error('Could not place order. Please try again.')
        setPlacing(false)
      }
    }
  }

  const steps = [
    { num: 1, label: 'Address', icon: MapPin },
    { num: 2, label: 'Payment', icon: CreditCard },
    { num: 3, label: 'Done', icon: CheckCircle }
  ]

  return (
    <div className="page" id="checkout-page">
      <div className="container" style={{ maxWidth: 900, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <h1 className="page-title" style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>Checkout</h1>

        {/* Step Indicator */}
        <div className="checkout-step-indicator">
          {steps.map((s, i) => (
            <div key={s.num} className="checkout-step-item">
              <div className="checkout-step-dot" style={{
                background: step >= s.num ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                color: step >= s.num ? 'var(--text-inverse)' : 'var(--text-tertiary)',
              }}>
                {s.num}
              </div>
              <span className="checkout-step-label" style={{ color: step >= s.num ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: step === s.num ? 600 : 400 }}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className="checkout-step-line" style={{ background: step > s.num ? 'var(--color-primary)' : 'var(--border-color)' }} />}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          {/* Form */}
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {step === 1 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-5)' }}>
                  <MapPin size={18} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--color-primary)' }} />
                  Delivery Address
                </h3>
                <div className="address-form-grid">
                  <div className="address-form-full">
                    <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>Full Name *</label>
                    <input className="input" value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} placeholder="Enter your full name" />
                  </div>
                  <div className="address-form-full">
                    <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>Phone Number *</label>
                    <input className="input" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="10-digit mobile number" />
                  </div>
                  <div className="address-form-full">
                    <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>Address Line 1 *</label>
                    <input className="input" value={address.line1} onChange={e => setAddress({ ...address, line1: e.target.value })} placeholder="House no., Building, Street" />
                  </div>
                  <div className="address-form-full">
                    <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>Address Line 2</label>
                    <input className="input" value={address.line2} onChange={e => setAddress({ ...address, line2: e.target.value })} placeholder="Area, Landmark (optional)" />
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>City *</label>
                    <input className="input" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="City" />
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>State *</label>
                    <input className="input" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} placeholder="State" />
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>PIN Code *</label>
                    <input className="input" value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} placeholder="6-digit PIN" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-5)' }}>
                  <CreditCard size={18} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--color-primary)' }} />
                  Payment Method
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {/* COD */}
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)',
                    background: paymentMethod === 'cod' ? 'rgba(201,168,76,0.05)' : 'var(--bg-tertiary)',
                    border: `1px solid ${paymentMethod === 'cod' ? 'var(--color-primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-lg)', cursor: 'pointer'
                  }}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>💵 Cash on Delivery (COD)</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>Pay when your order is delivered</div>
                    </div>
                  </label>

                  {/* UPI */}
                  <label style={{
                    display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-4)',
                    background: paymentMethod === 'upi' ? 'rgba(201,168,76,0.05)' : 'var(--bg-tertiary)',
                    border: `1px solid ${paymentMethod === 'upi' ? 'var(--color-primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-lg)', cursor: 'pointer'
                  }}>
                    <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} style={{ marginTop: 4 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>📱 UPI Payment</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>Pay via Google Pay, PhonePe, Paytm etc.</div>
                      {paymentMethod === 'upi' && (
                        <div style={{ marginTop: 'var(--space-4)' }}>
                          <div style={{
                            width: 160, height: 160, margin: '0 auto var(--space-4)',
                            background: 'white', borderRadius: 'var(--radius-md)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column', gap: 8
                          }}>
                            <div style={{ width: 120, height: 120, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 11, textAlign: 'center', padding: 8 }}>
                              [Demo QR Code]<br />Scan to pay {formatPrice(total)}
                            </div>
                          </div>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 'var(--space-3)' }}>
                            UPI ID: styleverse@upi (Demo)
                          </p>
                          <input
                            className="input"
                            placeholder="Enter UTR / Transaction ID"
                            value={utrNumber}
                            onChange={e => setUtrNumber(e.target.value)}
                            style={{ fontSize: 'var(--text-sm)' }}
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-info-bg)', borderRadius: 'var(--radius-sm)' }}>
                  ℹ️ This is a demo checkout. No real payment will be processed.
                </p>
              </div>
            )}
          </motion.div>

          {/* Summary */}
          <div className="checkout-summary">
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
              {items.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {couponDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}><span>Discount</span><span>-{formatPrice(couponDiscount)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Shipping</span><span style={{ color: shipping === 0 ? 'var(--color-success)' : '' }}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 'var(--text-lg)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-3)' }}><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-5)', flexWrap: 'wrap' }}>
              {step > 1 && (
                <button className="btn btn-secondary" onClick={() => setStep(step - 1)} style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-3) var(--space-4)' }}>
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder}
                style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-xs)', padding: 'var(--space-3) var(--space-4)' }}
                disabled={placing}>
                {placing ? 'Placing...' : step === 1 ? 'Continue' : 'Place Order'}
                {!placing && <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
