import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, getToken, setToken } from '../lib/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore admin session from JWT on boot
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    api.me()
      .then((u) => {
        if (u?.isAdmin) setUser(u)
        else setToken(null)
      })
      .catch(() => setToken(null))
      .finally(() => setIsLoading(false))
  }, [])

  // ── Auth ──────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { user: u, token } = await api.login({ email, password })
      if (!u?.isAdmin) return { success: false, message: 'This account is not an admin' }
      setToken(token)
      setUser(u)
      return { success: true }
    } catch (e) {
      return { success: false, message: e.message || 'Invalid email or password' }
    }
  }

  const logout = async () => {
    setToken(null)
    setUser(null)
  }

  // ── Orders ────────────────────────────────────────────────────
  const getAllOrders = useCallback(async () => api.getAllOrders(), [])
  const getOrderById = useCallback(async (orderId) => api.getOrderById(orderId), [])

  const updateOrderStatus = async (orderId, status) => {
    await api.updateOrderStatus(orderId, status)
  }

  const deleteOrder = async (orderId) => {
    await api.deleteOrder(orderId)
  }

  // ── Products (also fixes the /admin/products/* route typos) ──
  const getProducts = useCallback(async () => api.getProducts(), [])

  const addProduct = async (productData) => api.addProduct(productData)
  const updateProduct = async (productId, updates) => api.updateProduct(productId, updates)

  const deleteProduct = async (productId) => {
    await api.deleteProduct(productId)
  }

  const toggleProductStock = async (productId) => {
    const updated = await api.toggleProductStock(productId)
    return updated.inStock
  }

  // ── Users ─────────────────────────────────────────────────────
  const getAllUsers = useCallback(async () => api.getAllUsers(), [])

  const deleteUser = async (userId) => {
    await api.deleteUser(userId)
  }

  // ── Coupons ───────────────────────────────────────────────────
  const getCoupons = useCallback(async () => api.getCoupons(), [])

  const addCoupon = async (couponData) => api.addCoupon(couponData)

  const deleteCoupon = async (couponId) => {
    await api.deleteCoupon(couponId)
  }

  const toggleCoupon = async (couponId) => {
    await api.toggleCoupon(couponId)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: !!user?.isAdmin,
      isLoading,
      login,
      logout,
      getAllOrders,
      getOrderById,
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
