import { useState } from 'react'
import { useStore } from '../store/useStore'

export default function Login() {
  const { signIn, signUp } = useStore()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (isSignUp) {
      await signUp(formData.email, formData.password, formData.name)
    } else {
      await signIn(formData.email, formData.password)
    }

    setLoading(false)
  }

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          {isSignUp ? 'Start Your Journey' : 'Welcome Back'}
        </h2>

        {isSignUp && (
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

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? (
            <span className="loader-ring" style={{ width: 20, height: 20 }} />
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isSignUp ? 'Already have an account?' : "New to AffiliateAI?"}{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp) }}>
            {isSignUp ? 'Sign In' : 'Create Account'}
          </a>
        </p>
      </form>
    </div>
  )
}

