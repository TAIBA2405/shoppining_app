import { useState } from 'react'
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Layers, Users, Tag,
  ChevronLeft, Menu, LogOut, ExternalLink, Search, Bell
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products',  label: 'Products',  icon: Package },
  { to: '/orders',    label: 'Orders',    icon: ShoppingBag },
  { to: '/stock',     label: 'Stock',     icon: Layers },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/coupons',   label: 'Coupons',   icon: Tag },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = (user?.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="admin-shell" style={{ paddingTop: 0, overflowX: 'hidden' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          style={{ display: 'block' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-icon">S</div>
          <div className="admin-sidebar-logo-text">
            <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              StyleVerse
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Admin Panel
            </div>
          </div>
        </div>

        <div className="admin-nav-section">
          <div className="admin-nav-label">Main Menu</div>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
            >
              <span className="admin-nav-item-icon"><Icon size={18} /></span>
              <span className="admin-nav-item-label">{label}</span>
            </NavLink>
          ))}

          <div className="admin-nav-label" style={{ marginTop: 20 }}>Quick Links</div>
          <a
            href="https://shoppining-app.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-nav-item"
            title={collapsed ? 'View Store' : undefined}
          >
            <span className="admin-nav-item-icon"><ExternalLink size={18} /></span>
            <span className="admin-nav-item-label">View Store</span>
          </a>
        </div>

        <div className="admin-sidebar-footer">
          <button
            onClick={handleLogout}
            className="admin-nav-item"
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
            title={collapsed ? 'Logout' : undefined}
          >
            <span className="admin-nav-item-icon"><LogOut size={18} /></span>
            <span className="admin-nav-item-label" style={{ color: 'var(--color-error)' }}>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Area */}
      <div className={`admin-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <header className="admin-topbar">
          <button
            className="admin-topbar-btn"
            onClick={() => {
              if (window.innerWidth <= 1024) {
                setMobileOpen(o => !o)
              } else {
                setCollapsed(c => !c)
              }
            }}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          <div className="admin-topbar-search">
            <Search size={14} className="admin-topbar-search-icon" />
            <input placeholder="Search products, orders..." />
          </div>

          <div className="admin-topbar-actions">
            <button className="admin-topbar-btn" title="Notifications">
              <Bell size={16} />
            </button>
            <div className="admin-topbar-user">
              <div className="admin-topbar-avatar">{initials}</div>
              <div className="admin-topbar-user-text" style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user?.name || 'Admin'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-primary)' }}>Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
