import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import productsData from '../../../data/products.json'
import { formatPrice } from '../../../utils/helpers'

export default function StockPage() {
  const products = productsData.products

  return (
    <div className="page" id="admin-stock">
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <div>
            <h1 className="page-title">Stock Management</h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Manage product inventory</p>
          </div>
          <Link to="/admin" className="btn btn-ghost btn-sm">← Dashboard</Link>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Product</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Price</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Sizes</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Colors</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)', background: !product.inStock ? 'var(--color-error-bg)' : 'transparent' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        {!product.inStock && <AlertTriangle size={14} style={{ color: 'var(--color-error)', flexShrink: 0 }} />}
                        <span style={{ fontWeight: 600 }}>{product.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-3)', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{product.category}</td>
                    <td style={{ padding: 'var(--space-3)', fontWeight: 600 }}>{formatPrice(product.price)}</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{product.sizes.join(', ')}</td>
                    <td style={{ padding: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {product.colors.slice(0, 4).map(c => (
                          <div key={c.name} style={{ width: 16, height: 16, borderRadius: '50%', background: c.hex, border: '1px solid var(--border-color)' }} title={c.name} />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                      <span style={{ fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: product.inStock ? 'var(--color-success-bg)' : 'var(--color-error-bg)', color: product.inStock ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-info-bg)', borderRadius: 'var(--radius-sm)' }}>
          ℹ️ In production, stock quantities would be editable inline and synced with a database.
        </p>
      </div>
    </div>
  )
}
