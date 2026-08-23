import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'

export default function ProductList() {
  const { getProducts, deleteProduct } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { setProducts(getProducts()) }, [])
  const refresh = () => setProducts(getProducts())

  const categories = ['all', ...new Set(products.map(p => p.category))]

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter
    const matchStock = stockFilter === 'all' || (stockFilter === 'in' && p.inStock) || (stockFilter === 'out' && !p.inStock)
    return matchSearch && matchCat && matchStock
  })

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteProduct(deleteTarget.id)
    toast.success(`"${deleteTarget.name}" deleted`)
    setDeleteTarget(null)
    refresh()
  }

  return (
    <div id="admin-products">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">{products.length} total &middot; {products.filter(p => !p.inStock).length} out of stock</p>
        </div>
        <div className="admin-page-header-actions">
          <Link to="/admin/products/new" className="btn btn-primary btn-sm">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="admin-search-wrapper" style={{ flex: 1, minWidth: 160 }}>
            <Search size={14} className="admin-search-icon" />
            <input
              className="admin-search-input"
              style={{ width: '100%' }}
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="admin-filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <select className="admin-filter-select" value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
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
                  <th>Discount</th>
                  <th>Rating</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <motion.tr key={product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td data-label="Product">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={product.images?.[0]} alt={product.name} style={{ width: 36, height: 44, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{product.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Category" style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                      {product.category} / {product.subcategory}
                    </td>
                    <td data-label="Price" style={{ fontWeight: 700 }}>{formatPrice(product.price)}</td>
                    <td data-label="Discount">
                      {product.discount
                        ? <span style={{ fontSize: 10, background: 'var(--color-sale-bg)', color: 'var(--color-sale)', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>-{product.discount}%</span>
                        : <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                      }
                    </td>
                    <td data-label="Rating" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
                      {product.rating ? `★ ${product.rating}` : '—'}
                    </td>
                    <td data-label="Stock">
                      <span className="admin-status-badge" style={{
                        background: product.inStock ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                        color: product.inStock ? 'var(--color-success)' : 'var(--color-error)'
                      }}>
                        {product.inStock ? 'In Stock' : 'Out'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/products/edit/${product.id}`)} title="Edit">
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => setDeleteTarget(product)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
            <motion.div className="admin-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)', background: 'var(--color-error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={18} color="var(--color-error)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Delete Product</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>This cannot be undone</div>
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 20 }}>
                Delete <strong style={{ color: 'var(--text-primary)' }}>"{deleteTarget.name}"</strong>?
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
