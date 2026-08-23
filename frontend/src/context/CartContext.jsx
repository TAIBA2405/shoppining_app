import { createContext, useContext, useReducer, useEffect } from 'react'
import { getStoredData, setStoredData } from '../utils/helpers'

const CartContext = createContext()

const STORAGE_KEY = 'styleverse_cart'

const initialState = {
  items: [],
  coupon: null,
  couponDiscount: 0
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        item => item.id === action.payload.id &&
                item.selectedSize === action.payload.selectedSize &&
                item.selectedColor === action.payload.selectedColor
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            item === existing
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      }
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((_, i) => i !== action.payload)
      }

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item, i) =>
          i === action.payload.index
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        )
      }

    case 'APPLY_COUPON':
      return {
        ...state,
        coupon: action.payload.coupon,
        couponDiscount: action.payload.discount
      }

    case 'REMOVE_COUPON':
      return {
        ...state,
        coupon: null,
        couponDiscount: 0
      }

    case 'CLEAR_CART':
      return { ...initialState }

    case 'LOAD_CART':
      return { ...state, ...action.payload }

    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = getStoredData(STORAGE_KEY)
    if (saved) {
      dispatch({ type: 'LOAD_CART', payload: saved })
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    setStoredData(STORAGE_KEY, state)
  }, [state])

  const addItem = (product, selectedSize, selectedColor, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0],
        selectedSize,
        selectedColor,
        quantity
      }
    })
  }

  const removeItem = (index) => {
    dispatch({ type: 'REMOVE_ITEM', payload: index })
  }

  const updateQuantity = (index, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } })
  }

  const applyCoupon = (coupon, discount) => {
    dispatch({ type: 'APPLY_COUPON', payload: { coupon, discount } })
  }

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const shipping = subtotal >= 499 ? 0 : 99
  const total = subtotal - state.couponDiscount + shipping

  return (
    <CartContext.Provider value={{
      items: state.items,
      coupon: state.coupon,
      couponDiscount: state.couponDiscount,
      subtotal,
      shipping,
      total,
      itemCount,
      addItem,
      removeItem,
      updateQuantity,
      applyCoupon,
      removeCoupon,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
