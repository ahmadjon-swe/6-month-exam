import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../api'
import { useAuthStore } from '../store/authStore'
import { getErrorMessage } from '../utils'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

type Step = 'credentials' | 'otp' | 'forgot' | 'reset'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const from = (location.state as any)?.from?.pathname ?? '/'

  const [step, setStep] = useState<Step>('credentials')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [newPass, setNewPass] = useState('')

  // Step 1: password check
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.login({ email, password })
      setStep('otp')
      toast.success('OTP sent to your email')
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }

  // Step 2: OTP verify
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.verifyLogin({ email, otp })
      setAuth(res.data.user, res.data.access_token, res.data.refresh_token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate(from, { replace: true })
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }

  // Forgot password
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      toast.success('OTP sent if email is registered')
      setStep('reset')
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }

  // Reset password
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.resetPassword({ email, otp, new_password: newPass })
      toast.success('Password reset! Please log in.')
      setStep('credentials')
      setOtp(''); setNewPass('')
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>⬡ ShopHub</div>

        {step === 'credentials' && (
          <>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.sub}>Sign in to your account</p>
            <form onSubmit={handleLogin} className={styles.form}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" required placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" required placeholder="Your password" value={password}
                  onChange={e => setPassword(e.target.value)} />
                <div className={styles.forgotLink}>
                  <button type="button" className={styles.backBtn} onClick={() => setStep('forgot')}>
                    Forgot password?
                  </button>
                </div>
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Continue'}
              </button>
            </form>
            <p className={styles.switch}>
              New here? <Link to="/register">Create an account</Link>
            </p>
          </>
        )}

        {step === 'otp' && (
          <>
            <h1 className={styles.title}>Check your email</h1>
            <p className={styles.sub}>Enter the 6-digit code sent to <strong>{email}</strong></p>
            <form onSubmit={handleVerifyOtp} className={styles.form}>
              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <input required placeholder="000000" maxLength={6} value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g,''))} className={styles.otpInput} />
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Sign In'}
              </button>
            </form>
            <p className={styles.switch}>
              <button className={styles.backBtn} onClick={() => setStep('credentials')}>← Back</button>
            </p>
          </>
        )}

        {step === 'forgot' && (
          <>
            <h1 className={styles.title}>Reset password</h1>
            <p className={styles.sub}>Enter your email and we'll send you a code.</p>
            <form onSubmit={handleForgot} className={styles.form}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" required placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Send OTP'}
              </button>
            </form>
            <p className={styles.switch}>
              <button className={styles.backBtn} onClick={() => setStep('credentials')}>← Back to login</button>
            </p>
          </>
        )}

        {step === 'reset' && (
          <>
            <h1 className={styles.title}>New password</h1>
            <p className={styles.sub}>Enter the OTP from your email and your new password.</p>
            <form onSubmit={handleReset} className={styles.form}>
              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <input required placeholder="000000" maxLength={6} value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g,''))} className={styles.otpInput} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" required minLength={6} placeholder="Min. 6 characters"
                  value={newPass} onChange={e => setNewPass(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
