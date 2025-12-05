import { useState } from 'react'
import { useStore } from '../store/useStore'

export default function Login() {
  const { signIn, signUp, resetPassword } = useStore()
  const [mode, setMode] = useState('login') // 'login', 'signup', 'forgot'
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (mode === 'forgot') {
      const result = await resetPassword(formData.email)
      if (result.success) {
        setMode('login')
      }
    } else if (mode === 'signup') {
      await signUp(formData.email, formData.password, formData.name)
    } else {
      await signIn(formData.email, formData.password)
    }

    setLoading(false)
  }

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Start Your Journey'
      case 'forgot': return 'Reset Password'
      default: return 'Welcome Back'
    }
  }

  const getButtonText = () => {
    if (loading) return null
    switch (mode) {
      case 'signup': return 'Create Account'
      case 'forgot': return 'Send Reset Link'
      default: return 'Sign In'
    }
  }

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          {getTitle()}
        </h2>

        {mode === 'forgot' && (
          <p style={{ 
            textAlign: 'center', 
            color: 'var(--text-muted)', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        )}

        {mode === 'signup' && (
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your Name"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
            required
          />
        </div>

        {mode !== 'forgot' && (
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        )}

        {mode === 'login' && (
          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setMode('forgot') }}
              style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}
            >
              Forgot password?
            </a>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? (
            <span className="loader-ring" style={{ width: 20, height: 20 }} />
          ) : (
            getButtonText()
          )}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {mode === 'forgot' ? (
            <>
              Remember your password?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setMode('login') }}>
                Sign In
              </a>
            </>
          ) : mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setMode('login') }}>
                Sign In
              </a>
            </>
          ) : (
            <>
              New to AffiliateAI?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup') }}>
                Create Account
              </a>
            </>
          )}
        </p>
      </form>
    </div>
  )
}
