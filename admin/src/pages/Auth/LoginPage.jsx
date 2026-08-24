import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { LogIn, Shield, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function AdminLogin() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'admin@styleverse.com', password: 'admin123' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.email, form.password)
    setLoading(false)
    if (result.success) {
      toast.success('Welcome back, Admin!')
      navigate('/')
    } else {
      setError(result.message || 'Invalid credentials')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={28} color="#0a0a0f" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>Admin Login</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>StyleVerse Admin Panel</p>
        </div>

        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-lg)', background: 'rgba(var(--color-primary-rgb), 0.08)', border: '1px solid rgba(var(--color-primary-rgb), 0.15)', marginBottom: 20, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--color-primary)' }}>Credentials pre-filled.</strong><br />
          Email: admin@styleverse.com &middot; Password: admin123
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="admin-form-field">
            <label className="admin-form-label">Email Address</label>
            <input className="admin-form-input" type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="admin-form-field">
            <label className="admin-form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="admin-form-input" type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-error-bg)', color: 'var(--color-error)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading
              ? <span style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: 'black', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
              : <LogIn size={18} />}
            {loading ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          <a href="https://shoppining-app.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            &larr; Back to Storefront
          </a>
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
