import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { CONFIG } from '../lib/config'

export default function Settings() {
  const { profile, user, updateProfile, addToast, signOut } = useStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [testingProvider, setTestingProvider] = useState(null)
  
  const [form, setForm] = useState({
    fullName: '',
    experienceLevel: 'beginner',
    // API Keys
    groqApiKey: '',
    anthropicApiKey: '',
    googleApiKey: '',
    // Other
    canvaClientId: ''
  })

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.full_name || '',
        experienceLevel: profile.experience_level || 'beginner',
        groqApiKey: profile.groq_api_key || localStorage.getItem('affiliateai_groq_api_key') || '',
        anthropicApiKey: profile.anthropic_api_key || localStorage.getItem('affiliateai_anthropic_api_key') || '',
        googleApiKey: profile.google_api_key || localStorage.getItem('affiliateai_google_api_key') || '',
        canvaClientId: profile.canva_client_id || ''
      })
    }
  }, [profile])

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save API keys to localStorage as backup
      if (form.groqApiKey) localStorage.setItem('affiliateai_groq_api_key', form.groqApiKey)
      if (form.anthropicApiKey) localStorage.setItem('affiliateai_anthropic_api_key', form.anthropicApiKey)
      if (form.googleApiKey) localStorage.setItem('affiliateai_google_api_key', form.googleApiKey)

      await updateProfile({
        full_name: form.fullName,
        experience_level: form.experienceLevel,
        groq_api_key: form.groqApiKey,
        anthropic_api_key: form.anthropicApiKey,
        google_api_key: form.googleApiKey,
        canva_client_id: form.canvaClientId
      })
    } finally {
      setLoading(false)
    }
  }

  const testApiKey = async (provider) => {
    setTestingProvider(provider)
    try {
      let testUrl, headers, body

      if (provider === 'groq') {
        if (!form.groqApiKey) throw new Error('No Groq API key')
        testUrl = 'https://api.groq.com/openai/v1/chat/completions'
        headers = {
          'Authorization': `Bearer ${form.groqApiKey}`,
          'Content-Type': 'application/json'
        }
        body = JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: 'Say "API key works!"' }],
          max_tokens: 20
        })
      } else if (provider === 'anthropic') {
        if (!form.anthropicApiKey) throw new Error('No Anthropic API key')
        testUrl = 'https://api.anthropic.com/v1/messages'
        headers = {
          'x-api-key': form.anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true'
        }
        body = JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 20,
          messages: [{ role: 'user', content: 'Say "API key works!"' }]
        })
      } else if (provider === 'google') {
        if (!form.googleApiKey) throw new Error('No Google API key')
        testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${form.googleApiKey}`
        headers = { 'Content-Type': 'application/json' }
        body = JSON.stringify({
          contents: [{ parts: [{ text: 'Say "API key works!"' }] }]
        })
      }

      const response = await fetch(testUrl, { method: 'POST', headers, body })
      
      if (response.ok) {
        addToast(`✅ ${CONFIG.ai.providers[provider].name} API key is valid!`, 'success')
      } else {
        const error = await response.json()
        throw new Error(error.error?.message || 'Invalid API key')
      }
    } catch (error) {
      addToast(`❌ ${CONFIG.ai.providers[provider].name}: ${error.message}`, 'error')
    } finally {
      setTestingProvider(null)
    }
  }

  const apiKeyConfigs = [
    {
      provider: 'groq',
      name: 'Groq',
      icon: '⚡',
      description: 'Ultra-fast AI with Llama models',
      keyField: 'groqApiKey',
      placeholder: 'gsk_...',
      signupUrl: 'https://console.groq.com/keys',
      free: true,
      features: ['Fast inference', 'Free tier', 'Llama 3.3 70B']
    },
    {
      provider: 'anthropic',
      name: 'Claude (Opus 4.5)',
      icon: '🧠',
      description: 'Advanced reasoning & deep analysis',
      keyField: 'anthropicApiKey',
      placeholder: 'sk-ant-...',
      signupUrl: 'https://console.anthropic.com/settings/keys',
      free: false,
      features: ['Deep reasoning', 'Long context', 'Best for strategy']
    },
    {
      provider: 'google',
      name: 'Google AI (Nano Banana)',
      icon: '🍌',
      description: 'Gemini text + Imagen 3 images',
      keyField: 'googleApiKey',
      placeholder: 'AIza...',
      signupUrl: 'https://aistudio.google.com/app/apikey',
      free: true,
      features: ['Image generation', 'Gemini 2.0', 'Free tier']
    }
  ]

  const tabs = [
    { id: 'profile', label: '👤 Profile', icon: '👤' },
    { id: 'api-keys', label: '🔑 API Keys', icon: '🔑' },
    { id: 'integrations', label: '🔌 Integrations', icon: '🔌' }
  ]

  return (
    <div className="settings-page fade-in" style={{ maxWidth: 900 }}>
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === tab.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header"><h3 className="card-title">👤 Profile Settings</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                value={form.fullName} 
                onChange={(e) => setForm({ ...form, fullName: e.target.value })} 
                placeholder="Your Name" 
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input value={user?.email || ''} disabled style={{ opacity: 0.7 }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Email cannot be changed
              </p>
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <select 
                value={form.experienceLevel} 
                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
              >
                <option value="beginner">Beginner - New to affiliate marketing</option>
                <option value="intermediate">Intermediate - Some experience</option>
                <option value="advanced">Advanced - Experienced marketer</option>
              </select>
            </div>

            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">🔑 AI Provider API Keys</h3>
            <span className="tag info">Multi-Model Support</span>
          </div>
          <div className="card-body">
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Configure your AI providers. Each provider offers different capabilities - use Groq for speed, 
              Claude Opus 4.5 for deep reasoning, and Google for image generation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {apiKeyConfigs.map(config => {
                const hasKey = !!form[config.keyField]
                return (
                  <div 
                    key={config.provider}
                    style={{
                      padding: '1.5rem',
                      background: 'var(--bg-input)',
                      border: `1px solid ${hasKey ? 'var(--success)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      position: 'relative'
                    }}
                  >
                    {/* Status Badge */}
                    <span style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '1rem',
                      padding: '0.25rem 0.75rem',
                      background: hasKey ? 'var(--success)' : 'var(--bg-card)',
                      border: hasKey ? 'none' : '1px solid var(--border-color)',
                      color: hasKey ? 'white' : 'var(--text-muted)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '999px'
                    }}>
                      {hasKey ? '✓ Connected' : 'Not Connected'}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '2.5rem' }}>{config.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h4 style={{ margin: 0 }}>{config.name}</h4>
                          {config.free && <span className="tag success" style={{ fontSize: '0.65rem' }}>FREE</span>}
                          {!config.free && <span className="tag warning" style={{ fontSize: '0.65rem' }}>PAID</span>}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                          {config.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      {config.features.map((feature, i) => (
                        <span key={i} style={{
                          padding: '0.25rem 0.5rem',
                          background: 'var(--bg-card)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)'
                        }}>
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="password"
                          value={form[config.keyField]}
                          onChange={(e) => setForm({ ...form, [config.keyField]: e.target.value })}
                          placeholder={config.placeholder}
                          style={{ marginBottom: 0 }}
                        />
                      </div>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => testApiKey(config.provider)}
                        disabled={!form[config.keyField] || testingProvider === config.provider}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {testingProvider === config.provider ? '...' : '🧪 Test'}
                      </button>
                      <a 
                        href={config.signupUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Get Key →
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleSave} 
              disabled={loading}
              style={{ marginTop: '1.5rem' }}
            >
              {loading ? 'Saving...' : 'Save All API Keys'}
            </button>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header"><h3 className="card-title">🎨 Canva Integration</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label>Canva Client ID (Optional)</label>
                <input 
                  value={form.canvaClientId} 
                  onChange={(e) => setForm({ ...form, canvaClientId: e.target.value })} 
                  placeholder="Your Canva app client ID" 
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Get it from <a href="https://www.canva.com/developers/" target="_blank" rel="noopener">Canva Developers</a>
                </p>
              </div>

              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Integration'}
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
                  <a 
                    href="https://accounts.clickbank.com/master/makeAffiliateAccountRequest.htm" 
                    target="_blank" 
                    rel="noopener" 
                    className="btn btn-secondary btn-sm"
                  >
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
                  <a 
                    href="https://affiliate-program.amazon.com/" 
                    target="_blank" 
                    rel="noopener" 
                    className="btn btn-secondary btn-sm"
                  >
                    Create Account
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Danger Zone */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ color: 'var(--error)' }}>⚠️ Danger Zone</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4>Sign Out</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sign out of your account</p>
            </div>
            <button className="btn btn-secondary" onClick={signOut}>Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  )
}
