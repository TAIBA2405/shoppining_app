import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import ToastContainer from './components/Toast/ToastContainer'
import Home from './pages/Home/Home'

// Lazy-load pages that aren't needed on initial load
import { lazy, Suspense } from 'react'

const CategoryPage = lazy(() => import('./pages/Category/CategoryPage'))
const ProductDetail = lazy(() => import('./pages/Product/ProductDetail'))
const CartPage = lazy(() => import('./pages/Cart/CartPage'))
const WishlistPage = lazy(() => import('./pages/Wishlist/WishlistPage'))
const CheckoutPage = lazy(() => import('./pages/Checkout/CheckoutPage'))
const OrderConfirmation = lazy(() => import('./pages/Checkout/OrderConfirmation'))
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'))
const SignupPage = lazy(() => import('./pages/Auth/SignupPage'))
const AccountPage = lazy(() => import('./pages/Account/AccountPage'))
const OrderTracking = lazy(() => import('./pages/Account/OrderTracking'))
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/Admin/Products/ProductList'))
const AdminProductForm = lazy(() => import('./pages/Admin/Products/ProductForm'))
const AdminOrders = lazy(() => import('./pages/Admin/Orders/OrderList'))
const AdminStock = lazy(() => import('./pages/Admin/Stock/StockPage'))

function LoadingFallback() {
  return (
    <div className="page" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-4)'
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Loading...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            <Navbar />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Storefront */}
                <Route path="/" element={<Home />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />

                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Account */}
                <Route path="/account" element={<AccountPage />} />
                <Route path="/account/orders" element={<AccountPage />} />
                <Route path="/order-tracking/:orderId" element={<OrderTracking />} />

                {/* Admin */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/new" element={<AdminProductForm />} />
                <Route path="/admin/products/edit/:productId" element={<AdminProductForm />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/stock" element={<AdminStock />} />

                {/* 404 */}
                <Route path="*" element={
                  <div className="page" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    textAlign: 'center',
                    padding: 'var(--space-6)'
                  }}>
                    <h1 style={{ fontSize: 'var(--text-7xl)', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>404</h1>
                    <p style={{ fontSize: 'var(--text-xl)', color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
                      Oops! This page doesn't exist.
                    </p>
                    <a href="/" className="btn btn-primary btn-lg">Back to Home</a>
                  </div>
                } />
              </Routes>
            </Suspense>
            <Footer />
            <ToastContainer />
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
