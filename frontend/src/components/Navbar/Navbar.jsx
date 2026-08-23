import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, ChevronRight } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import { debounce } from '../../utils/helpers'
import categoriesData from '../../data/categories.json'
import productsData from '../../data/products.json'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const { itemCount } = useCart()
  const { itemCount: wishlistCount } = useWishlist()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSearch = debounce((query) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    const results = productsData.products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(query.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 6)
    setSearchResults(results)
    setShowSearch(true)
  }, 200)

  const onSearchChange = (e) => {
    setSearchQuery(e.target.value)
    handleSearch(e.target.value)
  }

  const goToProduct = (productId) => {
    setShowSearch(false)
    setSearchQuery('')
    navigate(`/product/${productId}`)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSearch(false)
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" id="logo">
            <span>STYLE</span>VERSE
          </Link>

          {/* Desktop Category Links */}
          <div className="navbar-links">
            {categoriesData.categories.map(cat => (
              <div key={cat.id} className="nav-link has-mega">
                <Link to={`/category/${cat.id}`} style={{color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'}}>
                  {cat.name}
                  <ChevronDown size={14} />
                </Link>
                <div className="mega-menu">
                  {categoriesData.categories.map(c => (
                    <div key={c.id} className="mega-menu-category">
                      <div className="mega-menu-title">{c.name}</div>
                      {c.subcategories.map(sub => (
                        <Link
                          key={sub.id}
                          to={`/category/${c.id}?sub=${sub.id}`}
                          className="mega-menu-link"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Link to="/category/all" className="nav-link" style={{textDecoration: 'none'}}>All Products</Link>
          </div>

          {/* Search Bar */}
          <form className="navbar-search" onSubmit={handleSearchSubmit} ref={searchRef}>
            <Search className="navbar-search-icon" size={16} />
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search for products, brands..."
              value={searchQuery}
              onChange={onSearchChange}
              onFocus={() => searchResults.length > 0 && setShowSearch(true)}
              id="search-input"
            />
            {showSearch && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map(product => (
                  <div
                    key={product.id}
                    className="search-result-item"
                    onClick={() => goToProduct(product.id)}
                  >
                    <img src={product.images[0]} alt={product.name} className="search-result-img" />
                    <div className="search-result-info">
                      <div className="search-result-name">{product.name}</div>
                      <div className="search-result-price">₹{product.price.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Action Icons */}
          <div className="navbar-actions">
            <Link to="/wishlist" className="nav-icon-btn" id="wishlist-btn" title="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="nav-icon-badge">{wishlistCount}</span>}
            </Link>

            <Link to="/cart" className="nav-icon-btn" id="cart-btn" title="Cart">
              <ShoppingBag size={20} />
              {itemCount > 0 && <span className="nav-icon-badge">{itemCount}</span>}
            </Link>

            <Link
              to={isAuthenticated ? '/account' : '/login'}
              className="nav-icon-btn"
              id="user-btn"
              title={isAuthenticated ? user?.name : 'Login'}
            >
              <User size={20} />
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="navbar-menu-btn"
              onClick={() => setMobileOpen(true)}
              id="mobile-menu-btn"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-drawer-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`} id="mobile-drawer">
        <div className="mobile-drawer-header">
          <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
            <span>STYLE</span>VERSE
          </Link>
          <button className="mobile-drawer-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* Mobile Search */}
        <div style={{ padding: 'var(--space-4)' }}>
          <form onSubmit={(e) => { handleSearchSubmit(e); setMobileOpen(false); }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="navbar-search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={onSearchChange}
                style={{ width: '100%', paddingLeft: 40 }}
              />
            </div>
          </form>
        </div>

        <div className="mobile-nav-links">
          {categoriesData.categories.map(cat => (
            <div key={cat.id}>
              <div
                className="mobile-nav-link"
                onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
              >
                {cat.name}
                <ChevronRight
                  size={16}
                  style={{
                    transform: expandedCategory === cat.id ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s'
                  }}
                />
              </div>
              {expandedCategory === cat.id && (
                <div className="mobile-sub-links">
                  <Link
                    to={`/category/${cat.id}`}
                    className="mobile-sub-link"
                    onClick={() => setMobileOpen(false)}
                  >
                    All {cat.name}
                  </Link>
                  {cat.subcategories.map(sub => (
                    <Link
                      key={sub.id}
                      to={`/category/${cat.id}?sub=${sub.id}`}
                      className="mobile-sub-link"
                      onClick={() => setMobileOpen(false)}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link to="/category/all" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
            All Products
          </Link>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: 'var(--space-3) 0' }} />

          <Link to="/wishlist" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
            Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
          </Link>

          <Link to="/cart" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
            Cart {itemCount > 0 && `(${itemCount})`}
          </Link>

          <Link
            to={isAuthenticated ? '/account' : '/login'}
            className="mobile-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            {isAuthenticated ? `Hi, ${user?.name}` : 'Login / Sign Up'}
          </Link>

          {isAuthenticated && (
            <Link to="/account/orders" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              My Orders
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
