import { createContext, useContext, useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile
} from 'firebase/auth'
import {
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, query,
  where, orderBy, deleteDoc, serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import productsData from '../data/products.json'

const AuthContext = createContext()

// ── Seed products into Firestore once ─────────────────────────
async function seedProductsIfEmpty() {
  try {
    const snap = await getDocs(collection(db, 'products'))
    if (snap.empty) {
      const batch = productsData.products.map(p =>
        setDoc(doc(db, 'products', p.id), { ...p, createdAt: new Date().toISOString() })
      )
      await Promise.all(batch)
      console.log('Products seeded to Firestore')
    }
  } catch (e) {
    console.warn('Seed products failed:', e)
  }
}

seedProductsIfEmpty()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Set user immediately from Auth data — don't wait for Firestore
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || '',
          isAdmin: false
        })
        setIsLoading(false)

        // Enrich with Firestore profile data in the background
        getDoc(doc(db, 'users', firebaseUser.uid))
          .then(userDoc => {
            if (userDoc.exists()) {
              setUser(prev => ({ ...prev, ...userDoc.data(), uid: firebaseUser.uid }))
            }
          })
          .catch(e => console.warn('Firestore profile fetch failed:', e))
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })
    return unsub
  }, [])

  // ── Auth ──────────────────────────────────────────────────────
  const signup = async (name, email, phone, password) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await fbUpdateProfile(cred.user, { displayName: name })
      const userData = {
        name,
        email,
        phone: phone || '',
        isAdmin: false,
        addresses: [],
        createdAt: new Date().toISOString()
      }
      // Write to Firestore in background — don't await it
      setDoc(doc(db, 'users', cred.user.uid), userData).catch(e =>
        console.warn('Firestore write failed:', e)
      )
      return { success: true }
    } catch (e) {
      console.error('Signup error:', e.code, e.message)
      const msg = e.code === 'auth/email-already-in-use'
        ? 'Email already registered'
        : e.code === 'auth/weak-password'
          ? 'Password must be at least 6 characters'
          : e.code === 'auth/invalid-email'
          ? 'Invalid email address'
          : e.code === 'auth/operation-not-allowed'
          ? 'Email signup is not enabled'
          : e.code === 'auth/network-request-failed'
          ? 'Network error. Check your connection.'
          : `Signup failed: ${e.message}`
      return { success: false, message: msg }
    }
  }

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (e) {
      return { success: false, message: 'Invalid email or password' }
    }
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  const updateProfile = async (updates) => {
    if (!user?.uid) return
    await updateDoc(doc(db, 'users', user.uid), updates)
    setUser(prev => ({ ...prev, ...updates }))
  }

  const addAddress = async (address) => {
    const newAddress = { ...address, id: Date.now().toString() }
    const updated = [...(user.addresses || []), newAddress]
    await updateProfile({ addresses: updated })
  }

  const removeAddress = async (addressId) => {
    const updated = (user.addresses || []).filter(a => a.id !== addressId)
    await updateProfile({ addresses: updated })
  }

  // ── Orders ────────────────────────────────────────────────────
  const placeOrder = async (orderData) => {
    const orderId = 'ORD' + Date.now().toString().slice(-8)
    const newOrder = {
      id: orderId,
      userId: user?.uid || 'guest',
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
    await setDoc(doc(db, 'orders', orderId), newOrder)
    return newOrder
  }

  const getOrders = async () => {
    if (!user?.uid) return []
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => d.data())
  }

  const getOrderById = async (orderId) => {
    const snap = await getDoc(doc(db, 'orders', orderId))
    return snap.exists() ? snap.data() : null
  }

  // ── Products (read-only for frontend) ────────────────────────
  const getProducts = async () => {
    const snap = await getDocs(collection(db, 'products'))
    return snap.docs.map(d => d.data())
  }

  // ── Coupons ───────────────────────────────────────────────────
  const getCoupons = async () => {
    const snap = await getDocs(collection(db, 'coupons'))
    return snap.docs.map(d => d.data())
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
