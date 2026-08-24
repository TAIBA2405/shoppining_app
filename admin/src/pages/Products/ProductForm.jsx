import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Save, Plus, X, Image } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'

const CATEGORIES = ['men', 'women', 'kids']
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '26', '28', '30', '32', '34', '36', '38', 'Free Size']
const PRESET_COLORS = [
  { name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#1A1A1A' },
  { name: 'Navy', hex: '#1B2A4A' }, { name: 'Red', hex: '#C0392B' },
  { name: 'Green', hex: '#2E7D32' }, { name: 'Blue', hex: '#1565C0' },
  { name: 'Grey', hex: '#757575' }, { name: 'Khaki', hex: '#C3B091' },
  { name: 'Pink', hex: '#E91E8C' }, { name: 'Yellow', hex: '#F9C74F' },
  { name: 'Orange', hex: '#E67E22' }, { name: 'Purple', hex: '#6A1B9A' },
]

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '',
  category: 'men', subcategory: '', sizes: [], colors: [],
  images: [''], inStock: true, isFeatured: false, isNew: true, tags: '', discount: ''
}

export default function ProductForm() {
  const { productId } = useParams()
  const isEdit = !!productId
  const navigate = useNavigate()
  const toast = useToast()
  const { getProducts, addProduct, updateProduct } = useAuth()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Load existing product for edit
  useEffect(() => {
    if (isEdit) {
      getProducts().then(products => {
        const p = products.find(pr => pr.id === productId)
        if (p) {
          setForm({
            name: p.name || '', description: p.description || '',
            price: p.price || '', originalPrice: p.originalPrice || '',
            category: p.category || 'men', subcategory: p.subcategory || '',
            sizes: p.sizes || [], colors: p.colors || [],
            images: p.images?.length ? p.images : [''],
            inStock: p.inStock !== false, isFeatured: !!p.isFeatured,
            isNew: !!p.isNew, tags: (p.tags || []).join(', '), discount: p.discount || ''
          })
        }
      })
    }
  }, [productId])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const toggleSize = (size) => {
    set('sizes', form.sizes.includes(size) ? form.sizes.filter(s => s !== size) : [...form.sizes, size])
  }

  const toggleColor = (color) => {
    const exists = form.colors.find(c => c.hex === color.hex)
    set('colors', exists ? form.colors.filter(c => c.hex !== color.hex) : [...form.colors, color])
  }

  const addImageUrl = () => set('images', [...form.images, ''])
  const setImageUrl = (i, val) => {
    const imgs = [...form.images]
    imgs[i] = val
    set('images', imgs)
  }
  const removeImage = (i) => set('images', form.images.filter((_, idx) => idx !== i))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Valid price required'
    if (!form.category) e.category = 'Category required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Validation failed: Please enter a valid name and price.')
      return
    }
    setSaving(true)

    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : Number(form.price),
      discount: form.discount ? Number(form.discount) : Math.round((1 - Number(form.price) / (form.originalPrice ? Number(form.originalPrice) : Number(form.price))) * 100) || 0,
      category: form.category,
      subcategory: form.subcategory.trim(),
      sizes: form.sizes,
      colors: form.colors,
      images: form.images.filter(img => img.trim()),
      inStock: form.inStock,
      isFeatured: form.isFeatured,
      isNew: form.isNew,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
    }

    if (isEdit) {
      await updateProduct(productId, data)
      toast.success('Product updated successfully!')
    } else {
      await addProduct(data)
      toast.success('Product added successfully!')
    }
    setSaving(false)
    navigate('/products')
  }

  // Preview
  const previewImg = form.images.find(img => img.trim())
  const previewPrice = form.price ? Number(form.price) : 0
  const previewOriginal = form.originalPrice ? Number(form.originalPrice) : 0

  return (
    <div id="admin-product-form">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <Link to="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', textDecoration: 'none', marginBottom: 8 }}>
            <ArrowLeft size={14} /> Back to Products
          </Link>
          <h1 className="admin-page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="admin-page-subtitle">{isEdit ? `Editing: ${form.name || productId}` : 'Fill in the details to list a new product'}</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {saving ? <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: 'black', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Basic Info */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Basic Info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="admin-form-field">
                <label className="admin-form-label">Product Name *</label>
                <input className={`admin-form-input ${errors.name ? 'error' : ''}`} placeholder="e.g. Classic Oxford Shirt" value={form.name} onChange={e => set('name', e.target.value)} />
                {errors.name && <span style={{ fontSize: 10, color: 'var(--color-error)' }}>{errors.name}</span>}
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Description</label>
                <textarea className="admin-form-input" rows={3} placeholder="Product description..." value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div className="admin-form-grid">
                <div className="admin-form-field">
                  <label className="admin-form-label">Category *</label>
                  <select className="admin-form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="admin-form-field">
                  <label className="admin-form-label">Subcategory</label>
                  <input className="admin-form-input" placeholder="shirts, dresses..." value={form.subcategory} onChange={e => set('subcategory', e.target.value)} />
                </div>
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Tags (comma separated)</label>
                <input className="admin-form-input" placeholder="bestseller, new-arrival..." value={form.tags} onChange={e => set('tags', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pricing</div>
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label className="admin-form-label">Selling Price (â‚¹) *</label>
                <input className={`admin-form-input ${errors.price ? 'error' : ''}`} type="number" placeholder="1299" value={form.price} onChange={e => set('price', e.target.value)} />
                {errors.price && <span style={{ fontSize: 10, color: 'var(--color-error)' }}>{errors.price}</span>}
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Original / MRP (â‚¹)</label>
                <input className="admin-form-input" type="number" placeholder="2499" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} />
              </div>
            </div>
            {previewPrice > 0 && previewOriginal > previewPrice && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
                Discount: <strong style={{ color: 'var(--color-success)' }}>
                  {Math.round((1 - previewPrice / previewOriginal) * 100)}% off
                </strong> â€” Customer saves {formatPrice(previewOriginal - previewPrice)}
              </div>
            )}
          </div>

          {/* Sizes */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sizes</div>
            <div className="admin-size-chips">
              {ALL_SIZES.map(size => (
                <button
                  key={size}
                  type="button"
                  className={`admin-size-chip ${form.sizes.includes(size) ? 'selected' : ''}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            {form.sizes.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                Selected: {form.sizes.join(', ')}
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Colors</div>
            <div className="admin-color-chips">
              {PRESET_COLORS.map(color => {
                const selected = form.colors.find(c => c.hex === color.hex)
                return (
                  <button
                    key={color.hex}
                    type="button"
                    className="admin-color-chip"
                    style={selected ? { borderColor: 'var(--color-primary)', background: 'rgba(var(--color-primary-rgb), 0.1)' } : {}}
                    onClick={() => toggleColor(color)}
                  >
                    <span className="admin-color-dot" style={{ background: color.hex }} />
                    {color.name}
                    {selected && <span style={{ color: 'var(--color-primary)' }}>âœ“</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Images */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Images</div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addImageUrl} style={{ fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus size={12} /> Add URL
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.images.map((img, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {img.trim() && (
                    <img src={img} alt="" style={{ width: 36, height: 44, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                      onError={e => e.target.style.display = 'none'} />
                  )}
                  {!img.trim() && (
                    <div style={{ width: 36, height: 44, borderRadius: 6, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Image size={14} color="var(--text-tertiary)" />
                    </div>
                  )}
                  <input
                    className="admin-form-input"
                    placeholder={`Image URL ${i + 1}`}
                    value={img}
                    onChange={e => setImageUrl(i, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  {form.images.length > 1 && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeImage(i)}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Settings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'inStock', label: 'In Stock', desc: 'Product is available for purchase' },
                { key: 'isFeatured', label: 'Featured', desc: 'Show on homepage featured section' },
                { key: 'isNew', label: 'New Arrival', desc: 'Display "New" badge on product' }
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{desc}</div>
                  </div>
                  <label className="admin-toggle">
                    <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} />
                    <span className="admin-toggle-track" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview sidebar */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="admin-card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Preview</div>
            <div style={{ aspectRatio: '3/4', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 12, position: 'relative' }}>
              {previewImg ? (
                <img src={previewImg} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = ''; e.target.style.display = 'none' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
                  <Image size={32} />
                </div>
              )}
              {form.isNew && (
                <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, background: 'var(--color-new)', color: 'white', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>NEW</span>
              )}
              {!form.inStock && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>Out of Stock</span>
                </div>
              )}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 4 }}>{form.name || 'Product Name'}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 8, textTransform: 'capitalize' }}>{form.category} {form.subcategory && `Â· ${form.subcategory}`}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--text-primary)' }}>
                {previewPrice ? formatPrice(previewPrice) : 'â‚¹â€”'}
              </span>
              {previewOriginal > previewPrice && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>{formatPrice(previewOriginal)}</span>
              )}
            </div>
            {form.sizes.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>SIZES</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {form.sizes.slice(0, 6).map(s => (
                    <span key={s} style={{ fontSize: 10, padding: '2px 6px', border: '1px solid var(--border-color)', borderRadius: 4 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {form.colors.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>COLORS</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {form.colors.slice(0, 6).map(c => (
                    <div key={c.hex} style={{ width: 14, height: 14, borderRadius: '50%', background: c.hex, border: '1px solid var(--border-color)' }} title={c.name} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
