import { createContext, useContext, useState, useEffect } from 'react'
import { getStoredData, setStoredData } from '../utils/helpers'

const WishlistContext = createContext()

const STORAGE_KEY = 'styleverse_wishlist'

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const saved = getStoredData(STORAGE_KEY, [])
    setItems(saved)
  }, [])

  useEffect(() => {
    setStoredData(STORAGE_KEY, items)
  }, [items])

  const addItem = (product) => {
    if (!items.find(item => item.id === product.id)) {
      setItems(prev => [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0],
        category: product.category
      }])
    }
  }

  const removeItem = (productId) => {
    setItems(prev => prev.filter(item => item.id !== productId))
  }

  const toggleItem = (product) => {
    if (isInWishlist(product.id)) {
      removeItem(product.id)
    } else {
      addItem(product)
    }
  }

  const isInWishlist = (productId) => {
    return items.some(item => item.id === productId)
  }

  const clearWishlist = () => setItems([])

  return (
    <WishlistContext.Provider value={{
      items,
      itemCount: items.length,
      addItem,
      removeItem,
      toggleItem,
      isInWishlist,
      clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
