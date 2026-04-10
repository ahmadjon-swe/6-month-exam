import type { Product, ProductVariant, OrderStatus } from '../types'

export const getEffectivePrice = (product: Product, variantIndex = 0): number => {
  const variant: ProductVariant | undefined = product.variants?.[variantIndex]
  const base = variant?.price ?? Number(product.base_price)
  const disc = product.discount_percentage ? Number(product.discount_percentage) : 0
  const active = disc > 0 && (!product.discount_expiry || new Date() < new Date(product.discount_expiry))
  return active ? base * (1 - disc / 100) : base
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export const formatDate = (s: string) =>
  new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

export const getImageUrl = (path: string) =>
  path.startsWith('http') ? path : path

export const statusBadgeClass = (s: OrderStatus) => ({
  pending:   'badge-warning',
  paid:      'badge-info',
  shipped:   'badge-accent',
  delivered: 'badge-success',
  cancelled: 'badge-error',
}[s] ?? 'badge-info')

export const categoryIcons: Record<string, string> = {
  electronics: '💻', clothing: '👕', books: '📚', home: '🏠',
  sports: '⚽', beauty: '💄', toys: '🧸', food: '🍎',
  automotive: '🚗', garden: '🌿', health: '💊', jewelry: '💎',
  music: '🎵', office: '🖊️', pets: '🐾', tools: '🔧', other: '📦',
}

export const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as any).response
    return r?.data?.message ?? 'Something went wrong'
  }
  return 'Something went wrong'
}
