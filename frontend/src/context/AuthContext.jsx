import { createContext, useContext, useState, useEffect } from 'react'
import { getStoredData, setStoredData, generateId } from '../utils/helpers'
import productsData from '../data/products.json'
import couponsData from '../data/coupons.json'

const AuthContext = createContext()

const STORAGE_KEY = 'styleverse_auth'
const USERS_KEY = 'styleverse_users'
const ORDERS_KEY = 'styleverse_orders'
const PRODUCTS_KEY = 'styleverse_products'
const COUPONS_KEY = 'styleverse_coupons'

const ADMIN_EMAIL = 'admin@styleverse.com'
const ADMIN_PASSWORD = 'admin123'

function seedAdmin() {
  const users = getStoredData(USERS_KEY, [])
  const adminExists = users.find(u => u.email === ADMIN_EMAIL)
  if (!adminExists) {
    users.unshift({
      id: 'admin-001',
      name: 'Admin',
      email: ADMIN_EMAIL,
      phone: '9999999999',
      password: ADMIN_PASSWORD,
      isAdmin: true,
      addresses: [],
      createdAt: new Date('2025-01-01').toISOString()
    })
    setStoredData(USERS_KEY, users)
  }
}

function seedProducts() {
  const existing = getStoredData(PRODUCTS_KEY, null)
  if (!existing) {
    setStoredData(PRODUCTS_KEY, productsData.products)
  }
}

function seedCoupons() {
  const existing = getStoredData(COUPONS_KEY, null)
  if (!existing) {
    const seeded = couponsData.coupons.map((c, i) => ({ ...c, id: `coupon-${i + 1}` }))
    setStoredData(COUPONS_KEY, seeded)
  }
}

// Run seeds once at module load
seedAdmin()
seedProducts()
seedCoupons()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = getStoredData(STORAGE_KEY)
    if (saved) setUser(saved)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (user) {
      setStoredData(STORAGE_KEY, user)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const signup = (name, email, phone, password) => {
    const users = getStoredData(USERS_KEY, [])
    const exists = users.find(u => u.email === email)
    if (exists) {
      return { success: false, message: 'Email already registered' }
    }

    const newUser = {
      id: generateId(),
      name,
      email,
      phone,
      password,
      isAdmin: false,
      addresses: [],
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    setStoredData(USERS_KEY, users)

    const { password: _, ...safeUser } = newUser
    setUser(safeUser)
    return { success: true }
  }

  const login = (email, password) => {
    const users = getStoredData(USERS_KEY, [])
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) {
      return { success: false, message: 'Invalid email or password' }
    }

    const { password: _, ...safeUser } = found
    setUser(safeUser)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
  }

  const updateProfile = (updates) => {
    const users = getStoredData(USERS_KEY, [])
    const index = users.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users[index] = { ...users[index], ...updates }
      setStoredData(USERS_KEY, users)
    }
    setUser(prev => ({ ...prev, ...updates }))
  }

  const addAddress = (address) => {
    const newAddress = { ...address, id: generateId() }
    const updatedAddresses = [...(user.addresses || []), newAddress]
    updateProfile({ addresses: updatedAddresses })
  }

  const removeAddress = (addressId) => {
    const updatedAddresses = (user.addresses || []).filter(a => a.id !== addressId)
    updateProfile({ addresses: updatedAddresses })
  }

  // ── Order management ──────────────────────────────────────────
  const placeOrder = (orderData) => {
    const orders = getStoredData(ORDERS_KEY, [])
    const newOrder = {
      id: 'ORD' + Date.now().toString().slice(-8),
      userId: user?.id || 'guest',
      userName: user?.name || 'Guest',
      userEmail: user?.email || '',
      ...orderData,
      status: 'confirmed',
      statusHistory: [
        { status: 'placed', date: new Date().toISOString() },
        { status: 'confirmed', date: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    }
    orders.push(newOrder)
    setStoredData(ORDERS_KEY, orders)
    return newOrder
  }

  const getOrders = () => {
    const orders = getStoredData(ORDERS_KEY, [])
    return orders.filter(o => o.userId === user?.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const getOrderById = (orderId) => {
    const orders = getStoredData(ORDERS_KEY, [])
    return orders.find(o => o.id === orderId)
  }

  const getAllOrders = () => {
    return getStoredData(ORDERS_KEY, []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const updateOrderStatus = (orderId, status) => {
    const orders = getStoredData(ORDERS_KEY, [])
    const index = orders.findIndex(o => o.id === orderId)
    if (index !== -1) {
      orders[index].status = status
      orders[index].statusHistory = orders[index].statusHistory || []
      orders[index].statusHistory.push({ status, date: new Date().toISOString() })
      setStoredData(ORDERS_KEY, orders)
    }
  }

  const deleteOrder = (orderId) => {
    const orders = getStoredData(ORDERS_KEY, [])
    setStoredData(ORDERS_KEY, orders.filter(o => o.id !== orderId))
  }

  // ── Product management (admin) ────────────────────────────────
  const getProducts = () => {
    return getStoredData(PRODUCTS_KEY, productsData.products)
  }

  const addProduct = (productData) => {
    const products = getStoredData(PRODUCTS_KEY, productsData.products)
    const newProduct = {
      id: 'p' + Date.now().toString().slice(-6),
      rating: 0,
      reviewCount: 0,
      isNew: true,
      isFeatured: false,
      tags: [],
      inStock: true,
      ...productData,
      createdAt: new Date().toISOString()
    }
    products.unshift(newProduct)
    setStoredData(PRODUCTS_KEY, products)
    return newProduct
  }

  const updateProduct = (productId, updates) => {
    const products = getStoredData(PRODUCTS_KEY, productsData.products)
    const index = products.findIndex(p => p.id === productId)
    if (index !== -1) {
      products[index] = { ...products[index], ...updates }
      setStoredData(PRODUCTS_KEY, products)
      return products[index]
    }
    return null
  }

  const deleteProduct = (productId) => {
    const products = getStoredData(PRODUCTS_KEY, productsData.products)
    setStoredData(PRODUCTS_KEY, products.filter(p => p.id !== productId))
  }

  const toggleProductStock = (productId) => {
    const products = getStoredData(PRODUCTS_KEY, productsData.products)
    const index = products.findIndex(p => p.id === productId)
    if (index !== -1) {
      products[index].inStock = !products[index].inStock
      setStoredData(PRODUCTS_KEY, products)
      return products[index].inStock
    }
    return null
  }

  // ── User management (admin) ───────────────────────────────────
  const getAllUsers = () => {
    return getStoredData(USERS_KEY, [])
      .filter(u => !u.isAdmin)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const deleteUser = (userId) => {
    const users = getStoredData(USERS_KEY, [])
    setStoredData(USERS_KEY, users.filter(u => u.id !== userId))
  }

  // ── Coupon management (admin) ─────────────────────────────────
  const getCoupons = () => {
    return getStoredData(COUPONS_KEY, [])
  }

  const addCoupon = (couponData) => {
    const coupons = getStoredData(COUPONS_KEY, [])
    const newCoupon = {
      id: 'coupon-' + Date.now(),
      isActive: true,
      ...couponData,
      code: couponData.code.toUpperCase().trim()
    }
    coupons.unshift(newCoupon)
    setStoredData(COUPONS_KEY, coupons)
    return newCoupon
  }

  const deleteCoupon = (couponId) => {
    const coupons = getStoredData(COUPONS_KEY, [])
    setStoredData(COUPONS_KEY, coupons.filter(c => c.id !== couponId))
  }

  const toggleCoupon = (couponId) => {
    const coupons = getStoredData(COUPONS_KEY, [])
    const index = coupons.findIndex(c => c.id === couponId)
    if (index !== -1) {
      coupons[index].isActive = !coupons[index].isActive
      setStoredData(COUPONS_KEY, coupons)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: !!user?.isAdmin,
      isLoading,
      signup,
      login,
      logout,
      updateProfile,
      addAddress,
      removeAddress,
      placeOrder,
      getOrders,
      getOrderById,
      getAllOrders,
      updateOrderStatus,
      deleteOrder,
      getProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleProductStock,
      getAllUsers,
      deleteUser,
      getCoupons,
      addCoupon,
      deleteCoupon,
      toggleCoupon
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
