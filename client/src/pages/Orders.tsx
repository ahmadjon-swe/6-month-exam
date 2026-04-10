import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import { orderApi } from '../api'
import type { Order, OrderStatus } from '../types'
import { formatPrice, formatDate, statusBadgeClass, getErrorMessage } from '../utils'
import Pagination from '../components/common/Pagination'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'
import styles from './Orders.module.css'

const STATUS_FILTERS: { value: OrderStatus | ''; label: string }[] = [
  { value: '',           label: 'All Orders' },
  { value: 'pending',    label: 'Pending' },
  { value: 'paid',       label: 'Paid' },
  { value: 'shipped',    label: 'Shipped' },
  { value: 'delivered',  label: 'Delivered' },
  { value: 'cancelled',  label: 'Cancelled' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await orderApi.getMy({ status: status || undefined, page, limit: 10 })
      setOrders(res.data.data)
      setTotalPages(res.data.pagination.total_pages)
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [status, page])

  const handleCancel = async (orderId: string) => {
    if (!confirm('Cancel this order?')) return
    setCancellingId(orderId)
    try {
      await orderApi.updateStatus(orderId, 'cancelled')
      toast.success('Order cancelled')
      fetchOrders()
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setCancellingId(null) }
  }

  return (
    <div className="page-enter">
      <div className="container">
        <h1 className={styles.title}>My Orders</h1>

        {/* Status filter */}
        <div className={styles.filters}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              className={`${styles.filterBtn} ${status === f.value ? styles.filterActive : ''}`}
              onClick={() => { setStatus(f.value as OrderStatus | ''); setPage(1) }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? <Spinner fullPage /> : orders.length === 0 ? (
          <div className={styles.empty}>
            <Package size={56} />
            <h3>No orders found</h3>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {orders.map(order => {
                const expanded = expandedId === order.id
                return (
                  <div key={order.id} className={`card ${styles.orderCard}`}>
                    {/* Header */}
                    <div className={styles.orderHeader} onClick={() => setExpandedId(expanded ? null : order.id)}>
                      <div className={styles.orderMeta}>
                        <span className={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className={styles.orderDate}>{formatDate(order.created_at)}</span>
                      </div>
                      <div className={styles.orderRight}>
                        <span className={`badge ${statusBadgeClass(order.status)}`}>{order.status}</span>
                        <span className={styles.orderTotal}>{formatPrice(order.total_price)}</span>
                        <button className={styles.expandBtn}>
                          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className={styles.itemsPreview}>
                      {order.items?.slice(0, 3).map(item => (
                        <div key={item.id} className={styles.previewItem}>
                          <span className={styles.previewName}>{item.product_name}</span>
                          {item.variant_label && <span className={styles.previewVariant}>{item.variant_label}</span>}
                          <span className={styles.previewQty}>×{item.quantity}</span>
                          <span className={styles.previewPrice}>{formatPrice(item.line_total)}</span>
                        </div>
                      ))}
                      {(order.items?.length ?? 0) > 3 && (
                        <span className={styles.moreItems}>+{order.items.length - 3} more items</span>
                      )}
                    </div>

                    {/* Expanded details */}
                    {expanded && (
                      <div className={styles.expanded}>
                        <hr className="divider" />
                        <div className={styles.expandedGrid}>
                          <div>
                            <h4 className={styles.expandedLabel}>All Items</h4>
                            {order.items?.map(item => (
                              <div key={item.id} className={styles.expandedItem}>
                                <span>{item.product_name}{item.variant_label ? ` — ${item.variant_label}` : ''}</span>
                                <span>{item.quantity} × {formatPrice(item.unit_price)} = {formatPrice(item.line_total)}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className={styles.expandedLabel}>Billing</h4>
                            <div className={styles.billing}>
                              <span>{order.billing_snapshot.first_name}</span>
                              <span>{order.billing_snapshot.street_address}</span>
                              {order.billing_snapshot.apartment && <span>{order.billing_snapshot.apartment}</span>}
                              <span>{order.billing_snapshot.city}</span>
                              <span>{order.billing_snapshot.phone}</span>
                            </div>
                          </div>
                          <div>
                            <h4 className={styles.expandedLabel}>Payment</h4>
                            <span className="badge badge-info">{order.payment_type}</span>
                          </div>
                        </div>
                        {order.status === 'pending' && (
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ marginTop: 16 }}
                            onClick={() => handleCancel(order.id)}
                            disabled={cancellingId === order.id}
                          >
                            {cancellingId === order.id ? <span className="spinner" /> : 'Cancel Order'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={p => setPage(p)} />
          </>
        )}
      </div>
    </div>
  )
}
