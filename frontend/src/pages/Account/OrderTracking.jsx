import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Package, CheckCircle, Truck, Home, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { formatPrice } from '../../utils/helpers'

const steps = [
  { key: 'placed',    label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed',    icon: CheckCircle },
  { key: 'shipped',   label: 'Shipped',      icon: Truck },
  { key: 'delivered', label: 'Delivered',    icon: Home }
]

export default function OrderTracking() {
  const { orderId } = useParams()
  const { getOrderById } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrderById(orderId).then(data => {
      setOrder(data)
      setLoading(false)
    })
  }, [orderId])

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-tertiary)' }}>Loading order...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div>
          <h2>Order not found</h2>
          <Link to="/account/orders" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>My Orders</Link>
        </div>
      </div>
    )
  }

  const currentStepIndex = steps.findIndex(s => s.key === order.status)

  return (
    <div className="page" id="order-tracking-page">
      <div className="container" style={{ maxWidth: 800, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <Link to="/account/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <h1 className="page-title" style={{ marginBottom: 'var(--space-6)' }}>Order {order.id}</h1>

        {/* Progress Steps */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 22, left: '10%', right: '10%', height: 3, background: 'var(--bg-tertiary)', borderRadius: 2 }}>
              <motion.div
                style={{ height: '100%', background: 'var(--color-primary)', borderRadius: 2 }}
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            {steps.map((step, i) => {
              const isActive = i <= currentStepIndex
              const isCurrent = i === currentStepIndex
              const Icon = step.icon
              const historyEntry = order.statusHistory?.find(h => h.status === step.key)
              return (
                <motion.div key={step.key}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: isActive ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isActive ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                    boxShadow: isCurrent ? 'var(--shadow-gold)' : 'none', transition: 'all 0.3s'
                  }}>
                    <Icon size={20} />
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)', marginTop: 'var(--space-2)', textAlign: 'center' }}>
                    {step.label}
                  </span>
                  {historyEntry && (
                    <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {new Date(historyEntry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Order Details */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Order Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.name} &times; {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: 'var(--space-2)' }}>
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            <p><strong>Payment:</strong> {order.paymentMethod?.toUpperCase()}</p>
            {order.address && (
              <p style={{ marginTop: 'var(--space-2)' }}>
                <strong>Address:</strong> {order.address.line1}, {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
