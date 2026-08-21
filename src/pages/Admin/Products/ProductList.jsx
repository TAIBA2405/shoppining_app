import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2 } from 'lucide-react'
import productsData from '../../../data/products.json'
import { formatPrice } from '../../../utils/helpers'

export default function ProductList() {
  const products = productsData.products

  return (
    <div className="page" id="admin-products">
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <div className="admin-header">
          <div>
            <h1 className="page-title">Products</h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>{products.length} products</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Link to="/admin" className="btn btn-ghost btn-sm">← Dashboard</Link>
            <Link to="/admin/products/new" className="btn btn-primary btn-sm"><Plus size={16} /> Add Product</Link>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)' }}>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <img src={product.images[0]} alt={product.name} style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{product.name}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{product.category} / {product.subcategory}</td>
                    <td style={{ fontWeight: 600 }}>{formatPrice(product.price)}</td>
                    <td>
                      <span style={{ fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: product.inStock ? 'var(--color-success-bg)' : 'var(--color-error-bg)', color: product.inStock ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-primary)' }}>★ {product.rating}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm"><Edit size={14} /></button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
