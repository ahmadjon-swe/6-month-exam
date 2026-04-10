import api from './axios'
import type {
  AuthResponse, User, BillingDetails,
  Product, Paginated, ProductQuery,
  CartSummary, WishlistItem,
  Order, OrderStatus, PaymentType,
} from '../types'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<{ message: string }>('/auth/register', data),

  verifyRegister: (data: { email: string; otp: string }) =>
    api.post<{ message: string }>('/auth/verify-register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ message: string }>('/auth/login', data),

  verifyLogin: (data: { email: string; otp: string }) =>
    api.post<AuthResponse>('/auth/verify-login', data),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (data: { email: string; otp: string; new_password: string }) =>
    api.post<{ message: string }>('/auth/reset-password', data),

  refreshToken: (refresh_token: string) =>
    api.post<{ access_token: string }>('/auth/refresh-token', { refresh_token }),

  logout: () => api.post('/auth/logout'),
}

// ─── User ─────────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get<User>('/users/profile'),

  updateProfile: (data: { name?: string; password?: string }) =>
    api.put<User>('/users/profile', data),

  updateBilling: (data: BillingDetails) =>
    api.put('/users/billing', data),

  upgradeToSeller: () => api.post('/users/upgrade-to-seller'),

  listUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<Paginated<User>>('/users', { params }),

  setUserRole: (id: number, role: string) =>
    api.patch(`/users/${id}/role`, { role }),
}

// ─── Products ─────────────────────────────────────────────────────────────────
export const productApi = {
  getAll: (params?: ProductQuery) =>
    api.get<Paginated<Product>>('/products', { params }),

  getOne: (id: number) =>
    api.get<{ product: Product; related: Product[] }>(`/products/${id}`),

  getMostSold: (limit = 10) =>
    api.get<Product[]>('/products/most-sold', { params: { limit } }),

  getDiscounted: (params?: { page?: number; limit?: number }) =>
    api.get<Paginated<Product>>('/products/discounted', { params }),

  create: (data: FormData) =>
    api.post<Product>('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  update: (id: number, data: FormData) =>
    api.put<Product>(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  delete: (id: number) => api.delete(`/products/${id}`),
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const cartApi = {
  get: () => api.get<CartSummary>('/cart'),

  add: (data: { product_id: number; variant_index?: number; quantity?: number }) =>
    api.post('/cart', data),

  update: (id: number, quantity: number) =>
    api.put(`/cart/${id}`, { quantity }),

  remove: (id: number) => api.delete(`/cart/${id}`),

  clear: () => api.delete('/cart/clear'),
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlistApi = {
  get: () => api.get<WishlistItem[]>('/wishlist'),

  toggle: (product_id: number) =>
    api.post<{ action: 'added' | 'removed'; message: string }>('/wishlist', { product_id }),

  moveToCart: (productId: number, variant_index = 0) =>
    api.post(`/wishlist/move-to-cart/${productId}`, null, { params: { variant_index } }),
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderApi = {
  create: (data: {
    payment_type: PaymentType
    notes?: string
    billing: BillingDetails
  }) => api.post<Order>('/orders', data),

  getMy: (params?: { status?: OrderStatus; page?: number; limit?: number }) =>
    api.get<Paginated<Order>>('/orders', { params }),

  getAll: (params?: { status?: OrderStatus; page?: number; limit?: number }) =>
    api.get<Paginated<Order>>('/orders/all', { params }),

  getOne: (id: string) => api.get<Order>(`/orders/${id}`),

  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<Order>(`/orders/${id}/status`, { status }),
}
