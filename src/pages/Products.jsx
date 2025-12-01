import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { aiService } from '../lib/ai'
import { formatCurrency } from '../lib/utils'

export default function Products() {
  const { user, addToast, getGroqApiKey, hasApiKey } = useStore()
  const [products, setProducts] = useState([])
  const [niches, setNiches] = useState([])
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [tab, setTab] = useState('ai')
  const [platform, setPlatform] = useState('both')
  const [selectedNiche, setSelectedNiche] = useState('')
  const [filter, setFilter] = useState('all')

  // Manual form
  const [manualForm, setManualForm] = useState({
    name: '', platform: 'clickbank', link: '', commission: '', niche: '', notes: ''
  })

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
        const [productsRes, nichesRes] = await Promise.all([
          supabase.from('affiliate_products').select('*, user_niches(niche_name)').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('user_niches').select('id, niche_name, sub_niche').eq('user_id', user.id)
        ])
        if (isMounted) {
          setProducts(productsRes.data || [])
          setNiches(nichesRes.data || [])
        }
      } catch (error) {
        console.error('Load products error:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    
    fetchData()
    return () => { isMounted = false; clearTimeout(timeout) }
  }, [user?.id])

  const loadData = async () => {
    if (!user) return
    try {
      const [productsRes, nichesRes] = await Promise.all([
        supabase.from('affiliate_products').select('*, user_niches(niche_name)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('user_niches').select('id, niche_name, sub_niche').eq('user_id', user.id)
      ])
      setProducts(productsRes.data || [])
      setNiches(nichesRes.data || [])
    } catch (error) {
      console.error('Load products error:', error)
    }
  }

  const getRecommendations = async () => {
    if (!selectedNiche) { addToast('Please select a niche', 'warning'); return }
    if (!hasApiKey()) { addToast('Please configure your Groq API key in Settings', 'warning'); return }

    setSearchLoading(true)
    try {
      const result = await aiService.getProductRecommendations(selectedNiche, platform, getGroqApiKey())
      setRecommendations(result)
    } catch (error) {
      addToast('Error getting recommendations', 'error')
    } finally {
      setSearchLoading(false)
    }
  }

  const saveProduct = async (productData) => {
    try {
      await supabase.from('affiliate_products').insert({ user_id: user.id, ...productData })
      addToast('Product saved!', 'success')
      loadData()
    } catch (error) {
      addToast('Error saving product', 'error')
    }
  }

  const handleManualSubmit = async () => {
    if (!manualForm.name) { addToast('Please enter a product name', 'warning'); return }
    await saveProduct({
      product_name: manualForm.name,
      platform: manualForm.platform,
      affiliate_link: manualForm.link || null,
      commission_rate: manualForm.commission ? parseFloat(manualForm.commission) : null,
      niche_id: manualForm.niche || null,
      notes: manualForm.notes || null,
      status: 'researching'
    })
    setManualForm({ name: '', platform: 'clickbank', link: '', commission: '', niche: '', notes: '' })
  }

  const updateStatus = async (id, status) => {
    await supabase.from('affiliate_products').update({ status }).eq('id', id)
    addToast('Status updated!', 'success')
    loadData()
  }

  const deleteProduct = async (id) => {
    await supabase.from('affiliate_products').delete().eq('id', id)
    addToast('Product removed', 'success')
    loadData()
  }

  const filtered = filter === 'all' ? products : products.filter(p => p.status === filter)

  if (loading) return <div className="loading-state"><div className="loader-ring" /><p>Loading...</p></div>

  return (
    <div className="products-page fade-in" style={{ maxWidth: 1400 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Research Panel */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔍 Product Research</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button className={`btn ${tab === 'ai' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setTab('ai')}>AI Recommendations</button>
              <button className={`btn ${tab === 'manual' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setTab('manual')}>Manual Add</button>
            </div>

            {tab === 'ai' ? (
              <>
                <div className="form-group">
                  <label>Select Your Niche</label>
                  <select value={selectedNiche} onChange={(e) => setSelectedNiche(e.target.value)}>
                    <option value="">Choose a niche...</option>
                    {niches.map(n => <option key={n.id} value={n.niche_name}>{n.niche_name}{n.sub_niche ? ` - ${n.sub_niche}` : ''}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Platform</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['both', 'clickbank', 'amazon'].map(p => (
                      <button key={p} onClick={() => setPlatform(p)} style={{
                        flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                        background: platform === p ? 'var(--bg-card-hover)' : 'var(--bg-input)',
                        border: `1px solid ${platform === p ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: platform === p ? 'var(--primary)' : 'var(--text-secondary)'
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>{p === 'both' ? '📦' : p === 'clickbank' ? '💻' : '📚'}</span>
                        <span style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>{p}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn btn-primary btn-full" onClick={getRecommendations} disabled={searchLoading}>
                  {searchLoading ? '...' : '🤖 Get AI Recommendations'}
                </button>
              </>
            ) : (
              <>
                <div className="form-group"><label>Product Name*</label><input value={manualForm.name} onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })} placeholder="Product name" /></div>
                <div className="form-group"><label>Platform*</label><select value={manualForm.platform} onChange={(e) => setManualForm({ ...manualForm, platform: e.target.value })}><option value="clickbank">ClickBank</option><option value="amazon">Amazon</option></select></div>
                <div className="form-group"><label>Affiliate Link</label><input value={manualForm.link} onChange={(e) => setManualForm({ ...manualForm, link: e.target.value })} placeholder="Your affiliate link" /></div>
                <div className="form-group"><label>Commission Rate (%)</label><input type="number" value={manualForm.commission} onChange={(e) => setManualForm({ ...manualForm, commission: e.target.value })} placeholder="e.g., 50" /></div>
                <div className="form-group"><label>Niche</label><select value={manualForm.niche} onChange={(e) => setManualForm({ ...manualForm, niche: e.target.value })}><option value="">Select niche...</option>{niches.map(n => <option key={n.id} value={n.id}>{n.niche_name}</option>)}</select></div>
                <button className="btn btn-primary btn-full" onClick={handleManualSubmit}>Add Product</button>
              </>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">📊 AI Recommendations</h3></div>
          <div className="card-body">
            {searchLoading ? (
              <div className="loading-state"><div className="loader-ring" /><p>Finding products...</p></div>
            ) : recommendations ? (
              <div className="fade-in">
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}><strong>💡 Insights:</strong> {recommendations.niche_insights}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recommendations.recommendations?.map((rec, i) => (
                    <div key={i} style={{ padding: '1.25rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span className={`tag ${rec.platform === 'clickbank' ? 'primary' : 'warning'}`}>{rec.platform}</span>
                        <span className="tag">{rec.target_commission}</span>
                      </div>
                      <h4 style={{ marginBottom: '0.5rem' }}>{rec.product_type}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}><strong>Look for:</strong> {rec.product_characteristics}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}><strong>Strategy:</strong> {rec.promotion_strategy}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {rec.content_angles?.map((a, j) => <span key={j} className="tag primary">{a}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">🎯</div><h3>Get Product Recommendations</h3><p>Select a niche and let AI find profitable products.</p></div>
            )}
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📦 Your Products</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'promoting', 'researching'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize' }}>
                {f} ({f === 'all' ? products.length : products.filter(p => p.status === f).length})
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
              {filtered.map(product => (
                <div key={product.id} style={{ padding: '1.25rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{product.platform === 'clickbank' ? '💻' : '📚'}</span>
                    <div style={{ flex: 1, margin: '0 1rem' }}>
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{product.product_name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.user_niches?.niche_name || 'No category'}</p>
                    </div>
                    <span className={`tag ${product.status === 'promoting' ? 'success' : 'info'}`}>{product.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    {product.commission_rate && <div><strong style={{ color: 'var(--primary)' }}>{product.commission_rate}%</strong><br /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Commission</span></div>}
                    {product.gravity_score && <div><strong style={{ color: 'var(--primary)' }}>{product.gravity_score}</strong><br /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gravity</span></div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <select value={product.status} onChange={(e) => updateStatus(product.id, e.target.value)} style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                      <option value="researching">Researching</option>
                      <option value="promoting">Promoting</option>
                      <option value="paused">Paused</option>
                    </select>
                    <button className="btn btn-sm btn-ghost" onClick={() => deleteProduct(product.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No products yet</h3><p>Use AI recommendations or manually add products.</p></div>
          )}
        </div>
      </div>
    </div>
  )
}

