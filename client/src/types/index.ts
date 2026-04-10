// ─── Auth / User ──────────────────────────────────────────────────────────────
export type Role = 'user' | 'seller' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  billing_details?: BillingDetails | null
  created_at?: string
}

export interface BillingDetails {
  first_name: string
  company_name?: string
  street_address: string
  apartment?: string
  city: string
  phone: string
  email?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

// ─── Product ──────────────────────────────────────────────────────────────────
export type ProductCategory =
  | 'electronics' | 'clothing' | 'books' | 'home' | 'sports'
  | 'beauty' | 'toys' | 'food' | 'automotive' | 'garden'
  | 'health' | 'jewelry' | 'music' | 'office' | 'pets' | 'tools' | 'other'

export interface ProductVariant {
  color?: string
  size?: string
  price?: number
  stock: number
  attributes?: Record<string, string>
}

export interface Product {
  id: number
  name: string
  description: string
  category: ProductCategory
  seller_id: number
  seller?: { id: number; name: string }
  images: string[]
  variants: ProductVariant[]
  base_price: number
  discount_percentage: number | null
  discount_expiry: string | null
  total_sold: number
  is_active: boolean
  created_at: string
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: number
  product_id: number
  variant_index: number
  variant_label: string | null
  quantity: number
  unit_price: number
  line_total: number
  product: Product
}

export interface CartSummary {
  items: CartItem[]
  summary: { total_items: number; total_price: number }
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export interface WishlistItem {
  id: number
  product_id: number
  product: Product
  created_at: string
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentType = 'click' | 'payme' | 'card' | 'cash'

export interface OrderItem {
  id: number
  order_id: string
  product_id: number
  product_name: string
  variant_label: string | null
  quantity: number
  base_price: number
  discount_percentage: number | null
  unit_price: number
  line_total: number
  seller_id: number
  seller_name: string
}

export interface Order {
  id: string
  user_id: number
  payment_type: PaymentType
  status: OrderStatus
  subtotal: number
  total_price: number
  billing_snapshot: BillingDetails
  notes: string | null
  items: OrderItem[]
  created_at: string
  user?: { id: number; name: string; email: string }
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface Paginated<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    total_pages: number
  }
}

// ─── Query params ─────────────────────────────────────────────────────────────
export interface ProductQuery {
  page?: number
  limit?: number
  search?: string
  category?: ProductCategory
  min_price?: number
  max_price?: number
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'most_sold'
}
