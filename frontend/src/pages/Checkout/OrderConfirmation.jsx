import { useParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { CheckCircle, Package, MessageCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { formatPrice } from '../../utils/helpers'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const { getOrderById } = useAuth()
  const order = getOrderById(orderId)

  if (!order) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Order not found</h2>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page" id="order-confirmation-page">
      <div className="container" style={{ maxWidth: 700, paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)', textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
          <CheckCircle size={80} style={{ color: 'var(--color-success)', marginBottom: 'var(--space-5)' }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>Order Placed! 🎉</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)' }}>
            Thank you for shopping with StyleVerse
          </p>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', textAlign: 'left', marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Order ID</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-primary)' }}>{order.id}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Payment</div>
                <div style={{ fontWeight: 600, textTransform: 'uppercase' }}>{order.paymentMethod}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{formatPrice(order.total)}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <Package size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Estimated delivery by {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/order-tracking/${order.id}`} className="btn btn-primary btn-lg">
              Track Order <ArrowRight size={18} />
            </Link>
            <a
              href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi! I just placed order ${order.id}. Please confirm.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg"
              style={{ color: '#25D366', borderColor: '#25D366' }}
            >
              <MessageCircle size={18} /> Share on WhatsApp
            </a>
          </div>

          <Link to="/category/all" className="btn btn-ghost" style={{ marginTop: 'var(--space-4)' }}>Continue Shopping</Link>
        </motion.div>
      </div>
    </div>
  )
}
