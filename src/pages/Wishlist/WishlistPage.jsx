import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'
import productsData from '../../data/products.json'

export default function WishlistPage() {
  const { items, removeItem } = useWishlist()
  const { addItem } = useCart()
  const toast = useToast()

  if (items.length === 0) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 'var(--space-6)' }}>
        <Heart size={64} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }} />
        <h2 style={{ marginBottom: 'var(--space-2)' }}>Your wishlist is empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>Save items you love for later</p>
        <Link to="/category/all" className="btn btn-primary btn-lg">Browse Products <ArrowRight size={18} /></Link>
      </div>
    )
  }

  const handleMoveToCart = (item) => {
    const product = productsData.products.find(p => p.id === item.id)
    if (product) {
      addItem(product, product.sizes[0], product.colors[0]?.name || 'Default')
      removeItem(item.id)
      toast.success('Moved to cart!')
    }
  }

  return (
    <div className="page" id="wishlist-page">
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <h1 className="page-title" style={{ marginBottom: 'var(--space-6)' }}>My Wishlist ({items.length} items)</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-6)' }}>
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
            >
              <Link to={`/product/${item.id}`}>
                <div style={{ aspectRatio: '4/5', overflow: 'hidden' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </Link>
              <div style={{ padding: 'var(--space-4)' }}>
                <Link to={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>{item.name}</h3>
                </Link>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{formatPrice(item.price)}</span>
                  {item.originalPrice > item.price && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>{formatPrice(item.originalPrice)}</span>}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleMoveToCart(item)} style={{ flex: 1 }}>
                    <ShoppingBag size={14} /> Move to Cart
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { removeItem(item.id); toast.info('Removed from wishlist') }} style={{ color: 'var(--color-error)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
