import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Package, ShoppingBag, Users, TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { formatPrice } from '../../utils/helpers'
import productsData from '../../data/products.json'

export default function Dashboard() {
  const { getAllOrders } = useAuth()
  const orders = getAllOrders()
  const products = productsData.products

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const lowStockCount = products.filter(p => !p.inStock).length

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'var(--color-success)' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'var(--color-primary)' },
    { label: 'Products', value: products.length, icon: Package, color: 'var(--color-info)' },
    { label: 'Low Stock', value: lowStockCount, icon: AlertTriangle, color: 'var(--color-warning)' }
  ]

  return (
    <div className="page" id="admin-dashboard">
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Welcome to the StyleVerse admin panel</p>
          </div>
          <Link to="/" className="btn btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>← Back to Store</Link>
        </div>

        {/* Admin Nav */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', overflowX: 'auto' }}>
          {[
            { to: '/admin', label: 'Dashboard' },
            { to: '/admin/products', label: 'Products' },
            { to: '/admin/orders', label: 'Orders' },
            { to: '/admin/stock', label: 'Stock' }
          ].map(link => (
            <Link key={link.to} to={link.to} className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</span>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Recent Orders</h3>
            <Link to="/admin/orders" style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>View All →</Link>
          </div>

          {orders.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', padding: 'var(--space-6)', textAlign: 'center' }}>No orders yet. Orders will appear here once customers start ordering.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Order ID</th>
                    <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Items</th>
                    <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Total</th>
                    <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 'var(--space-3)', fontWeight: 600 }}>{order.id}</td>
                      <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>{order.items?.length || 0}</td>
                      <td style={{ padding: 'var(--space-3)', fontWeight: 600 }}>{formatPrice(order.total)}</td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: order.status === 'delivered' ? 'var(--color-success-bg)' : order.status === 'shipped' ? 'var(--color-warning-bg)' : 'rgba(201,168,76,0.1)', color: order.status === 'delivered' ? 'var(--color-success)' : order.status === 'shipped' ? 'var(--color-warning)' : 'var(--color-primary)' }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
