import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Heart, ShoppingBag, Eye, Star, StarHalf } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice, getStars } from '../../utils/helpers'
import './ProductCard.css'

export default function ProductCard({ product, index = 0 }) {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()
  const toast = useToast()
  const inWishlist = isInWishlist(product.id)

  const handleWishlist = (e) => {
    e.stopPropagation()
    toggleItem(product)
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist ❤️')
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addItem(product, product.sizes[0], product.colors[0]?.name || 'Default')
    toast.success(`${product.name} added to cart!`)
  }

  const handleQuickView = (e) => {
    e.stopPropagation()
    navigate(`/product/${product.id}`)
  }

  const stars = getStars(product.rating)

  return (
    <motion.div
      className="product-card"
      onClick={() => navigate(`/product/${product.id}`)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      id={`product-card-${product.id}`}
    >
      {/* Image */}
      <div className="product-card-image">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
        />

        {/* Badges */}
        <div className="product-card-badges">
          {product.discount > 0 && (
            <span className="badge badge-sale">{product.discount}% OFF</span>
          )}
          {product.isNew && (
            <span className="badge badge-new">NEW</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          className={`product-card-wishlist ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Hover Overlay */}
        <div className="product-card-overlay">
          <button className="btn btn-primary" onClick={handleAddToCart}>
            <ShoppingBag size={14} />
            Add to Cart
          </button>
          <button className="btn btn-secondary" onClick={handleQuickView}>
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="product-card-info">
        <span className="product-card-category">{product.category}'s {product.subcategory}</span>
        <h3 className="product-card-name">{product.name}</h3>

        {/* Rating */}
        <div className="product-card-rating">
          <div className="product-card-stars">
            {stars.map((star, i) => (
              star === 'full' ? <Star key={i} size={12} fill="currentColor" /> :
              star === 'half' ? <StarHalf key={i} size={12} fill="currentColor" /> :
              <Star key={i} size={12} style={{ color: 'var(--text-tertiary)' }} />
            ))}
          </div>
          <span className="product-card-review-count">({product.reviewCount})</span>
        </div>

        {/* Colors */}
        {product.colors.length > 0 && (
          <div className="product-card-colors">
            {product.colors.slice(0, 4).map(color => (
              <div
                key={color.name}
                className="product-card-color-dot"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="product-card-price">
          <span className="product-card-current-price">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="product-card-original-price">{formatPrice(product.originalPrice)}</span>
              <span className="product-card-discount">{product.discount}% off</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
