import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  TrendingUp, ShoppingBag, Package, Users, AlertTriangle,
  Clock, ArrowRight, Star
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { formatPrice } from '../../utils/helpers'

// â”€â”€ Inline SVG Bar Chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function BarChart({ data, height = 120 }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const barWidth = 100 / data.length

  return (
    <div style={{ position: 'relative', height }}>
      <svg width="100%" height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-primary-dark)" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const barH = max === 0 ? 0 : (d.value / max) * (height - 20)
          const x = `${i * barWidth + barWidth * 0.15}%`
          const w = `${barWidth * 0.7}%`
          const y = height - barH - 20
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={w} height={barH}
                rx="4" fill="url(#barGrad)"
                style={{ transition: 'all 0.4s ease' }}
              />
              <text
                x={`${i * barWidth + barWidth / 2}%`}
                y={height - 4}
                textAnchor="middle"
                fill="var(--text-tertiary)"
                fontSize="10"
                fontFamily="var(--font-body)"
              >
                {d.label}
              </text>
              {d.value > 0 && (
                <text
                  x={`${i * barWidth + barWidth / 2}%`}
                  y={y - 4}
                  textAnchor="middle"
                  fill="var(--color-primary)"
                  fontSize="10"
                  fontFamily="var(--font-body)"
                  fontWeight="600"
                >
                  {d.value}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// â”€â”€ Inline SVG Donut Chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, sg) => s + sg.value, 0)
  if (total === 0) return <div style={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>No data</div>

  const cx = size / 2, cy = size / 2, r = size / 2 - 16, strokeW = 24
  let offset = 0
  const circumference = 2 * Math.PI * r

  return (
    <svg width={size} height={size}>
      {segments.map((seg, i) => {
        const pct = seg.value / total
        const dash = pct * circumference
        const gap = circumference - dash
        const rotation = offset * 360 - 90
        offset += pct
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeW}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="butt"
            style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'all 0.5s ease' }}
          />
        )
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-primary)" fontSize="18" fontWeight="800" fontFamily="var(--font-heading)">
        {total}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-tertiary)" fontSize="10" fontFamily="var(--font-body)">
        orders
      </text>
    </svg>
  )
}

const STATUS_COLORS = {
  placed: '#60a5fa',
  confirmed: '#c9a84c',
  shipped: '#fbbf24',
  delivered: '#34d399',
  cancelled: '#f87171'
}

export default function Dashboard() {
  const { getAllOrders, getProducts, getAllUsers, user } = useAuth()
  const orders = getAllOrders()
  const products = getProducts()
  const users = getAllUsers()

  // â”€â”€ KPIs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0)
  const pendingOrders = orders.filter(o => ['placed', 'confirmed'].includes(o.status)).length
  const lowStock = products.filter(p => !p.inStock).length

  const kpis = [
    {
      label: 'Total Revenue', value: formatPrice(totalRevenue),
      icon: TrendingUp, color: '#34d399', sub: `${orders.filter(o => o.status !== 'cancelled').length} completed orders`
    },
    {
      label: 'Total Orders', value: orders.length,
      icon: ShoppingBag, color: '#c9a84c', sub: `${pendingOrders} pending`
    },
    {
      label: 'Products', value: products.length,
      icon: Package, color: '#60a5fa', sub: `${lowStock} out of stock`
    },
    {
      label: 'Customers', value: users.length,
      icon: Users, color: '#a78bfa', sub: 'Registered users'
    },
    {
      label: 'Low Stock', value: lowStock,
      icon: AlertTriangle, color: '#f87171', sub: 'Need restocking'
    },
    {
      label: 'Pending', value: pendingOrders,
      icon: Clock, color: '#fbbf24', sub: 'Awaiting action'
    },
  ]

  // â”€â”€ Last 7 days chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const chartData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 3)
      const dayStr = d.toDateString()
      const count = orders.filter(o => new Date(o.createdAt).toDateString() === dayStr).length
      days.push({ label, value: count })
    }
    return days
  }, [orders])

  // â”€â”€ Order status breakdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const statusBreakdown = useMemo(() => {
    const counts = {}
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })
    return Object.entries(counts).map(([status, value]) => ({
      label: status, value, color: STATUS_COLORS[status] || '#888'
    }))
  }, [orders])

  // â”€â”€ Top products by order frequency â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const topProducts = useMemo(() => {
    const freq = {}
    orders.forEach(o => {
      o.items?.forEach(item => {
        freq[item.productId || item.id] = (freq[item.productId || item.id] || 0) + (item.quantity || 1)
      })
    })
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5)
    return sorted.map(([id, count]) => ({
      product: products.find(p => p.id === id) || { name: id, price: 0, images: [] },
      count
    }))
  }, [orders, products])

  return (
    <div id="admin-dashboard">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Welcome back, {user?.name}! Here's what's happening.</p>
        </div>
        <div className="admin-page-header-actions">
          <Link to="/admin/products/new" className="btn btn-primary btn-sm">+ Add Product</Link>
          <Link to="/admin/orders" className="btn btn-secondary btn-sm">View Orders</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="admin-kpi-card"
            style={{ '--kpi-color': kpi.color }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="admin-kpi-label">{kpi.label}</div>
            <div className="admin-kpi-value">{kpi.value}</div>
            <div className="admin-kpi-change" style={{ color: 'var(--text-tertiary)' }}>{kpi.sub}</div>
            <div className="admin-kpi-icon"><kpi.icon size={48} color={kpi.color} /></div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="admin-charts-row">
        {/* Orders last 7 days */}
        <motion.div
          className="admin-chart-card"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ marginBottom: 0 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="admin-chart-title" style={{ marginBottom: 0 }}>Orders â€” Last 7 Days</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              Total: {chartData.reduce((s, d) => s + d.value, 0)} orders
            </div>
          </div>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
              No orders yet. Chart will populate when orders come in.
            </div>
          ) : (
            <BarChart data={chartData} height={140} />
          )}
        </motion.div>

        {/* Status breakdown donut */}
        <motion.div
          className="admin-chart-card"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div className="admin-chart-title" style={{ marginBottom: 0 }}>Order Status</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DonutChart segments={statusBreakdown} size={120} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {statusBreakdown.length === 0 && (
              <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', textAlign: 'center' }}>No orders yet</div>
            )}
            {statusBreakdown.map(sg => (
              <div key={sg.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: sg.color, flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize', flex: 1 }}>{sg.label}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sg.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row: top products + recent orders */}
      <div className="admin-bottom-row">
        {/* Top Products */}
        <motion.div
          className="admin-card"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        >
          <div className="admin-card-header">
            <span className="admin-card-title">Top Products</span>
            <Link to="/admin/products" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', textDecoration: 'none' }}>
              View all â†’
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
              No sales data yet
            </div>
          ) : (
            <div style={{ padding: 12 }}>
              {topProducts.map(({ product, count }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 700, width: 16, textAlign: 'center' }}>#{i + 1}</span>
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt={product.name} style={{ width: 36, height: 44, objectFit: 'cover', borderRadius: 6 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{formatPrice(product.price)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--color-primary)', fontWeight: 700, flexShrink: 0 }}>
                    <Star size={10} fill="currentColor" /> {count} sold
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          className="admin-card"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        >
          <div className="admin-card-header">
            <span className="admin-card-title">Recent Orders</span>
            <Link to="/admin/orders" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', textDecoration: 'none' }}>
              View all â†’
            </Link>
          </div>
          {orders.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
              No orders yet. Orders will appear once customers start purchasing.
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 8).map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: 'var(--text-xs)' }}>{order.id}</td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{order.userName || order.userEmail || 'Guest'}</td>
                      <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{order.items?.length || 0}</td>
                      <td style={{ fontWeight: 700, fontSize: 'var(--text-xs)' }}>{formatPrice(order.total)}</td>
                      <td>
                        <span
                          className="admin-status-badge"
                          style={{
                            background: `${STATUS_COLORS[order.status] || '#888'}18`,
                            color: STATUS_COLORS[order.status] || '#888'
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
