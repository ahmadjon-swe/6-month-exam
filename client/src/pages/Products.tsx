import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { productApi, cartApi, wishlistApi } from '../api'
import type { Product, ProductQuery, WishlistItem } from '../types'
import { categoryIcons, getErrorMessage } from '../utils'
import ProductCard from '../components/common/ProductCard'
import Pagination from '../components/common/Pagination'
import Spinner from '../components/common/Spinner'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import styles from './Products.module.css'

const CATEGORIES = [
  'electronics','clothing','books','home','sports','beauty',
  'toys','food','automotive','garden','health','jewelry',
  'music','office','pets','tools','other',
]
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'most_sold', label: 'Best Selling' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
]

export default function ProductsPage() {
  const { isAuthenticated } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const page = parseInt(searchParams.get('page') ?? '1')
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const sort = (searchParams.get('sort') ?? 'newest') as ProductQuery['sort']
  const minPrice = searchParams.get('min_price') ?? ''
  const maxPrice = searchParams.get('max_price') ?? ''

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: ProductQuery = { page, limit: 24, sort }
      if (search) params.search = search
      if (category) params.category = category as any
      if (minPrice) params.min_price = Number(minPrice)
      if (maxPrice) params.max_price = Number(maxPrice)
      const res = await productApi.getAll(params)
      setProducts(res.data.data)
      setTotalPages(res.data.pagination.total_pages)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [page, search, category, sort, minPrice, maxPrice])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    if (!isAuthenticated) return
    wishlistApi.get().then(r => setWishlistIds(new Set(r.data.map((w: WishlistItem) => w.product_id)))).catch(() => {})
  }, [isAuthenticated])

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) { toast.error('Please login first'); return }
    try { await cartApi.add({ product_id: product.id, quantity: 1 }); toast.success('Added to cart') }
    catch (e) { toast.error(getErrorMessage(e)) }
  }

  const handleToggleWishlist = async (productId: number) => {
    if (!isAuthenticated) { toast.error('Please login first'); return }
    try {
      const res = await wishlistApi.toggle(productId)
      setWishlistIds(prev => { const n = new Set(prev); res.data.action === 'added' ? n.add(productId) : n.delete(productId); return n })
      toast.success(res.data.message)
    } catch (e) { toast.error(getErrorMessage(e)) }
  }

  return (
    <div className="page-enter">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {category ? `${categoryIcons[category] ?? ''} ${category}` : search ? `Results for "${search}"` : 'All Products'}
            </h1>
            {!loading && <p className={styles.count}>{products.length} products found</p>}
          </div>
          <button className={`btn btn-secondary btn-sm ${styles.filterToggle}`} onClick={() => setShowFilters(v => !v)}>
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>

        <div className={styles.layout}>
          {/* Sidebar filters */}
          <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHead}>
              <span className={styles.sidebarTitle}>Filters</span>
              <button onClick={() => setShowFilters(false)} className={styles.closeSidebar}><X size={18} /></button>
            </div>

            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Category</h4>
              <div className={styles.catList}>
                <button className={`${styles.catBtn} ${!category ? styles.catActive : ''}`}
                  onClick={() => setParam('category', '')}>All</button>
                {CATEGORIES.map(c => (
                  <button key={c} className={`${styles.catBtn} ${category === c ? styles.catActive : ''}`}
                    onClick={() => setParam('category', c)}>
                    {categoryIcons[c]} {c}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Price Range</h4>
              <div className={styles.priceInputs}>
                <input placeholder="Min" type="number" value={minPrice}
                  onChange={e => setParam('min_price', e.target.value)} />
                <span>—</span>
                <input placeholder="Max" type="number" value={maxPrice}
                  onChange={e => setParam('max_price', e.target.value)} />
              </div>
            </div>

            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Sort By</h4>
              <div className={styles.sortList}>
                {SORTS.map(s => (
                  <button key={s.value}
                    className={`${styles.sortBtn} ${sort === s.value ? styles.sortActive : ''}`}
                    onClick={() => setParam('sort', s.value)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {(category || minPrice || maxPrice) && (
              <button className="btn btn-ghost btn-sm" style={{ width: '100%' }}
                onClick={() => setSearchParams(new URLSearchParams())}>
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Products grid */}
          <div className={styles.main}>
            {loading ? <Spinner fullPage /> : products.length === 0 ? (
              <div className={styles.empty}>
                <span>🔍</span>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term</p>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map(p => (
                    <ProductCard key={p.id} product={p}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      inWishlist={wishlistIds.has(p.id)} />
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages}
                  onChange={p => setParam('page', String(p))} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
