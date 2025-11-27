import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'

export default function Settings() {
  const { profile, user, updateProfile, addToast, signOut } = useStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '', groqApiKey: '', experienceLevel: 'beginner', canvaClientId: ''
  })

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.full_name || '',
        groqApiKey: profile.groq_api_key || localStorage.getItem('affiliateai_groq_api_key') || '',
        experienceLevel: profile.experience_level || 'beginner',
        canvaClientId: profile.canva_client_id || ''
      })
    }
  }, [profile])

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save API key to localStorage as backup
      if (form.groqApiKey) {
        localStorage.setItem('affiliateai_groq_api_key', form.groqApiKey)
      }

      await updateProfile({
        full_name: form.fullName,
        groq_api_key: form.groqApiKey,
        experience_level: form.experienceLevel,
        canva_client_id: form.canvaClientId
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      addToast('Account deletion is not implemented in this demo.', 'warning')
    }
  }

  return (
    <div className="settings-page fade-in" style={{ maxWidth: 800 }}>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><h3 className="card-title">👤 Profile Settings</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Your Name" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input value={user?.email || ''} disabled style={{ opacity: 0.7 }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Email cannot be changed</p>
          </div>

          <div className="form-group">
            <label>Experience Level</label>
            <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
              <option value="beginner">Beginner - New to affiliate marketing</option>
              <option value="intermediate">Intermediate - Some experience</option>
              <option value="advanced">Advanced - Experienced marketer</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><h3 className="card-title">🔑 API Keys</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Groq API Key
              <span className="tag primary" style={{ fontSize: '0.7rem' }}>Required for AI</span>
            </label>
            <input type="password" value={form.groqApiKey} onChange={(e) => setForm({ ...form, groqApiKey: e.target.value })} placeholder="gsk_..." />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <p>Get your free API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener">console.groq.com/keys</a></p>
              <p>This powers all AI features in AffiliateAI Pro.</p>
            </div>
          </div>

          <div className="form-group">
            <label>Canva Client ID (Optional)</label>
            <input value={form.canvaClientId} onChange={(e) => setForm({ ...form, canvaClientId: e.target.value })} placeholder="Your Canva app client ID" />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Required for Canva integration. Get it from <a href="https://www.canva.com/developers/" target="_blank" rel="noopener">Canva Developers</a>
            </p>
          </div>

          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><h3 className="card-title">🏦 Affiliate Accounts</h3></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ padding: '1.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>💻</span>
                <div>
                  <h4>ClickBank</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Digital products marketplace</p>
                </div>
              </div>
              <a href="https://accounts.clickbank.com/master/makeAffiliateAccountRequest.htm" target="_blank" rel="noopener" className="btn btn-secondary btn-sm">
                Create Account
              </a>
            </div>
            <div style={{ padding: '1.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>📚</span>
                <div>
                  <h4>Amazon Associates</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Physical products affiliate</p>
                </div>
              </div>
              <a href="https://affiliate-program.amazon.com/" target="_blank" rel="noopener" className="btn btn-secondary btn-sm">
                Create Account
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title" style={{ color: 'var(--error)' }}>⚠️ Danger Zone</h3></div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4>Sign Out</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sign out of your account</p>
            </div>
            <button className="btn btn-secondary" onClick={signOut}>Sign Out</button>
          </div>
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4>Delete Account</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Permanently delete your account and all data</p>
            </div>
            <button className="btn btn-danger" onClick={handleDeleteAccount}>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  )
}

