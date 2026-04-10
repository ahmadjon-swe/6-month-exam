import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, Heart, ArrowLeft, Star, Package } from 'lucide-react'
import { productApi, cartApi, wishlistApi } from '../api'
import type { Product } from '../types'
import { formatPrice, getEffectivePrice, getErrorMessage, categoryIcons } from '../utils'
import ProductCard from '../components/common/ProductCard'
import Spinner from '../components/common/Spinner'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import styles from './ProductDetail.module.css'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [inWishlist, setInWishlist] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addingCart, setAddingCart] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await productApi.getOne(Number(id))
        setProduct(res.data.product)
        setRelated(res.data.related)
        setSelectedVariant(0)
        setSelectedImage(0)
      } catch { toast.error('Product not found'); navigate('/products') }
      finally { setLoading(false) }
    }
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (!isAuthenticated || !product) return
    wishlistApi.get().then(r => {
      setInWishlist(r.data.some((w: any) => w.product_id === product.id))
    }).catch(() => {})
  }, [isAuthenticated, product])

  if (loading) return <Spinner fullPage />
  if (!product) return null

  const variant = product.variants[selectedVariant]
  const effectivePrice = getEffectivePrice(product, selectedVariant)
  const hasDiscount = product.discount_percentage &&
    (!product.discount_expiry || new Date() < new Date(product.discount_expiry))
  const stock = variant?.stock ?? 0

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setAddingCart(true)
    try {
      await cartApi.add({ product_id: product.id, variant_index: selectedVariant, quantity })
      toast.success('Added to cart!')
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setAddingCart(false) }
  }

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    try {
      const res = await wishlistApi.toggle(product.id)
      setInWishlist(res.data.action === 'added')
      toast.success(res.data.message)
    } catch (e) { toast.error(getErrorMessage(e)) }
  }

  return (
    <div className="page-enter">
      <div className="container">
        <button className={styles.back} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className={styles.grid}>
          {/* Images */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              {product.images[selectedImage] ? (
                <img src={product.images[selectedImage]} alt={product.name} />
              ) : (
                <div className={styles.noImage}><Package size={64} /></div>
              )}
              {hasDiscount && (
                <span className={styles.discountBadge}>-{product.discount_percentage}%</span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, i) => (
                  <button key={i}
                    className={`${styles.thumb} ${selectedImage === i ? styles.thumbActive : ''}`}
                    onClick={() => setSelectedImage(i)}>
                    <img src={img} alt={`${product.name} ${i+1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div className={styles.categoryRow}>
              <span className="badge badge-accent">
                {categoryIcons[product.category]} {product.category}
              </span>
              {product.seller && (
                <span className={styles.seller}>by {product.seller.name}</span>
              )}
            </div>

            <h1 className={styles.name}>{product.name}</h1>

            <div className={styles.statsRow}>
              <span className={styles.sold}><Star size={13} /> {product.total_sold} sold</span>
              <span className={`${styles.stock} ${stock === 0 ? styles.outOfStock : ''}`}>
                {stock === 0 ? 'Out of stock' : `${stock} in stock`}
              </span>
            </div>

            {/* Price */}
            <div className={styles.priceBlock}>
              <span className={styles.price}>{formatPrice(effectivePrice)}</span>
              {hasDiscount && (
                <div className={styles.discountInfo}>
                  <span className={styles.originalPrice}>{formatPrice(Number(product.base_price))}</span>
                  <span className={styles.saving}>Save {product.discount_percentage}%</span>
                </div>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div className={styles.variants}>
                <h4 className={styles.variantTitle}>Options</h4>
                <div className={styles.variantList}>
                  {product.variants.map((v, i) => {
                    const label = [v.color, v.size].filter(Boolean).join(' / ') || `Option ${i+1}`
                    const vPrice = v.price ?? Number(product.base_price)
                    return (
                      <button key={i}
                        className={`${styles.variantBtn} ${selectedVariant === i ? styles.variantActive : ''} ${v.stock === 0 ? styles.variantOos : ''}`}
                        onClick={() => { setSelectedVariant(i); setQuantity(1) }}
                        disabled={v.stock === 0}>
                        <span>{label}</span>
                        <span className={styles.variantPrice}>{formatPrice(vPrice)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className={styles.qtyRow}>
              <span className={styles.qtyLabel}>Qty</span>
              <div className={styles.qtyControls}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(stock, q + 1))} disabled={quantity >= stock}>+</button>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button
                className={`btn btn-primary btn-lg ${styles.cartBtn}`}
                onClick={handleAddToCart}
                disabled={stock === 0 || addingCart}>
                {addingCart ? <span className="spinner" /> : <><ShoppingCart size={18} /> Add to Cart</>}
              </button>
              <button
                className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlisted : ''}`}
                onClick={handleToggleWishlist}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Description */}
            <div className={styles.description}>
              <h4>Description</h4>
              <p>{product.description}</p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>Related Products</h2>
            <div className="product-grid">
              {related.slice(0, 8).map(p => (
                <ProductCard key={p.id} product={p}
                  onAddToCart={async (prod) => {
                    if (!isAuthenticated) { navigate('/login'); return }
                    await cartApi.add({ product_id: prod.id, quantity: 1 })
                    toast.success('Added to cart')
                  }} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
