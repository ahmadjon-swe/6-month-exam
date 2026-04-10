import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { wishlistApi, cartApi } from '../api'
import type { WishlistItem } from '../types'
import { formatPrice, getEffectivePrice, getErrorMessage } from '../utils'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'
import styles from './Wishlist.module.css'

export default function WishlistPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  const fetch = async () => {
    try { const r = await wishlistApi.get(); setItems(r.data) }
    catch { toast.error('Failed to load wishlist') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleRemove = async (productId: number) => {
    setBusyId(productId)
    try {
      await wishlistApi.toggle(productId)
      toast.success('Removed from wishlist')
      setItems(prev => prev.filter(i => i.product_id !== productId))
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setBusyId(null) }
  }

  const handleMoveToCart = async (productId: number) => {
    setBusyId(productId)
    try {
      await wishlistApi.moveToCart(productId)
      toast.success('Moved to cart!')
      setItems(prev => prev.filter(i => i.product_id !== productId))
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setBusyId(null) }
  }

  if (loading) return <Spinner fullPage />

  if (items.length === 0) return (
    <div className={styles.empty}>
      <Heart size={64} />
      <h2>Your wishlist is empty</h2>
      <p>Save products you love to buy them later</p>
      <Link to="/products" className="btn btn-primary">Browse Products</Link>
    </div>
  )

  return (
    <div className="page-enter">
      <div className="container">
        <h1 className={styles.title}>My Wishlist <span>({items.length})</span></h1>
        <div className={styles.grid}>
          {items.map(item => {
            const p = item.product
            const price = getEffectivePrice(p)
            const hasDiscount = p.discount_percentage &&
              (!p.discount_expiry || new Date() < new Date(p.discount_expiry))
            const busy = busyId === item.product_id

            return (
              <div key={item.id} className={`card ${styles.card}`}>
                <Link to={`/products/${p.id}`} className={styles.imageWrap}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} />
                    : <span className={styles.placeholder}>📦</span>}
                  {hasDiscount && (
                    <span className={styles.discBadge}>-{p.discount_percentage}%</span>
                  )}
                </Link>
                <div className={styles.body}>
                  <Link to={`/products/${p.id}`} className={styles.name}>{p.name}</Link>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>{formatPrice(price)}</span>
                    {hasDiscount && (
                      <span className={styles.original}>{formatPrice(Number(p.base_price))}</span>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleMoveToCart(item.product_id)}
                      disabled={busy}
                    >
                      {busy ? <span className="spinner" /> : <><ShoppingCart size={14} /> Move to Cart</>}
                    </button>
                    <button
                      className={`btn btn-danger btn-sm ${styles.removeBtn}`}
                      onClick={() => handleRemove(item.product_id)}
                      disabled={busy}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
