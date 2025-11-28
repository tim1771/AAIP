import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { aiService } from '../lib/ai'
import { CONFIG } from '../lib/config'

export default function NicheDiscovery() {
  const { user, addToast, getGroqApiKey, hasApiKey } = useStore()
  const [niches, setNiches] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [customNiche, setCustomNiche] = useState('')

  useEffect(() => {
    loadNiches()
  }, [user])

  const loadNiches = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      const { data } = await supabase
        .from('user_niches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setNiches(data || [])
    } finally {
      setLoading(false)
    }
  }

  const analyzeNiche = async (niche, subNiche = '') => {
    if (!hasApiKey()) {
      addToast('Please configure your Groq API key in Settings', 'warning')
      return
    }

    setAnalyzing(true)
    try {
      const result = await aiService.analyzeNiche(niche, subNiche, getGroqApiKey())
      setAnalysis({ ...result, niche, subNiche })
    } catch (error) {
      addToast('Error analyzing niche. Please try again.', 'error')
    } finally {
      setAnalyzing(false)
    }
  }

  const saveNiche = async () => {
    if (!analysis) return

    try {
      // Ensure profitability_score is an integer
      const profitScore = parseInt(analysis.profitability_score) || 50
      
      const { data, error } = await supabase.from('user_niches').insert({
        user_id: user.id,
        niche_name: analysis.niche,
        sub_niche: analysis.subNiche || null,
        profitability_score: profitScore,
        competition_level: analysis.competition_level?.toLowerCase() || 'medium',
        market_size: analysis.market_size || null,
        trending: analysis.trending || false,
        interest_level: 5, // Default to middle value (constraint requires 1-10)
        ai_analysis: analysis
      }).select()

      if (error) {
        console.error('Supabase insert error:', error)
        addToast(`Error saving niche: ${error.message}`, 'error')
        return
      }

      if (!data || data.length === 0) {
        console.error('No data returned from insert')
        addToast('Error saving niche: No data returned', 'error')
        return
      }

      addToast('Niche saved!', 'success')
      await loadNiches()
      setAnalysis(null)
    } catch (error) {
      console.error('Save niche error:', error)
      addToast('Error saving niche', 'error')
    }
  }

  const selectNiche = async (nicheId) => {
    try {
      await supabase.from('user_niches').update({ selected: false }).eq('user_id', user.id)
      await supabase.from('user_niches').update({ selected: true }).eq('id', nicheId)
      addToast('Niche selected as primary!', 'success')
      loadNiches()
    } catch (error) {
      addToast('Error selecting niche', 'error')
    }
  }

  const deleteNiche = async (nicheId) => {
    try {
      await supabase.from('user_niches').delete().eq('id', nicheId)
      addToast('Niche removed', 'success')
      loadNiches()
    } catch (error) {
      addToast('Error deleting niche', 'error')
    }
  }

  const selectedNiche = niches.find(n => n.selected)

  if (loading) {
    return <div className="loading-state"><div className="loader-ring" /><p>Loading...</p></div>
  }

  return (
    <div className="niche-page fade-in" style={{ maxWidth: 1200 }}>
      {selectedNiche && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.5rem', marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
          border: '1px solid var(--primary)', borderRadius: 'var(--radius-lg)'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Your Primary Niche</span>
            <h3>{selectedNiche.niche_name}{selectedNiche.sub_niche ? ` - ${selectedNiche.sub_niche}` : ''}</h3>
          </div>
          <span className="tag success">Active</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Discovery Panel */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎯 Discover Your Niche</h3>
          </div>
          <div className="card-body">
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Use AI to find a profitable niche that matches your interests.
            </p>

            <div className="form-group">
              <label>1. Select a Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {CONFIG.nicheCategories.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem',
                      background: selectedCategory?.name === cat.name ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-input)',
                      border: `1px solid ${selectedCategory?.name === cat.name ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: selectedCategory?.name === cat.name ? 'var(--primary)' : 'var(--text-secondary)'
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedCategory && (
              <div className="form-group">
                <label>2. Choose a Sub-niche</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedCategory.subNiches.map(sub => (
                    <button
                      key={sub}
                      onClick={() => analyzeNiche(selectedCategory.name, sub)}
                      style={{
                        padding: '0.5rem 1rem', background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)',
                        color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer'
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>Or enter a custom niche</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  placeholder="e.g., Organic Dog Food"
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" onClick={() => customNiche && analyzeNiche(customNiche)}>
                  Analyze
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Niche Analysis</h3>
          </div>
          <div className="card-body">
            {analyzing ? (
              <div className="loading-state"><div className="loader-ring" /><p>Analyzing niche...</p></div>
            ) : analysis ? (
              <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <h4 style={{ color: 'var(--primary)' }}>{analysis.niche}{analysis.subNiche ? ` - ${analysis.subNiche}` : ''}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{analysis.recommendation}</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{analysis.profitability_score}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Profit Score</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <span className={`tag ${analysis.competition_level === 'low' ? 'success' : analysis.competition_level === 'high' ? 'error' : 'warning'}`}>
                      {analysis.competition_level}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Competition</div>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontWeight: 600 }}>{analysis.trending ? '📈 Yes' : '➖ No'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Trending</div>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{analysis.market_size}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Market Size</div>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>🎯 Target Audience</h5>
                  <p style={{ fontSize: '0.9rem' }}>{analysis.target_audience}</p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>💰 Monetization</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {analysis.monetization_opportunities?.map((m, i) => <span key={i} className="tag primary">{m}</span>)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <button className="btn btn-primary" onClick={saveNiche}>Save This Niche</button>
                  <button className="btn btn-secondary" onClick={() => setAnalysis(null)}>Clear</button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p>Select a niche to see AI analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Niches */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">📋 Your Saved Niches</h3>
          <span className="badge">{niches.length}</span>
        </div>
        <div className="card-body">
          {niches.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {niches.map(niche => (
                <div key={niche.id} style={{
                  padding: '1.25rem', background: niche.selected ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-input)',
                  border: `1px solid ${niche.selected ? 'var(--primary)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{niche.niche_name}</h4>
                      {niche.sub_niche && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{niche.sub_niche}</p>}
                    </div>
                    {niche.selected && <span className="tag success">Primary</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
                    <span>Score: <strong style={{ color: 'var(--primary)' }}>{niche.profitability_score || 'N/A'}</strong></span>
                    <span>Competition: <strong>{niche.competition_level || 'N/A'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!niche.selected && (
                      <button className="btn btn-primary btn-sm" onClick={() => selectNiche(niche.id)}>Select as Primary</button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteNiche(niche.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p>No niches saved yet. Analyze and save niches you're interested in.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

