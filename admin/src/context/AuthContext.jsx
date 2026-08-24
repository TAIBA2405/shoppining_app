import { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile as fbUpdateProfile
} from 'firebase/auth'
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, query, orderBy, where,
  writeBatch
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import productsData from '../data/products.json'
import couponsData from '../data/coupons.json'

const AuthContext = createContext()

// ── One-time seed: products + coupons + admin account ─────────
async function seedIfEmpty() {
  try {
    // Seed products
    const prodSnap = await getDocs(collection(db, 'products'))
    if (prodSnap.empty) {
      const batch = writeBatch(db)
      productsData.products.forEach(p => {
        batch.set(doc(db, 'products', p.id), { ...p, createdAt: new Date().toISOString() })
      })
      await batch.commit()
      console.log('✅ Products seeded')
    }

    // Seed coupons
    const couponSnap = await getDocs(collection(db, 'coupons'))
    if (couponSnap.empty) {
      const batch = writeBatch(db)
      couponsData.coupons.forEach((c, i) => {
        const id = `coupon-${i + 1}`
        batch.set(doc(db, 'coupons', id), { ...c, id, isActive: true })
      })
      await batch.commit()
      console.log('✅ Coupons seeded')
    }

    // Seed admin user in Firestore (Firebase Auth account must exist)
    const adminDoc = await getDoc(doc(db, 'users', 'admin-001'))
    if (!adminDoc.exists()) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, 'admin@styleverse.com', 'admin123')
        await fbUpdateProfile(cred.user, { displayName: 'Admin' })
        await setDoc(doc(db, 'users', cred.user.uid), {
          name: 'Admin',
          email: 'admin@styleverse.com',
          phone: '9999999999',
          isAdmin: true,
          addresses: [],
          createdAt: new Date().toISOString()
        })
        console.log('✅ Admin account created')
      } catch (e) {
        // Admin account already exists in Firebase Auth — that's fine
        if (e.code !== 'auth/email-already-in-use') {
          console.warn('Admin seed error:', e)
        }
      }
    }
  } catch (e) {
    console.warn('Seed error:', e)
  }
}

seedIfEmpty()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          // Only allow admin users into admin panel
          if (data.isAdmin) {
            setUser({ uid: firebaseUser.uid, ...data })
          } else {
            await signOut(auth)
            setUser(null)
          }
        } else {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email })
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })
    return unsub
  }, [])

  // ── Auth ──────────────────────────────────────────────────────
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

  // ── Orders ────────────────────────────────────────────────────
  const getAllOrders = async () => {
    const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
    return snap.docs.map(d => d.data())
  }

  const getOrderById = async (orderId) => {
    const snap = await getDoc(doc(db, 'orders', orderId))
    return snap.exists() ? snap.data() : null
  }

  const updateOrderStatus = async (orderId, status) => {
    const orderRef = doc(db, 'orders', orderId)
    const snap = await getDoc(orderRef)
    if (!snap.exists()) return
    const order = snap.data()
    const history = [...(order.statusHistory || []), { status, date: new Date().toISOString() }]
    await updateDoc(orderRef, { status, statusHistory: history })
  }

  const deleteOrder = async (orderId) => {
    await deleteDoc(doc(db, 'orders', orderId))
  }

  // ── Products ──────────────────────────────────────────────────
  const getProducts = async () => {
    const snap = await getDocs(collection(db, 'products'))
    return snap.docs.map(d => d.data())
  }

  const addProduct = async (productData) => {
    const id = 'p' + Date.now().toString().slice(-6)
    const newProduct = {
      id,
      rating: 0,
      reviewCount: 0,
      isNew: true,
      isFeatured: false,
      tags: [],
      inStock: true,
      ...productData,
      createdAt: new Date().toISOString()
    }
    await setDoc(doc(db, 'products', id), newProduct)
    return newProduct
  }

  const updateProduct = async (productId, updates) => {
    await updateDoc(doc(db, 'products', productId), updates)
  }

  const deleteProduct = async (productId) => {
    await deleteDoc(doc(db, 'products', productId))
  }

  const toggleProductStock = async (productId) => {
    const ref = doc(db, 'products', productId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    const newStock = !snap.data().inStock
    await updateDoc(ref, { inStock: newStock })
    return newStock
  }

  // ── Users ─────────────────────────────────────────────────────
  const getAllUsers = async () => {
    const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
    return snap.docs
      .map(d => ({ uid: d.id, ...d.data() }))
      .filter(u => !u.isAdmin)
  }

  const deleteUser = async (userId) => {
    await deleteDoc(doc(db, 'users', userId))
  }

  // ── Coupons ───────────────────────────────────────────────────
  const getCoupons = async () => {
    const snap = await getDocs(collection(db, 'coupons'))
    return snap.docs.map(d => d.data())
  }

  const addCoupon = async (couponData) => {
    const id = 'coupon-' + Date.now()
    const newCoupon = {
      id,
      isActive: true,
      ...couponData,
      code: couponData.code.toUpperCase().trim()
    }
    await setDoc(doc(db, 'coupons', id), newCoupon)
    return newCoupon
  }

  const deleteCoupon = async (couponId) => {
    await deleteDoc(doc(db, 'coupons', couponId))
  }

  const toggleCoupon = async (couponId) => {
    const ref = doc(db, 'coupons', couponId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      await updateDoc(ref, { isActive: !snap.data().isActive })
    }
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
