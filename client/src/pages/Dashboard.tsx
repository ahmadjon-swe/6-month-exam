import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Package, Users, ShoppingBag } from 'lucide-react'
import { productApi, orderApi, userApi } from '../api'
import type { Product, Order, User as UserType } from '../types'
import { formatPrice, formatDate, statusBadgeClass, getErrorMessage } from '../utils'
import { useAuthStore } from '../store/authStore'
import Spinner from '../components/common/Spinner'
import Pagination from '../components/common/Pagination'
import toast from 'react-hot-toast'
import styles from './Dashboard.module.css'

type Tab = 'products' | 'orders' | 'users'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const [tab, setTab] = useState<Tab>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [busyId, setBusyId] = useState<number | string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      if (tab === 'products') {
        const res = await productApi.getAll({ page, limit: 15 })
        setProducts(res.data.data)
        setTotalPages(res.data.pagination.total_pages)
      } else if (tab === 'orders') {
        const res = isAdmin ? await orderApi.getAll({ page, limit: 15 }) : await orderApi.getMy({ page, limit: 15 })
        setOrders(res.data.data)
        setTotalPages(res.data.pagination.total_pages)
      } else if (tab === 'users' && isAdmin) {
        const res = await userApi.listUsers({ page, limit: 15 })
        setUsers(res.data.data)
        setTotalPages(res.data.pagination.total_pages)
      }
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [tab, page])

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return
    setBusyId(id)
    try {
      await productApi.delete(id)
      toast.success('Product deleted')
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setBusyId(null) }
  }

  const handleOrderStatus = async (orderId: string, status: any) => {
    setBusyId(orderId)
    try {
      await orderApi.updateStatus(orderId, status)
      toast.success('Status updated')
      fetchData()
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setBusyId(null) }
  }

  const handleSetRole = async (userId: number, role: string) => {
    setBusyId(userId)
    try {
      await userApi.setUserRole(userId, role)
      toast.success('Role updated')
      fetchData()
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setBusyId(null) }
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { key: 'products', label: 'Products', icon: <Package size={16} /> },
    { key: 'orders',   label: 'Orders',   icon: <ShoppingBag size={16} /> },
    { key: 'users',    label: 'Users',    icon: <Users size={16} />, adminOnly: true },
  ]

  return (
    <div className="page-enter">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{isAdmin ? 'Admin' : 'Seller'} Dashboard</h1>
            <p className={styles.sub}>Manage your {isAdmin ? 'store, orders, and users' : 'products and orders'}</p>
          </div>
          <Link to="/dashboard/new-product" className="btn btn-primary">
            <Plus size={16} /> New Product
          </Link>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.filter(t => !t.adminOnly || isAdmin).map(t => (
            <button
              key={t.key}
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
              onClick={() => { setTab(t.key); setPage(1) }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? <Spinner fullPage /> : (
          <>
            {/* Products table */}
            {tab === 'products' && (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Sold</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => {
                      const totalStock = p.variants.reduce((s, v) => s + (v.stock ?? 0), 0)
                      return (
                        <tr key={p.id}>
                          <td>
                            <div className={styles.productCell}>
                              <div className={styles.productThumb}>
                                {p.images?.[0] ? <img src={p.images[0]} alt={p.name} /> : '📦'}
                              </div>
                              <span className={styles.productName}>{p.name}</span>
                            </div>
                          </td>
                          <td><span className="badge badge-info">{p.category}</span></td>
                          <td className={styles.mono}>{formatPrice(Number(p.base_price))}</td>
                          <td className={styles.mono}>{totalStock}</td>
                          <td className={styles.mono}>{p.total_sold}</td>
                          <td>
                            <span className={`badge ${p.is_active ? 'badge-success' : 'badge-error'}`}>
                              {p.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actionBtns}>
                              <Link to={`/dashboard/edit-product/${p.id}`} className="btn btn-ghost btn-sm">
                                <Edit size={13} />
                              </Link>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(p.id)} disabled={busyId === p.id}>
                                {busyId === p.id ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <Trash2 size={13} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {products.length === 0 && <div className={styles.empty}>No products yet. <Link to="/dashboard/new-product">Create one</Link></div>}
              </div>
            )}

            {/* Orders table */}
            {tab === 'orders' && (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      {isAdmin && <th>Customer</th>}
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      {isAdmin && <th>Update</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td className={styles.mono}>#{o.id.slice(0, 8).toUpperCase()}</td>
                        {isAdmin && <td>{(o as any).user?.name ?? '—'}</td>}
                        <td>{formatDate(o.created_at)}</td>
                        <td>{o.items?.length ?? 0}</td>
                        <td className={styles.mono}>{formatPrice(o.total_price)}</td>
                        <td><span className="badge badge-info">{o.payment_type}</span></td>
                        <td><span className={`badge ${statusBadgeClass(o.status)}`}>{o.status}</span></td>
                        {isAdmin && (
                          <td>
                            <select
                              className={styles.statusSelect}
                              value={o.status}
                              onChange={e => handleOrderStatus(o.id, e.target.value)}
                              disabled={busyId === o.id}
                            >
                              {['pending','paid','shipped','delivered','cancelled'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && <div className={styles.empty}>No orders found.</div>}
              </div>
            )}

            {/* Users table (admin only) */}
            {tab === 'users' && isAdmin && (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Set Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td className={styles.mono}>{u.email}</td>
                        <td><span className="badge badge-accent">{u.role}</span></td>
                        <td>
                          <span className={`badge ${(u as any).is_active ? 'badge-success' : 'badge-error'}`}>
                            {(u as any).is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{formatDate((u as any).created_at)}</td>
                        <td>
                          <select
                            className={styles.statusSelect}
                            value={u.role}
                            onChange={e => handleSetRole(u.id, e.target.value)}
                            disabled={busyId === u.id}
                          >
                            <option value="user">user</option>
                            <option value="seller">seller</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={p => setPage(p)} />
          </>
        )}
      </div>
    </div>
  )
}
