import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'

const CANVA_CLIENT_ID = '' // User will configure this

export default function CanvaStudio() {
  const { user, profile, updateProfile, addToast } = useStore()
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const timeout = setTimeout(() => {
      if (isMounted && loading) setLoading(false)
    }, 8000)
    
    const fetchData = async () => {
      if (!user) {
        if (isMounted) setLoading(false)
        return
      }
      try {
        const { data } = await supabase.from('canva_designs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        if (isMounted) setDesigns(data || [])
      } catch (error) {
        console.error('Load designs error:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    
    fetchData()
    return () => { isMounted = false; clearTimeout(timeout) }
  }, [user?.id])

  const loadDesigns = async () => {
    if (!user) return
    try {
      const { data } = await supabase.from('canva_designs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setDesigns(data || [])
    } catch (error) {
      console.error('Load designs error:', error)
    }
  }

  const connectCanva = () => {
    if (!profile?.canva_access_token) {
      addToast('Canva integration requires API setup. See instructions below.', 'info')
    }
  }

  const saveDesign = async (name, url, type) => {
    try {
      await supabase.from('canva_designs').insert({ user_id: user.id, design_name: name, canva_url: url, design_type: type })
      addToast('Design saved!', 'success')
      loadDesigns()
    } catch (error) { addToast('Error saving design', 'error') }
  }

  const deleteDesign = async (id) => {
    await supabase.from('canva_designs').delete().eq('id', id)
    addToast('Design removed', 'success')
    loadDesigns()
  }

  if (loading) return <div className="loading-state"><div className="loader-ring" /><p>Loading...</p></div>

  return (
    <div className="canva-page fade-in">
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><h3 className="card-title">🎨 Canva Connect Integration</h3></div>
        <div className="card-body">
          {profile?.canva_access_token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="tag success">Connected</span>
              <button className="btn btn-primary" onClick={() => window.open('https://www.canva.com', '_blank')}>Open Canva</button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem' }}>🎨</span>
                <div>
                  <h4>Connect Your Canva Account</h4>
                  <p style={{ color: 'var(--text-muted)' }}>Create stunning visuals for your affiliate marketing campaigns</p>
                </div>
              </div>

              <div style={{ padding: '1.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>🔧 Setup Instructions</h4>
                <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '0.5rem' }}>Go to <a href="https://www.canva.com/developers/" target="_blank" rel="noopener">Canva Developers</a></li>
                  <li style={{ marginBottom: '0.5rem' }}>Create a new application with "Connect API"</li>
                  <li style={{ marginBottom: '0.5rem' }}>Get your Client ID and add it to Settings</li>
                  <li style={{ marginBottom: '0.5rem' }}>Enable OAuth and set your redirect URI</li>
                  <li>Return here to connect your account</li>
                </ol>
              </div>

              <button className="btn btn-primary" onClick={connectCanva}>Connect Canva Account</button>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><h3 className="card-title">🖼️ Design Templates</h3></div>
        <div className="card-body">
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Quick links to create designs in Canva</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'Instagram Post', icon: '📱', url: 'https://www.canva.com/create/instagram-posts/' },
              { name: 'Pinterest Pin', icon: '📌', url: 'https://www.canva.com/create/pinterest-pins/' },
              { name: 'YouTube Thumbnail', icon: '🎬', url: 'https://www.canva.com/create/youtube-thumbnails/' },
              { name: 'Facebook Post', icon: '👍', url: 'https://www.canva.com/create/facebook-posts/' },
              { name: 'Blog Banner', icon: '📝', url: 'https://www.canva.com/create/banners/' },
              { name: 'Email Header', icon: '📧', url: 'https://www.canva.com/create/email-headers/' }
            ].map((template, i) => (
              <a key={i} href={template.url} target="_blank" rel="noopener" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem',
                background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                textDecoration: 'none', color: 'inherit', transition: 'all var(--transition-fast)'
              }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                <span style={{ fontSize: '2rem' }}>{template.icon}</span>
                <span style={{ fontSize: '0.9rem' }}>{template.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">📚 Saved Designs</h3><span className="badge">{designs.length}</span></div>
        <div className="card-body">
          {designs.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {designs.map(d => (
                <div key={d.id} style={{ padding: '1.25rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>{d.design_name}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>{d.design_type}</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {d.canva_url && <a href={d.canva_url} target="_blank" rel="noopener" className="btn btn-sm btn-primary">Open</a>}
                    <button className="btn btn-sm btn-ghost" onClick={() => deleteDesign(d.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">🎨</div><p>No saved designs yet. Create and save your Canva designs here.</p></div>
          )}
        </div>
      </div>
    </div>
  )
}

