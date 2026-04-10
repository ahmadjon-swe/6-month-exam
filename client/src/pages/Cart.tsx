import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react'
import { cartApi } from '../api'
import type { CartSummary } from '../types'
import { formatPrice, getErrorMessage } from '../utils'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'
import styles from './Cart.module.css'

export default function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const fetchCart = async () => {
    try {
      const res = await cartApi.get()
      setCart(res.data)
    } catch { toast.error('Failed to load cart') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCart() }, [])

  const handleUpdate = async (id: number, quantity: number) => {
    setUpdatingId(id)
    try {
      await cartApi.update(id, quantity)
      await fetchCart()
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setUpdatingId(null) }
  }

  const handleRemove = async (id: number) => {
    setUpdatingId(id)
    try {
      await cartApi.remove(id)
      toast.success('Item removed')
      await fetchCart()
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setUpdatingId(null) }
  }

  const handleClear = async () => {
    if (!confirm('Clear entire cart?')) return
    try { await cartApi.clear(); toast.success('Cart cleared'); await fetchCart() }
    catch (e) { toast.error(getErrorMessage(e)) }
  }

  if (loading) return <Spinner fullPage />

  const items = cart?.items ?? []
  const summary = cart?.summary

  if (items.length === 0) return (
    <div className={styles.empty}>
      <ShoppingBag size={64} />
      <h2>Your cart is empty</h2>
      <p>Add some products to get started</p>
      <Link to="/products" className="btn btn-primary">Browse Products</Link>
    </div>
  )

  return (
    <div className="page-enter">
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Shopping Cart <span className={styles.count}>({items.length} items)</span></h1>
          <button className="btn btn-danger btn-sm" onClick={handleClear}>Clear Cart</button>
        </div>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.items}>
            {items.map(item => (
              <div key={item.id} className={`card ${styles.item}`}>
                <Link to={`/products/${item.product_id}`} className={styles.itemImage}>
                  {item.product?.images?.[0]
                    ? <img src={item.product.images[0]} alt={item.product.name} />
                    : <span>📦</span>}
                </Link>
                <div className={styles.itemInfo}>
                  <Link to={`/products/${item.product_id}`} className={styles.itemName}>
                    {item.product?.name}
                  </Link>
                  {item.variant_label && (
                    <span className={styles.itemVariant}>{item.variant_label}</span>
                  )}
                  <span className={styles.itemPrice}>{formatPrice(item.unit_price)}</span>
                </div>
                <div className={styles.itemControls}>
                  <div className={styles.qty}>
                    <button onClick={() => handleUpdate(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updatingId === item.id}>
                      <Minus size={14} />
                    </button>
                    <span>{updatingId === item.id ? '…' : item.quantity}</span>
                    <button onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      disabled={updatingId === item.id}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className={styles.lineTotal}>{formatPrice(item.line_total)}</span>
                  <button className={styles.removeBtn} onClick={() => handleRemove(item.id)}
                    disabled={updatingId === item.id}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={`card ${styles.summary}`}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <div className={styles.summaryRow}>
              <span>Subtotal ({summary?.total_items} items)</span>
              <span>{formatPrice(summary?.total_price ?? 0)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span className={styles.free}>Free</span>
            </div>
            <hr className="divider" />
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total</span>
              <span>{formatPrice(summary?.total_price ?? 0)}</span>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }}
              onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
            <Link to="/products" className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 8 }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
