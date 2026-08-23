import { useState, useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { SlidersHorizontal, Grid3X3, List, ChevronDown, X } from 'lucide-react'
import ProductCard from '../../components/ProductCard/ProductCard'
import productsData from '../../data/products.json'
import categoriesData from '../../data/categories.json'
import './CategoryPage.css'

export default function CategoryPage() {
  const { categoryId } = useParams()
  const [searchParams] = useSearchParams()
  const subFilter = searchParams.get('sub')
  const searchQuery = searchParams.get('search') || ''
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])

  const allProducts = productsData.products
  const category = categoriesData.categories.find(c => c.id === categoryId)

  const filteredProducts = useMemo(() => {
    let products = [...allProducts]

    // Category filter
    if (categoryId && categoryId !== 'all' && categoryId !== 'new') {
      products = products.filter(p => p.category === categoryId)
    }

    // Subcategory filter
    if (subFilter) {
      products = products.filter(p => p.subcategory === subFilter)
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    // New arrivals filter
    if (categoryId === 'new') {
      products = products.filter(p => p.isNew)
    }

    // Price filter
    products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Size filter
    if (selectedSizes.length > 0) {
      products = products.filter(p => p.sizes.some(s => selectedSizes.includes(s)))
    }

    // Color filter
    if (selectedColors.length > 0) {
      products = products.filter(p => p.colors.some(c => selectedColors.includes(c.name)))
    }

    // Sort
    switch (sortBy) {
      case 'price-low': products.sort((a, b) => a.price - b.price); break
      case 'price-high': products.sort((a, b) => b.price - a.price); break
      case 'newest': products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break
      case 'rating': products.sort((a, b) => b.rating - a.rating); break
      case 'discount': products.sort((a, b) => b.discount - a.discount); break
      default: products.sort((a, b) => b.reviewCount - a.reviewCount); break
    }

    return products
  }, [allProducts, categoryId, subFilter, searchQuery, sortBy, priceRange, selectedSizes, selectedColors])

  const allSizes = [...new Set(allProducts.flatMap(p => p.sizes))].sort()
  const allColors = [...new Set(allProducts.flatMap(p => p.colors.map(c => c.name)))]

  const toggleSize = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])
  }

  const toggleColor = (color) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])
  }

  const clearFilters = () => {
    setPriceRange([0, 10000])
    setSelectedSizes([])
    setSelectedColors([])
  }

  const activeFilterCount = selectedSizes.length + selectedColors.length + (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0)

  const pageTitle = searchQuery
    ? `Search: "${searchQuery}"`
    : categoryId === 'all'
    ? 'All Products'
    : categoryId === 'new'
    ? 'New Arrivals'
    : category
    ? `${category.name}'s Fashion`
    : 'Products'

  return (
    <div className="page" id="category-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <span className="current">{pageTitle}</span>
        </div>

        {/* Page Header */}
        <div className="category-header">
          <div>
            <h1 className="page-title">{pageTitle}</h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="category-controls">
            <button
              className={`btn btn-ghost filter-toggle ${activeFilterCount > 0 ? 'has-filters' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && <span className="badge badge-count">{activeFilterCount}</span>}
            </button>

            <div className="sort-dropdown">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Biggest Discount</option>
              </select>
              <ChevronDown size={14} className="sort-icon" />
            </div>

            <div className="view-toggle">
              <button
                className={`btn btn-ghost ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                className={`btn btn-ghost ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="category-layout">
          {/* Filter Sidebar */}
          <aside className={`filter-sidebar ${showFilters ? 'open' : ''}`}>
            <div className="filter-sidebar-header">
              <h3>Filters</h3>
              {activeFilterCount > 0 && (
                <button className="btn btn-ghost" onClick={clearFilters} style={{ color: 'var(--color-primary)', fontSize: 'var(--text-xs)' }}>
                  Clear All
                </button>
              )}
              <button className="filter-close-btn" onClick={() => setShowFilters(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Subcategories */}
            {category && (
              <div className="filter-group">
                <h4 className="filter-group-title">Category</h4>
                <div className="filter-options">
                  <Link
                    to={`/category/${categoryId}`}
                    className={`filter-option-link ${!subFilter ? 'active' : ''}`}
                  >
                    All {category.name}
                  </Link>
                  {category.subcategories.map(sub => (
                    <Link
                      key={sub.id}
                      to={`/category/${categoryId}?sub=${sub.id}`}
                      className={`filter-option-link ${subFilter === sub.id ? 'active' : ''}`}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="filter-group">
              <h4 className="filter-group-title">Price Range</h4>
              <div className="price-range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0] || ''}
                  onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                  className="input"
                  style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2)' }}
                />
                <span style={{ color: 'var(--text-tertiary)' }}>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1] === 10000 ? '' : priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 10000])}
                  className="input"
                  style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2)' }}
                />
              </div>
            </div>

            {/* Sizes */}
            <div className="filter-group">
              <h4 className="filter-group-title">Size</h4>
              <div className="filter-sizes">
                {allSizes.slice(0, 12).map(size => (
                  <button
                    key={size}
                    className={`filter-size-btn ${selectedSizes.includes(size) ? 'active' : ''}`}
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="filter-group">
              <h4 className="filter-group-title">Color</h4>
              <div className="filter-colors">
                {allColors.slice(0, 10).map(color => (
                  <button
                    key={color}
                    className={`filter-color-btn ${selectedColors.includes(color) ? 'active' : ''}`}
                    onClick={() => toggleColor(color)}
                    title={color}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="category-products">
            {filteredProducts.length > 0 ? (
              <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
