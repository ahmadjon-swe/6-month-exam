import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api'
import { getErrorMessage } from '../utils'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

type Step = 'form' | 'otp'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: params.get('role') === 'seller' ? 'seller' : 'user',
  })
  const [otp, setOtp] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.register(form)
      setEmail(form.email)
      setStep('otp')
      toast.success('OTP sent to your email')
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally { setLoading(false) }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.verifyRegister({ email, otp })
      toast.success('Account activated! Please log in.')
      navigate('/login')
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>⬡ ShopHub</div>

        {step === 'form' ? (
          <>
            <h1 className={styles.title}>Create account</h1>
            <p className={styles.sub}>Join millions of shoppers on ShopHub</p>

            <form onSubmit={handleRegister} className={styles.form}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  required
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                >
                  <option value="user">Buyer (User)</option>
                  <option value="seller">Seller</option>
                </select>
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Create Account'}
              </button>
            </form>

            <p className={styles.switch}>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Verify your email</h1>
            <p className={styles.sub}>
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
            <form onSubmit={handleVerify} className={styles.form}>
              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <input
                  required
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className={styles.otpInput}
                />
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Verify & Activate'}
              </button>
            </form>
            <p className={styles.switch}>
              <button className={styles.backBtn} onClick={() => setStep('form')}>← Back</button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
