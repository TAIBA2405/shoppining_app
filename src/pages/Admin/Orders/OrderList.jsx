import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { formatPrice } from '../../../utils/helpers'
import { useToast } from '../../../context/ToastContext'

export default function OrderList() {
  const { getAllOrders, updateOrderStatus } = useAuth()
  const orders = getAllOrders()
  const toast = useToast()

  const handleStatusChange = (orderId, status) => {
    updateOrderStatus(orderId, status)
    toast.success(`Order ${orderId} → ${status}`)
  }

  const statusColors = {
    placed: 'var(--color-info)', confirmed: 'var(--color-primary)',
    shipped: 'var(--color-warning)', delivered: 'var(--color-success)', cancelled: 'var(--color-error)'
  }

  return (
    <div className="page" id="admin-orders">
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <div>
            <h1 className="page-title">Orders</h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>{orders.length} total orders</p>
          </div>
          <Link to="/admin" className="btn btn-ghost btn-sm">← Dashboard</Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
            <p>No orders yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{order.id}</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', marginLeft: 'var(--space-3)' }}>{new Date(order.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{
                      padding: '4px 12px', fontSize: 'var(--text-xs)', fontWeight: 600,
                      background: 'var(--bg-tertiary)', color: statusColors[order.status] || 'var(--text-primary)',
                      border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', cursor: 'pointer'
                    }}
                  >
                    <option value="placed">Placed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · {formatPrice(order.total)} · {order.paymentMethod?.toUpperCase()}
                  {order.address && <span> · {order.address.city}, {order.address.state}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
