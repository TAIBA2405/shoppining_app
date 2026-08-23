import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/Toast/ToastContainer'
import AdminLayout from './pages/AdminLayout'

const AdminDashboard  = lazy(() => import('./pages/Dashboard/Dashboard'))
const AdminProducts   = lazy(() => import('./pages/Products/ProductList'))
const AdminProductForm = lazy(() => import('./pages/Products/ProductForm'))
const AdminOrders     = lazy(() => import('./pages/Orders/OrderList'))
const AdminStock      = lazy(() => import('./pages/Stock/StockPage'))
const AdminCustomers  = lazy(() => import('./pages/Customers/CustomerList'))
const AdminCoupons    = lazy(() => import('./pages/Coupons/CouponList'))
const LoginPage       = lazy(() => import('./pages/Auth/LoginPage'))

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid var(--border-color)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<Spinner />}>
          <Routes>
            {/* Login page — no layout */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin panel — wrapped in AdminLayout */}
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products"                    element={<AdminProducts />} />
              <Route path="products/new"                element={<AdminProductForm />} />
              <Route path="products/edit/:productId"    element={<AdminProductForm />} />
              <Route path="orders"                      element={<AdminOrders />} />
              <Route path="stock"                       element={<AdminStock />} />
              <Route path="customers"                   element={<AdminCustomers />} />
              <Route path="coupons"                     element={<AdminCoupons />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  )
}
