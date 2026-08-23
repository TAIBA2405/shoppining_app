import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, ChevronDown, ChevronUp, Trash2, ShoppingBag } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'

const STATUSES = ['all', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled']

const STATUS_COLORS = {
  placed: { bg: 'var(--color-info-bg)', color: 'var(--color-info)' },
  confirmed: { bg: 'rgba(var(--color-primary-rgb),0.12)', color: 'var(--color-primary)' },
  shipped: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)' },
  delivered: { bg: 'var(--color-success-bg)', color: 'var(--color-success)' },
  cancelled: { bg: 'var(--color-error-bg)', color: 'var(--color-error)' }
}

function StatusSelect({ orderId, value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(orderId, e.target.value)}
      style={{
        padding: '4px 10px',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        background: STATUS_COLORS[value]?.bg || 'var(--bg-tertiary)',
        color: STATUS_COLORS[value]?.color || 'var(--text-primary)',
        border: `1px solid ${STATUS_COLORS[value]?.color || 'var(--border-color)'}`,
        borderRadius: 'var(--radius-full)',
        cursor: 'pointer',
        outline: 'none',
        textTransform: 'capitalize'
      }}
    >
      {STATUSES.slice(1).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
    </select>
  )
}

export default function OrderList() {
  const { getAllOrders, updateOrderStatus, deleteOrder } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [orders, setOrders] = useState(() => getAllOrders())

  const refresh = () => setOrders(getAllOrders())

  const handleStatus = (orderId, status) => {
    updateOrderStatus(orderId, status)
    toast.success(`Order updated â†’ ${status}`)
    refresh()
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteOrder(deleteTarget.id)
    toast.success('Order deleted')
    setDeleteTarget(null)
    refresh()
  }

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchTab = tab === 'all' || o.status === tab
      const q = search.toLowerCase()
      const matchSearch = !search ||
        o.id.toLowerCase().includes(q) ||
        (o.userName || '').toLowerCase().includes(q) ||
        (o.userEmail || '').toLowerCase().includes(q)
      return matchTab && matchSearch
    })
  }, [orders, tab, search])

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0)
  const tabCounts = useMemo(() => {
    const c = { all: orders.length }
    STATUSES.slice(1).forEach(s => { c[s] = orders.filter(o => o.status === s).length })
    return c
  }, [orders])

  return (
    <div id="admin-orders">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-subtitle">{orders.length} total orders Â· {formatPrice(totalRevenue)} revenue</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="admin-status-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
        {STATUSES.slice(1).map(status => (
          <div
            key={status}
            onClick={() => setTab(status)}
            style={{
              padding: '14px 16px',
              background: tab === status ? STATUS_COLORS[status]?.bg : 'var(--bg-card)',
              border: `1px solid ${tab === status ? STATUS_COLORS[status]?.color : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ fontSize: 10, color: tab === status ? STATUS_COLORS[status]?.color : 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              {status}
            </div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: tab === status ? STATUS_COLORS[status]?.color : 'var(--text-primary)' }}>
              {tabCounts[status] || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="admin-tabs">
            {STATUSES.map(s => (
              <button key={s} className={`admin-tab ${tab === s ? 'active' : ''}`} onClick={() => setTab(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)} ({tabCounts[s] || 0})
              </button>
            ))}
          </div>
          <div className="admin-search-wrapper" style={{ marginLeft: 'auto' }}>
            <Search size={14} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Search order ID or customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
          <ShoppingBag size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>No orders found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnimatePresence>
            {filtered.map(order => {
              const sc = STATUS_COLORS[order.status] || { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }
              const isOpen = expanded === order.id
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="admin-card"
                  style={{ overflow: 'visible' }}
                >
                  {/* Order Header */}
                  <div
                    style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', cursor: 'pointer' }}
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>{order.id}</span>
                        <span
                          className="admin-status-badge"
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {order.userName || order.userEmail || 'Guest'} Â· {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-base)' }}>{formatPrice(order.total)}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''} Â· {(order.paymentMethod || 'N/A').toUpperCase()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                      <StatusSelect orderId={order.id} value={order.status} onChange={handleStatus} />
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-error)', padding: '4px 6px' }}
                        onClick={() => setDeleteTarget(order)}
                        title="Delete order"
                      >
                        <Trash2 size={14} />
                      </button>
                      <span style={{ color: 'var(--text-tertiary)' }}>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', borderTop: '1px solid var(--border-color)' }}
                      >
                        <div className="admin-order-details-grid">
                          {/* Items */}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                              Items Ordered
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {order.items?.map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                  {item.image && (
                                    <img src={item.image} alt={item.name} style={{ width: 36, height: 44, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                                  )}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                                      Qty: {item.quantity} {item.size && `Â· Size: ${item.size}`} {item.color && `Â· ${item.color}`}
                                    </div>
                                  </div>
                                  <div style={{ fontWeight: 700, fontSize: 'var(--text-xs)', flexShrink: 0 }}>{formatPrice(item.price * item.quantity)}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Address + Payment */}
                          <div>
                            {order.address && (
                              <div style={{ marginBottom: 16 }}>
                                <div style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Delivery Address</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.address.name}</div>
                                  <div>{order.address.street}</div>
                                  <div>{order.address.city}, {order.address.state} {order.address.pincode}</div>
                                  {order.address.phone && <div>ðŸ“ž {order.address.phone}</div>}
                                </div>
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Payment</div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                <div>Method: <strong style={{ color: 'var(--text-primary)' }}>{(order.paymentMethod || 'â€”').toUpperCase()}</strong></div>
                                {order.coupon && <div>Coupon: <strong style={{ color: 'var(--color-success)' }}>{order.coupon}</strong></div>}
                                <div style={{ marginTop: 8, fontWeight: 700, color: 'var(--text-primary)' }}>Total: {formatPrice(order.total)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
            <motion.div className="admin-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Delete Order</div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 20 }}>
                Delete order <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget.id}</strong>? This cannot be undone.
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
