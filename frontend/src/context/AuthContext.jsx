import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, getToken, setToken } from '../lib/api'

const AuthContext = createContext()

// Guest data kept in localStorage; synced to the account on next load.
const GUEST_KEY = 'sv_guest_profile'
const loadGuest = () => {
  try { return JSON.parse(localStorage.getItem(GUEST_KEY)) || null } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from JWT on boot
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setUser(loadGuest())
      setIsLoading(false)
      return
    }
    api.me()
      .then(setUser)
      .catch(() => {
        setToken(null)
        setUser(loadGuest())
      })
      .finally(() => setIsLoading(false))
  }, [])

  // ── Auth ──────────────────────────────────────────────────────
  const signup = async (name, email, phone, password) => {
    try {
      const { user: u, token } = await api.signup({ name, email, phone, password })
      setToken(token)
      setUser(u)
      try { localStorage.removeItem(GUEST_KEY) } catch { /* noop */ }
      return { success: true }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }

  const login = async (email, password) => {
    try {
      const { user: u, token } = await api.login({ email, password })
      setToken(token)
      setUser(u)
      try { localStorage.removeItem(GUEST_KEY) } catch { /* noop */ }
      return { success: true }
    } catch (e) {
      return { success: false, message: e.message || 'Invalid email or password' }
    }
  }

  const logout = async () => {
    setToken(null)
    setUser(null)
    try { localStorage.removeItem(GUEST_KEY) } catch { /* noop */ }
  }

  const updateProfile = async (updates) => {
    if (!user?.uid && !user?.id) return
    const id = user.uid || user.id
    // Logged-out guest: keep profile locally so checkout still works
    if (!getToken()) {
      const next = { ...user, ...updates }
      setUser(next)
      try { localStorage.setItem(GUEST_KEY, JSON.stringify(next)) } catch { /* noop */ }
      return
    }
    const updated = await api.updateMe(updates)
    setUser(updated)
  }

  const addAddress = async (address) => {
    const newAddress = { ...address, id: Date.now().toString() }
    await updateProfile({ addresses: [...(user.addresses || []), newAddress] })
  }

  const removeAddress = async (addressId) => {
    await updateProfile({ addresses: (user.addresses || []).filter(a => a.id !== addressId) })
  }

  // ── Orders ────────────────────────────────────────────────────
  // Awaited: resolves only after Postgres confirms the insert.
  // Never navigates on failure — caller shows the error instead.
  const placeOrder = async (orderData) => {
    const uid = user?.uid || user?.id || 'guest'
    const order = await api.placeOrder({
      userId: uid,
      userName: user?.name || orderData.address?.name || 'Guest',
      userEmail: user?.email || '',
      ...orderData
    }, getToken())
    return order
  }

  const getOrders = useCallback(async () => {
    if (!user) return []
    // Guest orders can't be listed without an account — tracking
    // by order ID still works via getOrderById.
    if (!getToken()) return []
    return api.getMyOrders()
  }, [user])

  const getOrderById = async (orderId) => {
    if (!orderId) return null
    try {
      return await api.getOrderById(orderId)
    } catch {
      return null
    }
  }

  // ── Catalog (public reads, cached in-memory per session) ──────
  const getProducts = useCallback(async () => api.getProducts(), [])
  const getCoupons = useCallback(async () => api.getCoupons(), [])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user && !!getToken(),
      isGuest: !!user && !getToken(),
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
      getProducts,
      getCoupons
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
