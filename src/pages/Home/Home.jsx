import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Truck, RotateCcw, Shield, Headphones, Star, Zap, MessageCircle } from 'lucide-react'
import ProductCard from '../../components/ProductCard/ProductCard'
import productsData from '../../data/products.json'
import categoriesData from '../../data/categories.json'
import bannersData from '../../data/banners.json'
import './Home.css'

const iconMap = { Truck, RotateCcw, Shield, Headphones }

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    initials: 'PS',
    rating: 5,
    text: '"Absolutely love the quality! Ordered a silk saree and it was even more beautiful in person. Fast delivery and great packaging. Will definitely order again!"'
  },
  {
    name: 'Rahul Verma',
    location: 'Delhi',
    initials: 'RV',
    rating: 5,
    text: '"Best menswear collection online. The blazer I ordered fits perfectly and the fabric quality is premium. Customer service was very helpful with size selection."'
  },
  {
    name: 'Ananya Patel',
    location: 'Bangalore',
    initials: 'AP',
    rating: 4,
    text: '"Great kids collection! My daughter loved her party dress. Easy returns policy gives confidence to shop. The prices are very competitive for the quality you get."'
  }
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeTab, setActiveTab] = useState('all')
  const navigate = useNavigate()
  const banners = bannersData.banners
  const categories = categoriesData.categories

  // Auto-slide hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  // Countdown timer (set to 24 hours from now for demo)
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 59, seconds: 59 })
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) { seconds = 59; minutes-- }
        if (minutes < 0) { minutes = 59; hours-- }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59 }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const allProducts = productsData.products
  const featuredProducts = useMemo(() => {
    if (activeTab === 'all') return allProducts.filter(p => p.isFeatured).slice(0, 8)
    return allProducts.filter(p => p.category === activeTab && p.isFeatured).slice(0, 8)
  }, [activeTab, allProducts])

  const newArrivals = allProducts.filter(p => p.isNew).slice(0, 4)
  const categoryProductCounts = {
    men: allProducts.filter(p => p.category === 'men').length,
    women: allProducts.filter(p => p.category === 'women').length,
    kids: allProducts.filter(p => p.category === 'kids').length
  }

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="page" id="home-page">
      {/* ── Hero Section ── */}
      <section className="home-hero" id="hero-section">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className="hero-slide"
            style={{ opacity: i === currentSlide ? 1 : 0, zIndex: i === currentSlide ? 1 : 0 }}
          >
            <img src={banner.image} alt={banner.title} />
            <div className="hero-slide-overlay" style={{ background: banner.gradient }} />
          </div>
        ))}

        <div className="hero-content">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="hero-label">
              <Zap size={12} style={{ marginRight: 6 }} />
              {banners[currentSlide].subtitle}
            </span>
            <h1 className="hero-title">
              {currentSlide === 0 && <>End of Season <span className="highlight">Sale</span></>}
              {currentSlide === 1 && <>Discover <span className="highlight">New</span> Arrivals</>}
              {currentSlide === 2 && <>Festive <span className="highlight">Collection</span></>}
              {currentSlide === 3 && <>Kids <span className="highlight">Special</span></>}
            </h1>
            <p className="hero-subtitle">
              {currentSlide === 0 && 'Up to 60% off on premium fashion for Men, Women & Kids. Limited time offer — shop before it ends!'}
              {currentSlide === 1 && 'Explore the latest trends and styles curated just for you. Fresh drops every week.'}
              {currentSlide === 2 && 'Celebrate in style with our exclusive ethnic wear collection. Sarees, kurtas & more.'}
              {currentSlide === 3 && 'Adorable styles for your little ones. Comfortable, colorful and fun!'}
            </p>
            <div className="hero-actions">
              <Link to={banners[currentSlide].link} className="btn btn-primary btn-lg">
                {banners[currentSlide].cta}
                <ArrowRight size={18} />
              </Link>
              <Link to="/category/all" className="btn btn-secondary btn-lg">
                Browse All
              </Link>
            </div>
          </motion.div>

          <div className="hero-stats">
            <div>
              <div className="hero-stat-value">10K+</div>
              <div className="hero-stat-label">Products</div>
            </div>
            <div>
              <div className="hero-stat-value">50K+</div>
              <div className="hero-stat-label">Customers</div>
            </div>
            <div>
              <div className="hero-stat-value">4.8★</div>
              <div className="hero-stat-label">Rating</div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="hero-dots">
          {banners.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── Offers Bar ── */}
      <section className="offers-bar" id="offers-bar">
        <div className="offers-grid">
          {bannersData.offers.map(offer => {
            const Icon = iconMap[offer.icon] || Shield
            return (
              <motion.div
                key={offer.id}
                className="offer-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="offer-icon">
                  <Icon size={22} />
                </div>
                <div className="offer-text">
                  <h4>{offer.title}</h4>
                  <p>{offer.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Categories Section ── */}
      <section className="section" id="categories-section">
        <div className="section-header">
          <span className="section-label">Shop by Category</span>
          <h2 className="section-title">Explore Our Collections</h2>
          <p className="section-subtitle">Find your perfect style across our curated categories for the whole family</p>
        </div>

        <div className="categories-grid">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              className="category-card"
              onClick={() => navigate(`/category/${cat.id}`)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <img src={cat.image} alt={cat.name} loading="lazy" />
              <div className="category-card-overlay">
                <span className="category-card-name">{cat.name}'s Fashion</span>
                <span className="category-card-count">{categoryProductCounts[cat.id]}+ Products</span>
                <button className="btn btn-primary btn-sm">
                  Shop Now <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Flash Deals Countdown ── */}
      <section className="section countdown-section" id="flash-deals">
        <div className="countdown-inner">
          <div className="countdown-info">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="section-label">⚡ Flash Deals</span>
              <h2>Deal of the Day</h2>
              <p>Grab these exclusive deals before they expire. Up to 60% off on selected items!</p>
              <Link to="/category/all?sort=discount" className="btn btn-primary btn-lg">
                Shop Deals <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
          <motion.div
            className="countdown-timer"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="countdown-unit">
              <span className="countdown-value">{pad(countdown.hours)}</span>
              <span className="countdown-label">Hours</span>
            </div>
            <div className="countdown-unit">
              <span className="countdown-value">{pad(countdown.minutes)}</span>
              <span className="countdown-label">Mins</span>
            </div>
            <div className="countdown-unit">
              <span className="countdown-value">{pad(countdown.seconds)}</span>
              <span className="countdown-label">Secs</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="section" id="featured-products">
        <div className="section-header">
          <span className="section-label">Curated for You</span>
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">Handpicked styles that our customers love the most</p>
        </div>

        <div style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: '0 var(--space-6)' }}>
          <div className="tab-buttons">
            {[
              { id: 'all', label: 'All' },
              { id: 'men', label: 'Men' },
              { id: 'women', label: 'Women' },
              { id: 'kids', label: 'Kids' }
            ].map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="products-section-grid">
          {featuredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <div className="products-section-actions">
          <Link to="/category/all" className="btn btn-secondary btn-lg">
            View All Products <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }} id="new-arrivals">
        <div className="section-header">
          <span className="section-label">Just Dropped</span>
          <h2 className="section-title">New Arrivals</h2>
          <p className="section-subtitle">Be the first to get the latest styles before they sell out</p>
        </div>

        <div className="products-section-grid">
          {newArrivals.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <div className="products-section-actions">
          <Link to="/category/all?sort=newest" className="btn btn-primary btn-lg">
            Explore New Arrivals <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section" id="testimonials">
        <div className="section-header">
          <span className="section-label">Customer Love</span>
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Real reviews from real customers who love shopping with us</p>
        </div>

        <div className="testimonials-carousel">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="testimonial-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="testimonial-stars">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-location">{t.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="section cta-section" id="cta-section">
        <div className="cta-inner">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="section-label">Get in Touch</span>
            <h2>Order via WhatsApp</h2>
            <p>Prefer ordering on WhatsApp? Just send us a message with the product you like and we'll handle the rest!</p>
            <div className="cta-buttons">
              <a
                href="https://wa.me/919999999999?text=Hi!%20I%20want%20to%20place%20an%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
                style={{ background: '#25D366' }}
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
              <Link to="/category/all" className="btn btn-secondary btn-lg">
                Browse Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WhatsApp Float ── */}
      <a
        href="https://wa.me/919999999999?text=Hi!%20I%20need%20help%20with%20my%20order"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        id="whatsapp-float"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={26} />
      </a>
    </div>
  )
}
