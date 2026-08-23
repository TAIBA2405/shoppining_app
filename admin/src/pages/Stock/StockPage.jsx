import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Search, AlertTriangle, Package, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'

export default function StockPage() {
  const { getProducts, toggleProductStock } = useAuth()
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [showOutOnly, setShowOutOnly] = useState(false)
  const [toggling, setToggling] = useState(null)

  useEffect(() => { setProducts(getProducts()) }, [])
  const refresh = () => setProducts(getProducts())

  const handleToggle = async (product) => {
    setToggling(product.id)
    await new Promise(r => setTimeout(r, 300))
    const newState = toggleProductStock(product.id)
    refresh()
    setToggling(null)
    toast.success(`"${product.name}" is now ${newState ? 'In Stock' : 'Out of Stock'}`)
  }

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
    return matchSearch && (!showOutOnly || !p.inStock)
  })

  const outOfStockCount = products.filter(p => !p.inStock).length
  const inStockCount = products.filter(p => p.inStock).length

  return (
    <div id="admin-stock">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Stock Management</h1>
          <p className="admin-page-subtitle">Toggle availability — changes save instantly</p>
        </div>
        <div className="admin-page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={refresh}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="admin-stock-summary">
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '16px 20px', borderTopColor: 'var(--color-success)', borderTopWidth: 2 }}>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>In Stock</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-success)' }}>{inStockCount}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '16px 20px', borderTopColor: 'var(--color-error)', borderTopWidth: 2 }}>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Out of Stock</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-error)' }}>{outOfStockCount}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '16px 20px', borderTopColor: 'var(--color-primary)', borderTopWidth: 2 }}>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Total</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>{products.length}</div>
        </div>
      </div>

      {/* Warning */}
      {outOfStockCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--color-warning-bg)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 'var(--radius-lg)', marginBottom: 20, fontSize: 'var(--text-sm)', flexWrap: 'wrap' }}>
          <AlertTriangle size={16} color="var(--color-warning)" />
          <span style={{ flex: 1 }}><strong style={{ color: 'var(--color-warning)' }}>{outOfStockCount} product{outOfStockCount !== 1 ? 's' : ''}</strong> out of stock</span>
          <button style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
            onClick={() => setShowOutOnly(s => !s)}>
            {showOutOnly ? 'Show All' : 'Show Out Only'}
          </button>
        </motion.div>
      )}

      {/* Toolbar */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-search-wrapper" style={{ flex: 1, minWidth: 160 }}>
            <Search size={14} className="admin-search-icon" />
            <input className="admin-search-input" style={{ width: '100%' }} placeholder="Search products..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <label className="admin-toggle">
            <input type="checkbox" checked={showOutOnly} onChange={e => setShowOutOnly(e.target.checked)} />
            <span className="admin-toggle-track" />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Out of stock only</span>
          </label>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{filtered.length} products</span>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
            <Package size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>No products found</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Sizes</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Toggle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <motion.tr key={product.id} layout style={{ background: !product.inStock ? 'rgba(248,113,113,0.03)' : 'transparent' }}>
                    <td data-label="Product">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {!product.inStock && <AlertTriangle size={14} color="var(--color-error)" style={{ flexShrink: 0 }} />}
                        <img src={product.images?.[0]} alt={product.name} style={{ width: 32, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>{product.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Category" style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{product.category}</td>
                    <td data-label="Price" style={{ fontWeight: 700, fontSize: 'var(--text-xs)' }}>{formatPrice(product.price)}</td>
                    <td data-label="Sizes" style={{ color: 'var(--text-secondary)', fontSize: 10 }}>{(product.sizes || []).join(', ') || '—'}</td>
                    <td data-label="Status">
                      <span className="admin-status-badge" style={{
                        background: product.inStock ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                        color: product.inStock ? 'var(--color-success)' : 'var(--color-error)'
                      }}>
                        {product.inStock ? 'In Stock' : 'Out'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <label className="admin-toggle" style={{ justifyContent: 'center', opacity: toggling === product.id ? 0.5 : 1 }}>
                        <input type="checkbox" checked={product.inStock} onChange={() => handleToggle(product)} disabled={toggling === product.id} />
                        <span className="admin-toggle-track" />
                      </label>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
