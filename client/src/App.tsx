import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'

import HomePage          from './pages/Home'
import RegisterPage      from './pages/Register'
import LoginPage         from './pages/Login'
import ProductsPage      from './pages/Products'
import ProductDetailPage from './pages/ProductDetail'
import CartPage          from './pages/Cart'
import WishlistPage      from './pages/Wishlist'
import CheckoutPage      from './pages/Checkout'
import OrdersPage        from './pages/Orders'
import ProfilePage       from './pages/Profile'
import DashboardPage     from './pages/Dashboard'
import ProductFormPage   from './pages/ProductForm'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#f0ece4',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            fontSize: '0.9rem',
          },
          success: { iconTheme: { primary: '#3ecf8e', secondary: '#0d0d0d' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#0d0d0d' } },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"             element={<HomePage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/products"     element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          <Route path="/cart"     element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders"   element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          <Route path="/dashboard"                    element={<ProtectedRoute roles={['seller','admin']}><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/new-product"        element={<ProtectedRoute roles={['seller','admin']}><ProductFormPage /></ProtectedRoute>} />
          <Route path="/dashboard/edit-product/:id"   element={<ProtectedRoute roles={['seller','admin']}><ProductFormPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
