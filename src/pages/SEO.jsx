import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { aiService } from '../lib/ai'

export default function SEO() {
  const { user, addToast, getGroqApiKey, hasApiKey } = useStore()
  const [keywords, setKeywords] = useState([])
  const [niches, setNiches] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [selectedNiche, setSelectedNiche] = useState('')
  const [seedKeyword, setSeedKeyword] = useState('')

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    try {
      const [keywordsRes, nichesRes] = await Promise.all([
        supabase.from('keywords').select('*, user_niches(niche_name)').eq('user_id', user.id).order('priority', { ascending: false }),
        supabase.from('user_niches').select('id, niche_name, sub_niche').eq('user_id', user.id)
      ])
      setKeywords(keywordsRes.data || [])
      setNiches(nichesRes.data || [])
    } finally {
      setLoading(false)
    }
  }

  const researchKeywords = async () => {
    if (!selectedNiche) { addToast('Please select a niche', 'warning'); return }
    if (!hasApiKey()) { addToast('Please configure your Groq API key in Settings', 'warning'); return }

    setSearching(true)
    try {
      const result = await aiService.generateKeywords(selectedNiche, seedKeyword, getGroqApiKey())
      setResults(result)
    } catch (error) {
      addToast('Error researching keywords', 'error')
    } finally {
      setSearching(false)
    }
  }

  const saveKeyword = async (kw) => {
    const nicheRecord = niches.find(n => n.niche_name === selectedNiche)
    try {
      await supabase.from('keywords').insert({
        user_id: user.id,
        keyword: kw.keyword,
        intent: kw.search_intent,
        competition: kw.difficulty,
        search_volume: kw.estimated_volume === 'high' ? 10000 : kw.estimated_volume === 'medium' ? 5000 : 1000,
        is_long_tail: kw.is_long_tail,
        niche_id: nicheRecord?.id || null,
        priority: kw.search_intent === 'transactional' ? 2 : kw.search_intent === 'commercial' ? 1 : 0
      })
      addToast('Keyword saved!', 'success')
      loadData()
    } catch (error) {
      addToast('Error saving keyword', 'error')
    }
  }

  const updatePriority = async (id, priority) => {
    await supabase.from('keywords').update({ priority: parseInt(priority) }).eq('id', id)
    addToast('Priority updated!', 'success')
  }

  const deleteKeyword = async (id) => {
    await supabase.from('keywords').delete().eq('id', id)
    addToast('Keyword removed', 'success')
    loadData()
  }

  if (loading) return <div className="loading-state"><div className="loader-ring" /><p>Loading...</p></div>

  return (
    <div className="seo-page fade-in" style={{ maxWidth: 1400 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">🔍 Keyword Research</h3></div>
          <div className="card-body">
            <div className="form-group"><label>Select Niche</label><select value={selectedNiche} onChange={(e) => setSelectedNiche(e.target.value)}><option value="">Choose a niche...</option>{niches.map(n => <option key={n.id} value={n.niche_name}>{n.niche_name}</option>)}</select></div>
            <div className="form-group"><label>Seed Keyword (Optional)</label><input value={seedKeyword} onChange={(e) => setSeedKeyword(e.target.value)} placeholder="e.g., protein powder" /></div>
            <button className="btn btn-primary btn-full" onClick={researchKeywords} disabled={searching}>
              {searching ? '...' : '🤖 Research Keywords'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">📊 Keyword Results</h3></div>
          <div className="card-body">
            {searching ? (
              <div className="loading-state"><div className="loader-ring" /><p>Researching keywords...</p></div>
            ) : results ? (
              <div className="fade-in">
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.75rem' }}>📦 Topic Clusters</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {results.topic_clusters?.map((c, i) => <span key={i} className="tag primary">{c}</span>)}
                  </div>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead><tr><th>Keyword</th><th>Intent</th><th>Difficulty</th><th>Volume</th><th>Action</th></tr></thead>
                    <tbody>
                      {results.keywords?.map((kw, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{kw.keyword} {kw.is_long_tail && <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-full)', marginLeft: '0.5rem' }}>Long Tail</span>}</td>
                          <td><span className={`tag ${kw.search_intent === 'transactional' ? 'success' : kw.search_intent === 'commercial' ? 'warning' : 'info'}`}>{kw.search_intent}</span></td>
                          <td><span className={`tag ${kw.difficulty === 'low' ? 'success' : kw.difficulty === 'high' ? 'error' : 'warning'}`}>{kw.difficulty}</span></td>
                          <td>{kw.estimated_volume}</td>
                          <td><button className="btn btn-sm btn-primary" onClick={() => saveKeyword(kw)}>Save</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">🔎</div><h3>Start Keyword Research</h3><p>Select a niche to discover profitable keywords.</p></div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">📋 Your Keywords</h3><span className="badge">{keywords.length}</span></div>
        <div className="card-body">
          {keywords.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Keyword</th><th>Intent</th><th>Difficulty</th><th>Volume</th><th>Priority</th><th>Actions</th></tr></thead>
                <tbody>
                  {keywords.map(kw => (
                    <tr key={kw.id}>
                      <td style={{ fontWeight: 500 }}>{kw.keyword} {kw.is_long_tail && <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-full)', marginLeft: '0.5rem' }}>Long Tail</span>}</td>
                      <td><span className={`tag ${kw.intent === 'transactional' ? 'success' : kw.intent === 'commercial' ? 'warning' : 'info'}`}>{kw.intent || 'N/A'}</span></td>
                      <td><span className={`tag ${kw.competition === 'low' ? 'success' : kw.competition === 'high' ? 'error' : 'warning'}`}>{kw.competition || 'N/A'}</span></td>
                      <td>{kw.search_volume || 'N/A'}</td>
                      <td><select value={kw.priority} onChange={(e) => updatePriority(kw.id, e.target.value)} style={{ padding: '0.25rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}><option value="0">Low</option><option value="1">Medium</option><option value="2">High</option></select></td>
                      <td><button className="btn btn-sm btn-ghost" onClick={() => deleteKeyword(kw.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">📭</div><p>No keywords saved. Research and save keywords to track them.</p></div>
          )}
        </div>
      </div>
    </div>
  )
}

