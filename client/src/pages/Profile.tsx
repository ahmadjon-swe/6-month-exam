import { useEffect, useState } from 'react'
import { User, MapPin, Lock, TrendingUp } from 'lucide-react'
import { userApi } from '../api'
import { useAuthStore } from '../store/authStore'
import type { BillingDetails } from '../types'
import { getErrorMessage } from '../utils'
import toast from 'react-hot-toast'
import styles from './Profile.module.css'

type Tab = 'info' | 'billing' | 'security'

const emptyBilling: BillingDetails = {
  first_name: '', company_name: '', street_address: '',
  apartment: '', city: '', phone: '', email: '',
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [tab, setTab] = useState<Tab>('info')
  const [loading, setLoading] = useState(false)

  // Profile form
  const [name, setName] = useState(user?.name ?? '')

  // Billing form
  const [billing, setBilling] = useState<BillingDetails>(emptyBilling)

  // Password form
  const [password, setPassword] = useState('')
  const [confirmPass, setConfirmPass] = useState('')

  useEffect(() => {
    userApi.getProfile().then(r => {
      setName(r.data.name)
      if (r.data.billing_details) setBilling({ ...emptyBilling, ...r.data.billing_details })
    }).catch(() => {})
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await userApi.updateProfile({ name })
      updateUser({ name: res.data.name })
      toast.success('Profile updated!')
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }

  const handleUpdateBilling = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await userApi.updateBilling(billing)
      toast.success('Billing details saved!')
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPass) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await userApi.updateProfile({ password })
      toast.success('Password updated!')
      setPassword(''); setConfirmPass('')
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }

  const handleUpgradeToSeller = async () => {
    if (!confirm('Upgrade your account to seller? You will be able to list products.')) return
    setLoading(true)
    try {
      await userApi.upgradeToSeller()
      updateUser({ role: 'seller' })
      toast.success('You are now a seller!')
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }

  const setBillingField = (field: keyof BillingDetails) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBilling(b => ({ ...b, [field]: e.target.value }))

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'info',     label: 'Profile Info',    icon: <User size={16} /> },
    { key: 'billing',  label: 'Billing Details', icon: <MapPin size={16} /> },
    { key: 'security', label: 'Security',        icon: <Lock size={16} /> },
  ]

  return (
    <div className="page-enter">
      <div className="container">
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.userCard}>
              <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className={styles.userName}>{user?.name}</div>
                <div className={styles.userEmail}>{user?.email}</div>
                <span className={`badge badge-accent ${styles.roleBadge}`}>{user?.role}</span>
              </div>
            </div>

            <nav className={styles.nav}>
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`${styles.navBtn} ${tab === t.key ? styles.navActive : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </nav>

            {user?.role === 'user' && (
              <button className={`btn btn-secondary ${styles.upgradeBtn}`} onClick={handleUpgradeToSeller} disabled={loading}>
                <TrendingUp size={16} /> Become a Seller
              </button>
            )}
          </aside>

          {/* Content */}
          <div className={styles.content}>
            {tab === 'info' && (
              <div className="card">
                <h2 className={styles.sectionTitle}>Profile Information</h2>
                <form onSubmit={handleUpdateProfile} className={styles.form}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input value={user?.email ?? ''} disabled style={{ opacity: 0.5 }} />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? <span className="spinner" /> : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {tab === 'billing' && (
              <div className="card">
                <h2 className={styles.sectionTitle}>Billing Details</h2>
                <form onSubmit={handleUpdateBilling} className={styles.formGrid}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input required placeholder="John" value={billing.first_name} onChange={setBillingField('first_name')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company (optional)</label>
                    <input placeholder="Acme Inc." value={billing.company_name} onChange={setBillingField('company_name')} />
                  </div>
                  <div className={`form-group ${styles.fullWidth}`}>
                    <label className="form-label">Street Address *</label>
                    <input required placeholder="123 Main St" value={billing.street_address} onChange={setBillingField('street_address')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Apartment</label>
                    <input placeholder="Apt 4B" value={billing.apartment} onChange={setBillingField('apartment')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input required placeholder="Tashkent" value={billing.city} onChange={setBillingField('city')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input required placeholder="+998901234567" value={billing.phone} onChange={setBillingField('phone')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email (optional)</label>
                    <input type="email" placeholder="you@example.com" value={billing.email} onChange={setBillingField('email')} />
                  </div>
                  <div className={styles.fullWidth}>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                      {loading ? <span className="spinner" /> : 'Save Billing Details'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {tab === 'security' && (
              <div className="card">
                <h2 className={styles.sectionTitle}>Change Password</h2>
                <form onSubmit={handleUpdatePassword} className={styles.form}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" required minLength={6} placeholder="Min. 6 characters"
                      value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" required minLength={6} placeholder="Repeat password"
                      value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? <span className="spinner" /> : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
