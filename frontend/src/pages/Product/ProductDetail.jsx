import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Heart, ShoppingBag, Star, StarHalf, Minus, Plus, ChevronRight, MessageCircle, Share2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice, getStars, getWhatsAppLink } from '../../utils/helpers'
import ProductCard from '../../components/ProductCard/ProductCard'
import productsData from '../../data/products.json'
import './ProductDetail.css'

export default function ProductDetail() {
  const { productId } = useParams()
  const product = productsData.products.find(p => p.id === productId)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const { addItem } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()
  const toast = useToast()

  const relatedProducts = useMemo(() => {
    if (!product) return []
    return productsData.products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4)
  }, [product])

  if (!product) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Product not found</h2>
          <Link to="/category/all" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Browse Products</Link>
        </div>
      </div>
    )
  }

  const inWishlist = isInWishlist(product.id)
  const stars = getStars(product.rating)

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }
    addItem(product, selectedSize, selectedColor || product.colors[0]?.name || 'Default', quantity)
    toast.success(`${product.name} added to cart!`)
  }

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }
    addItem(product, selectedSize, selectedColor || product.colors[0]?.name || 'Default', quantity)
    window.location.href = '/checkout'
  }

  return (
    <div className="page" id="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <Link to={`/category/${product.category}`}>{product.category}</Link>
          <span className="separator">/</span>
          <span className="current">{product.name}</span>
        </div>

        <div className="product-detail-layout">
          {/* Image Gallery */}
          <motion.div
            className="product-gallery"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="product-main-image">
              <img src={product.images[selectedImage]} alt={product.name} />
              {product.discount > 0 && (
                <span className="badge badge-sale" style={{ position: 'absolute', top: 16, left: 16 }}>
                  {product.discount}% OFF
                </span>
              )}
            </div>
            <div className="product-thumbnails">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`product-thumbnail ${i === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="product-info"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="product-info-category">{product.category}'s {product.subcategory}</span>
            <h1 className="product-info-name">{product.name}</h1>

            {/* Rating */}
            <div className="product-info-rating">
              <div className="star-rating">
                {stars.map((star, i) => (
                  star === 'full' ? <Star key={i} size={16} fill="currentColor" /> :
                    star === 'half' ? <StarHalf key={i} size={16} fill="currentColor" /> :
                      <Star key={i} size={16} style={{ color: 'var(--text-tertiary)' }} />
                ))}
              </div>
              <span>{product.rating}</span>
              <span className="product-info-reviews">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="product-info-price">
              <span className="product-info-current">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="product-info-original">{formatPrice(product.originalPrice)}</span>
                  <span className="product-info-discount">Save {formatPrice(product.originalPrice - product.price)} ({product.discount}% off)</span>
                </>
              )}
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)', marginTop: 'var(--space-1)' }}>
              Inclusive of all taxes
            </p>

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div className="product-option">
                <h4>Color: <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{selectedColor || 'Select'}</span></h4>
                <div className="color-options">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      className={`color-option ${selectedColor === color.name ? 'active' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="product-option">
              <h4>Size: <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{selectedSize || 'Select'}</span></h4>
              <div className="size-options">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    className={`size-option ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="product-option">
              <h4>Quantity</h4>
              <div className="quantity-selector">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="qty-btn">
                  <Minus size={16} />
                </button>
                <span className="qty-value">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="qty-btn">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="product-actions">
              <button className="btn btn-primary btn-lg" onClick={handleAddToCart} id="add-to-cart-btn" style={{ flex: 1 }}>
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button className="btn btn-secondary btn-lg" onClick={handleBuyNow} style={{ flex: 1 }}>
                Buy Now
              </button>
              <button
                className={`btn-icon ${inWishlist ? 'active' : ''}`}
                onClick={() => { toggleItem(product); toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist ❤️') }}
                style={{
                  width: 48, height: 48, border: '1px solid var(--border-color)',
                  color: inWishlist ? 'var(--color-error)' : 'var(--text-secondary)'
                }}
              >
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* WhatsApp + Share */}
            <div className="product-secondary-actions">
              <a
                href={getWhatsAppLink(product, quantity)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                style={{ color: '#25D366' }}
              >
                <MessageCircle size={18} /> Order via WhatsApp
              </a>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.info('Link copied!')
                }}
              >
                <Share2 size={16} /> Share
              </button>
            </div>

            {/* Delivery Info */}
            <div className="delivery-info">
              <div className="delivery-item">
                <span>🚚</span>
                <div>
                  <strong>Free Delivery</strong>
                  <p>On orders above ₹499</p>
                </div>
              </div>
              <div className="delivery-item">
                <span>🔄</span>
                <div>
                  <strong>Easy Returns</strong>
                  <p>7-day return policy</p>
                </div>
              </div>
              <div className="delivery-item">
                <span>✅</span>
                <div>
                  <strong>COD Available</strong>
                  <p>Cash on delivery</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs: Description / Reviews */}
        <div className="product-tabs">
          <div className="product-tab-buttons">
            <button
              className={`product-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`product-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviewCount})
            </button>
          </div>
          <div className="product-tab-content">
            {activeTab === 'description' && (
              <div className="product-description">
                <p>{product.description}</p>
                <ul style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <li style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>• Premium quality material</li>
                  <li style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>• Available in multiple colors and sizes</li>
                  <li style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>• Machine washable</li>
                  <li style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>• Skin-friendly fabric</li>
                </ul>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="product-reviews-placeholder">
                <p style={{ color: 'var(--text-secondary)' }}>Customer reviews will appear here. This is a demo version.</p>
                <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {[
                    { name: 'Ankit S.', rating: 5, text: 'Great quality! Fits perfectly. Worth every rupee.', date: '2 weeks ago' },
                    { name: 'Meera P.', rating: 4, text: 'Nice product. Color is slightly different from the image but still beautiful.', date: '1 month ago' },
                    { name: 'Raj K.', rating: 5, text: 'Fast delivery and excellent packaging. Will order again!', date: '1 month ago' }
                  ].map((review, i) => (
                    <div key={i} style={{ padding: 'var(--space-4)', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                        <strong style={{ fontSize: 'var(--text-sm)' }}>{review.name}</strong>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{review.date}</span>
                      </div>
                      <div className="star-rating" style={{ marginBottom: 'var(--space-2)' }}>
                        {Array.from({ length: review.rating }).map((_, j) => <Star key={j} size={12} fill="currentColor" />)}
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="section" id="related-products">
            <div className="section-header" style={{ textAlign: 'left' }}>
              <span className="section-label">You May Also Like</span>
              <h2 className="section-title" style={{ fontSize: 'var(--text-2xl)' }}>Related Products</h2>
            </div>
            <div className="products-section-grid">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
