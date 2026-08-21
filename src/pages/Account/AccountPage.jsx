import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, MapPin, ShoppingBag, LogOut, Package } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'

export default function AccountPage() {
  const { user, isAuthenticated, logout, getOrders, updateProfile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState(window.location.pathname.includes('orders') ? 'orders' : 'profile')

  if (!isAuthenticated) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div>
          <h2 style={{ marginBottom: 'var(--space-2)' }}>Please sign in</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>You need to be logged in to view your account</p>
          <Link to="/login" className="btn btn-primary btn-lg">Sign In</Link>
        </div>
      </div>
    )
  }

  const orders = getOrders()

  const handleLogout = () => {
    logout()
    toast.info('Logged out')
    navigate('/')
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
  ]

  const statusColors = {
    placed: 'var(--color-info)',
    confirmed: 'var(--color-primary)',
    shipped: 'var(--color-warning)',
    delivered: 'var(--color-success)',
    cancelled: 'var(--color-error)'
  }

  return (
    <div className="page" id="account-page">
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)', maxWidth: 900 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 className="page-title">My Account</h1>
          <button className="btn btn-ghost" onClick={handleLogout} style={{ color: 'var(--color-error)' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-1)', borderBottom: '1px solid var(--border-color)', marginBottom: 'var(--space-6)' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: 'var(--space-3) var(--space-5)', fontSize: 'var(--text-sm)', fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${tab === t.id ? 'var(--color-primary)' : 'transparent'}`,
              background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-2)'
            }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-primary)' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{user.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{user.email}</p>
                {user.phone && <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>{user.phone}</p>}
              </div>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
              Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-secondary)' }}>
                <ShoppingBag size={48} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }} />
                <h3>No orders yet</h3>
                <Link to="/category/all" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Start Shopping</Link>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{order.id}</span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', marginLeft: 'var(--space-3)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', padding: '2px 10px', borderRadius: 'var(--radius-full)', background: `${statusColors[order.status]}22`, color: statusColors[order.status] }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                    {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · {formatPrice(order.total)} · {order.paymentMethod?.toUpperCase()}
                  </div>
                  <Link to={`/order-tracking/${order.id}`} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                    Track Order →
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
