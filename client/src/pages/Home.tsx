import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, TrendingUp, Tag } from 'lucide-react'
import { productApi, cartApi, wishlistApi } from '../api'
import type { Product, WishlistItem } from '../types'
import { categoryIcons, getErrorMessage } from '../utils'
import ProductCard from '../components/common/ProductCard'
import Spinner from '../components/common/Spinner'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import styles from './Home.module.css'

const CATEGORIES = [
  'electronics','clothing','books','home','sports',
  'beauty','toys','food','automotive','garden',
  'health','jewelry','music','office','pets','tools','other',
]

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [mostSold, setMostSold] = useState<Product[]>([])
  const [discounted, setDiscounted] = useState<Product[]>([])
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [msRes, discRes] = await Promise.all([
          productApi.getMostSold(8),
          productApi.getDiscounted({ limit: 8 }),
        ])
        setMostSold(msRes.data)
        setDiscounted(discRes.data.data)
      } catch {}
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    wishlistApi.get().then(r => setWishlistIds(new Set(r.data.map((w: WishlistItem) => w.product_id)))).catch(() => {})
  }, [isAuthenticated])

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) { navigate('/login'); return }
    try {
      await cartApi.add({ product_id: product.id, quantity: 1 })
      toast.success('Added to cart')
    } catch (e) { toast.error(getErrorMessage(e)) }
  }

  const handleToggleWishlist = async (productId: number) => {
    if (!isAuthenticated) { navigate('/login'); return }
    try {
      const res = await wishlistApi.toggle(productId)
      setWishlistIds(prev => {
        const next = new Set(prev)
        res.data.action === 'added' ? next.add(productId) : next.delete(productId)
        return next
      })
      toast.success(res.data.message)
    } catch (e) { toast.error(getErrorMessage(e)) }
  }

  return (
    <div className={`page-enter ${styles.page}`}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <span className={styles.heroPill}>⬡ Premium Marketplace</span>
            <h1 className={styles.heroTitle}>
              Everything you need,<br />
              <span className={styles.heroAccent}>delivered fast.</span>
            </h1>
            <p className={styles.heroSub}>
              Millions of products from trusted sellers worldwide. Quality guaranteed.
            </p>
            <div className={styles.heroCta}>
              <Link to="/products" className="btn btn-primary btn-lg">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/products?sort=most_sold" className="btn btn-ghost btn-lg">
                Best Sellers
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroOrb} />
            <div className={styles.heroStats}>
              {[['10M+','Products'],['500K+','Sellers'],['4.9★','Rating']].map(([v,l]) => (
                <div key={l} className={styles.heroStat}>
                  <span className={styles.heroStatVal}>{v}</span>
                  <span className={styles.heroStatLabel}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Browse Categories</h2>
          </div>
          <div className={styles.categories}>
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/products?category=${cat}`} className={styles.catItem}>
                <span className={styles.catIcon}>{categoryIcons[cat]}</span>
                <span className={styles.catLabel}>{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Most Sold */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitleRow}>
              <TrendingUp size={20} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Best Sellers</h2>
            </div>
            <Link to="/products?sort=most_sold" className={styles.seeAll}>
              See all <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? <Spinner fullPage /> : (
            <div className="product-grid">
              {mostSold.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  inWishlist={wishlistIds.has(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Discounted */}
      {discounted.length > 0 && (
        <section className={`${styles.section} ${styles.sectionDark}`}>
          <div className="container">
            <div className={styles.sectionHead}>
              <div className={styles.sectionTitleRow}>
                <Tag size={20} className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Flash Deals</h2>
              </div>
              <Link to="/products/discounted" className={styles.seeAll}>
                See all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="product-grid">
              {discounted.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  inWishlist={wishlistIds.has(p.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
