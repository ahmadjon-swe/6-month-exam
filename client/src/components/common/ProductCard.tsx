import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { formatPrice, getEffectivePrice } from '../../utils'
import type { Product } from '../../types'
import styles from './ProductCard.module.css'

interface Props {
  product: Product
  onAddToCart?: (product: Product) => void
  onToggleWishlist?: (productId: number) => void
  inWishlist?: boolean
}

export default function ProductCard({ product, onAddToCart, onToggleWishlist, inWishlist }: Props) {
  const effectivePrice = getEffectivePrice(product)
  const hasDiscount = product.discount_percentage &&
    (!product.discount_expiry || new Date() < new Date(product.discount_expiry))

  const imageUrl = product.images?.[0] ?? null

  return (
    <div className={styles.card}>
      <Link to={`/products/${product.id}`} className={styles.imageWrap}>
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>📦</span>
          </div>
        )}
        {hasDiscount && (
          <span className={styles.discountBadge}>-{product.discount_percentage}%</span>
        )}
      </Link>

      <div className={styles.body}>
        <Link to={`/products/${product.id}`} className={styles.name}>{product.name}</Link>

        {product.seller && (
          <span className={styles.seller}>by {product.seller.name}</span>
        )}

        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(effectivePrice)}</span>
          {hasDiscount && (
            <span className={styles.originalPrice}>{formatPrice(Number(product.base_price))}</span>
          )}
        </div>

        <div className={styles.meta}>
          <span className={styles.sold}>
            <Star size={11} /> {product.total_sold} sold
          </span>
          <span className={`badge badge-accent ${styles.categoryBadge}`}>{product.category}</span>
        </div>

        <div className={styles.actions}>
          <button
            className={`btn btn-primary btn-sm ${styles.cartBtn}`}
            onClick={() => onAddToCart?.(product)}
          >
            <ShoppingCart size={14} /> Add
          </button>
          <button
            className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlisted : ''}`}
            onClick={() => onToggleWishlist?.(product.id)}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  )
}
