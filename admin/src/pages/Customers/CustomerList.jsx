import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Users, Trash2, Mail, Phone, MapPin, Calendar, ShoppingBag } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'

export default function CustomerList() {
  const { getAllUsers, deleteUser, getAllOrders } = useAuth()
  const toast = useToast()
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    setCustomers(getAllUsers())
    setOrders(getAllOrders())
  }, [])

  const refresh = () => {
    setCustomers(getAllUsers())
    setOrders(getAllOrders())
  }

  const getCustomerOrders = (userId) =>
    orders.filter(o => o.userId === userId)

  const getCustomerStats = (userId) => {
    const customerOrders = getCustomerOrders(userId)
    const revenue = customerOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0)
    return { orderCount: customerOrders.length, revenue }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteUser(deleteTarget.id)
    toast.success(`Customer "${deleteTarget.name}" removed`)
    setDeleteTarget(null)
    refresh()
  }

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const q = search.toLowerCase()
      return !search ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone || '').includes(q)
    })
  }, [customers, search])

  const totalRevenue = useMemo(() =>
    customers.reduce((s, c) => s + getCustomerStats(c.id).revenue, 0),
    [customers, orders]
  )

  return (
    <div id="admin-customers">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers</h1>
          <p className="admin-page-subtitle">
            {customers.length} registered users Â· {formatPrice(totalRevenue)} lifetime revenue
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Customers', value: customers.length, color: '#a78bfa', icon: Users },
          { label: 'Active (has orders)', value: customers.filter(c => getCustomerStats(c.id).orderCount > 0).length, color: '#34d399', icon: ShoppingBag },
          { label: 'Lifetime Revenue', value: formatPrice(totalRevenue), color: '#c9a84c', icon: ShoppingBag },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '16px 20px', borderTopColor: color, borderTopWidth: 2 }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="admin-search-wrapper">
            <Search size={14} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
            <Users size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>{customers.length === 0 ? 'No customers have registered yet' : 'No customers match your search'}</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Joined</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Addresses</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(customer => {
                  const stats = getCustomerStats(customer.id)
                  const initials = customer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                  const isOpen = expanded === customer.id
                  return (
                    <>
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setExpanded(isOpen ? null : customer.id)}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #a78bfa, #6d28d9)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 'var(--text-xs)', fontWeight: 700, color: 'white', flexShrink: 0
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{customer.name}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{customer.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Mail size={11} /> {customer.email}
                            </div>
                            {customer.phone && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <Phone size={11} /> {customer.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={11} />
                            {new Date(customer.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            padding: '2px 10px', borderRadius: 'var(--radius-full)',
                            background: stats.orderCount > 0 ? 'var(--color-success-bg)' : 'var(--bg-tertiary)',
                            color: stats.orderCount > 0 ? 'var(--color-success)' : 'var(--text-tertiary)',
                            fontSize: 'var(--text-xs)', fontWeight: 700
                          }}>
                            {stats.orderCount} order{stats.orderCount !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: stats.revenue > 0 ? 'var(--color-primary)' : 'var(--text-tertiary)' }}>
                          {stats.revenue > 0 ? formatPrice(stats.revenue) : 'â€”'}
                        </td>
                        <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={11} /> {(customer.addresses || []).length}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-error)' }}
                            onClick={() => setDeleteTarget(customer)}
                            title="Remove customer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </motion.tr>

                      {/* Expanded: customer's orders */}
                      <AnimatePresence>
                        {isOpen && (
                          <tr key={`${customer.id}-detail`}>
                            <td colSpan={7} style={{ padding: 0 }}>
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}
                              >
                                <div style={{ padding: '12px 20px' }}>
                                  <div style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                    Order History
                                  </div>
                                  {getCustomerOrders(customer.id).length === 0 ? (
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>No orders placed yet</p>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                      {getCustomerOrders(customer.id).map(order => (
                                        <div key={order.id} style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 'var(--text-xs)', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                                          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{order.id}</span>
                                          <span style={{ color: 'var(--text-tertiary)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                                          <span style={{ color: 'var(--text-secondary)' }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
                                          <span style={{ fontWeight: 700 }}>{formatPrice(order.total)}</span>
                                          <span style={{
                                            padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600, textTransform: 'capitalize',
                                            background: order.status === 'delivered' ? 'var(--color-success-bg)' : order.status === 'cancelled' ? 'var(--color-error-bg)' : 'var(--color-warning-bg)',
                                            color: order.status === 'delivered' ? 'var(--color-success)' : order.status === 'cancelled' ? 'var(--color-error)' : 'var(--color-warning)',
                                          }}>
                                            {order.status}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
            <motion.div className="admin-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 'var(--text-base)' }}>Remove Customer</div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 20 }}>
                Remove <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget.name}</strong> ({deleteTarget.email})? Their order history will remain.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn btn-sm admin-danger-btn" onClick={handleDelete}>Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
