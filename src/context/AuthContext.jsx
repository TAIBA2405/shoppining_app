import { createContext, useContext, useState, useEffect } from 'react'
import { getStoredData, setStoredData, generateId } from '../utils/helpers'

const AuthContext = createContext()

const STORAGE_KEY = 'styleverse_auth'
const USERS_KEY = 'styleverse_users'
const ORDERS_KEY = 'styleverse_orders'

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
      password, // In production, this would be hashed
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

  // Order management
  const placeOrder = (orderData) => {
    const orders = getStoredData(ORDERS_KEY, [])
    const newOrder = {
      id: 'ORD' + Date.now().toString().slice(-8),
      userId: user?.id || 'guest',
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
      orders[index].statusHistory.push({
        status,
        date: new Date().toISOString()
      })
      setStoredData(ORDERS_KEY, orders)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
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
      updateOrderStatus
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
