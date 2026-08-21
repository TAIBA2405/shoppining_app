// Format price in Indian Rupees
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

// Calculate discount percentage
export const calcDiscount = (original, current) => {
  return Math.round(((original - current) / original) * 100)
}

// Generate star array for rating display
export const getStars = (rating) => {
  const stars = []
  const full = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push('full')
    else if (i === full && hasHalf) stars.push('half')
    else stars.push('empty')
  }
  return stars
}

// Truncate text
export const truncate = (str, len = 80) => {
  if (!str) return ''
  return str.length > len ? str.substring(0, len) + '...' : str
}

// Generate WhatsApp link
export const getWhatsAppLink = (product, quantity = 1) => {
  const phone = '919999999999' // Placeholder — replace with real number
  const message = encodeURIComponent(
    `Hi! I'd like to order:\n\n` +
    `📦 ${product.name}\n` +
    `💰 Price: ${formatPrice(product.price)}\n` +
    `📏 Qty: ${quantity}\n\n` +
    `Please confirm availability and delivery details.`
  )
  return `https://wa.me/${phone}?text=${message}`
}

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Get localStorage data safely
export const getStoredData = (key, fallback = null) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

// Set localStorage data safely
export const setStoredData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('localStorage write failed:', e)
  }
}

// Debounce function
export const debounce = (fn, delay = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// Scroll to top
export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
