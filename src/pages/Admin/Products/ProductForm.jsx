import { Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'

export default function ProductForm() {
  return (
    <div className="page" id="admin-product-form">
      <div className="container" style={{ maxWidth: 800, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <Link to="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <h1 className="page-title" style={{ marginBottom: 'var(--space-6)' }}>Add New Product</h1>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>Product Name</label>
              <input className="input" placeholder="Enter product name" />
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>Description</label>
              <textarea className="input" rows={4} placeholder="Product description" style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>Price (₹)</label>
                <input className="input" type="number" placeholder="1299" />
              </div>
              <div>
                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>Original Price (₹)</label>
                <input className="input" type="number" placeholder="2499" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>Category</label>
                <select className="input"><option>Men</option><option>Women</option><option>Kids</option></select>
              </div>
              <div>
                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>Subcategory</label>
                <input className="input" placeholder="shirts, dresses, etc." />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>Image URL</label>
              <input className="input" placeholder="https://images.unsplash.com/..." />
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>Sizes (comma separated)</label>
              <input className="input" placeholder="S, M, L, XL" />
            </div>
            <button type="button" className="btn btn-primary btn-lg" style={{ width: 'fit-content' }}>
              <Save size={18} /> Save Product
            </button>
          </form>
        </div>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-info-bg)', borderRadius: 'var(--radius-sm)' }}>
          ℹ️ This is a demo form. In production, this would save to a database.
        </p>
      </div>
    </div>
  )
}
