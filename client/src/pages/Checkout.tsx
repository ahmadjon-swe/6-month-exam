import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { cartApi, orderApi, userApi } from '../api'
import type { CartSummary, BillingDetails, PaymentType } from '../types'
import { formatPrice, getErrorMessage } from '../utils'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'
import styles from './Checkout.module.css'

const PAYMENT_OPTIONS: { value: PaymentType; label: string; icon: string }[] = [
  { value: 'card',  label: 'Credit / Debit Card', icon: '💳' },
  { value: 'click', label: 'Click',                icon: '📱' },
  { value: 'payme', label: 'Payme',                icon: '💸' },
  { value: 'cash',  label: 'Cash on Delivery',     icon: '💵' },
]

const emptyBilling: BillingDetails = {
  first_name: '', company_name: '', street_address: '',
  apartment: '', city: '', phone: '', email: '',
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [billing, setBilling] = useState<BillingDetails>(emptyBilling)
  const [paymentType, setPaymentType] = useState<PaymentType>('card')
  const [notes, setNotes] = useState('')
  const [ordered, setOrdered] = useState(false)
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        const [cartRes, profileRes] = await Promise.all([
          cartApi.get(),
          userApi.getProfile(),
        ])
        setCart(cartRes.data)
        if (profileRes.data.billing_details) {
          setBilling({ ...emptyBilling, ...profileRes.data.billing_details })
        }
      } catch { toast.error('Failed to load checkout') }
      finally { setLoading(false) }
    }
    init()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cart?.items?.length) { toast.error('Your cart is empty'); return }
    setSubmitting(true)
    try {
      const res = await orderApi.create({ payment_type: paymentType, billing, notes: notes || undefined })
      setOrderId(res.data.id)
      setOrdered(true)
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setSubmitting(false) }
  }

  const set = (field: keyof BillingDetails) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBilling(b => ({ ...b, [field]: e.target.value }))

  if (loading) return <Spinner fullPage />

  if (ordered) return (
    <div className={styles.success}>
      <div className={styles.successCard}>
        <CheckCircle size={64} className={styles.successIcon} />
        <h1>Order Placed!</h1>
        <p>Your order <span className={styles.orderId}>#{orderId.slice(0, 8)}</span> has been placed successfully.</p>
        <div className={styles.successActions}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/orders')}>View My Orders</button>
          <button className="btn btn-ghost" onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  )

  if (!cart?.items?.length) return (
    <div className={styles.success}>
      <div className={styles.successCard}>
        <h2>Your cart is empty</h2>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
      </div>
    </div>
  )

  return (
    <div className="page-enter">
      <div className="container">
        <h1 className={styles.title}>Checkout</h1>
        <form onSubmit={handleSubmit} className={styles.layout}>

          {/* Left: billing + payment */}
          <div className={styles.left}>
            {/* Billing */}
            <div className="card">
              <h2 className={styles.sectionTitle}>Billing Details</h2>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input required placeholder="John" value={billing.first_name} onChange={set('first_name')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company (optional)</label>
                  <input placeholder="Acme Inc." value={billing.company_name} onChange={set('company_name')} />
                </div>
                <div className={`form-group ${styles.fullWidth}`}>
                  <label className="form-label">Street Address *</label>
                  <input required placeholder="123 Main St" value={billing.street_address} onChange={set('street_address')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Apartment / Suite</label>
                  <input placeholder="Apt 4B" value={billing.apartment} onChange={set('apartment')} />
                </div>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input required placeholder="Tashkent" value={billing.city} onChange={set('city')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input required placeholder="+998901234567" value={billing.phone} onChange={set('phone')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email (optional)</label>
                  <input type="email" placeholder="you@example.com" value={billing.email} onChange={set('email')} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card">
              <h2 className={styles.sectionTitle}>Payment Method</h2>
              <div className={styles.paymentOptions}>
                {PAYMENT_OPTIONS.map(opt => (
                  <label key={opt.value} className={`${styles.paymentOption} ${paymentType === opt.value ? styles.paymentActive : ''}`}>
                    <input
                      type="radio" name="payment" value={opt.value}
                      checked={paymentType === opt.value}
                      onChange={() => setPaymentType(opt.value)}
                    />
                    <span className={styles.paymentIcon}>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="card">
              <h2 className={styles.sectionTitle}>Order Notes (optional)</h2>
              <textarea
                placeholder="Any special instructions for your order…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{ resize: 'vertical', width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontFamily: 'var(--font-main)', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>
          </div>

          {/* Right: order summary */}
          <div className={styles.right}>
            <div className={`card ${styles.summaryCard}`}>
              <h2 className={styles.sectionTitle}>Order Summary</h2>
              <div className={styles.cartItems}>
                {cart.items.map(item => (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.cartItemImg}>
                      {item.product?.images?.[0]
                        ? <img src={item.product.images[0]} alt={item.product.name} />
                        : <span>📦</span>}
                      <span className={styles.cartItemQty}>{item.quantity}</span>
                    </div>
                    <div className={styles.cartItemInfo}>
                      <span className={styles.cartItemName}>{item.product?.name}</span>
                      {item.variant_label && <span className={styles.cartItemVariant}>{item.variant_label}</span>}
                    </div>
                    <span className={styles.cartItemTotal}>{formatPrice(item.line_total)}</span>
                  </div>
                ))}
              </div>
              <hr className="divider" />
              <div className={styles.totals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.summary.total_price)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Shipping</span>
                  <span className={styles.free}>Free</span>
                </div>
                <hr className="divider" />
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                  <span>Total</span>
                  <span>{formatPrice(cart.summary.total_price)}</span>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 20 }}
                disabled={submitting}
              >
                {submitting ? <><span className="spinner" /> Placing Order…</> : `Place Order — ${formatPrice(cart.summary.total_price)}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
