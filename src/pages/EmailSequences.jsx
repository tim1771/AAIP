import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { supabase, withTimeout } from '../lib/supabase'
import { aiService } from '../lib/ai'

export default function EmailSequences() {
  const { user, addToast, getGroqApiKey, hasApiKey } = useStore()
  const [sequences, setSequences] = useState([])
  const [niches, setNiches] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(null)
  const [form, setForm] = useState({ niche: '', product: '', count: '5', goal: 'sale' })

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
        const [sequencesRes, nichesRes, productsRes] = await withTimeout(Promise.all([
          supabase.from('email_sequences').select('*, email_sequence_items(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('user_niches').select('id, niche_name').eq('user_id', user.id),
          supabase.from('affiliate_products').select('id, product_name').eq('user_id', user.id)
        ]), 6000)
        if (isMounted) {
          setSequences(sequencesRes.data || [])
          setNiches(nichesRes.data || [])
          setProducts(productsRes.data || [])
        }
      } catch (error) {
        console.error('Load email sequences error:', error)
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
      const [sequencesRes, nichesRes, productsRes] = await Promise.all([
        supabase.from('email_sequences').select('*, email_sequence_items(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('user_niches').select('id, niche_name').eq('user_id', user.id),
        supabase.from('affiliate_products').select('id, product_name').eq('user_id', user.id)
      ])
      setSequences(sequencesRes.data || [])
      setNiches(nichesRes.data || [])
      setProducts(productsRes.data || [])
    } catch (error) {
      console.error('Load email sequences error:', error)
    }
  }

  const generateSequence = async () => {
    if (!form.niche) { addToast('Please select a niche', 'warning'); return }
    if (!hasApiKey()) { addToast('Please configure your Groq API key', 'warning'); return }

    setGenerating(true)
    try {
      const result = await aiService.generateEmailSequence({
        niche: form.niche,
        product: { name: form.product || 'affiliate product' },
        sequenceLength: parseInt(form.count),
        goal: form.goal
      }, getGroqApiKey())
      setGenerated(result)
    } catch (error) {
      addToast('Error generating sequence', 'error')
    } finally { setGenerating(false) }
  }

  const saveSequence = async () => {
    if (!generated) return
    try {
      const { data: sequence } = await supabase.from('email_sequences').insert({
        user_id: user.id, name: generated.sequence_name, description: generated.description, trigger_type: 'manual', status: 'draft'
      }).select().single()

      if (generated.emails?.length > 0) {
        const items = generated.emails.map((email, i) => ({
          sequence_id: sequence.id, order_position: i + 1, delay_days: email.day || i,
          subject_line: email.subject_line, preview_text: email.preview_text || '',
          email_content: email.content, call_to_action: email.call_to_action || ''
        }))
        await supabase.from('email_sequence_items').insert(items)
      }
      addToast('Sequence saved!', 'success')
      setGenerated(null)
      loadData()
    } catch (error) { addToast('Error saving sequence', 'error') }
  }

  const deleteSequence = async (id) => {
    await supabase.from('email_sequences').delete().eq('id', id)
    addToast('Sequence deleted', 'success')
    loadData()
  }

  if (loading) return <div className="loading-state"><div className="loader-ring" /><p>Loading...</p></div>

  return (
    <div className="email-page fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">📧 Generate Email Sequence</h3></div>
          <div className="card-body">
            <div className="form-group"><label>Niche/Topic*</label><select value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })}><option value="">Select niche...</option>{niches.map(n => <option key={n.id} value={n.niche_name}>{n.niche_name}</option>)}</select></div>
            <div className="form-group"><label>Product</label><select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}><option value="">Optional...</option>{products.map(p => <option key={p.id} value={p.product_name}>{p.product_name}</option>)}</select></div>
            <div className="form-group"><label>Number of Emails</label><select value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })}><option value="3">3 emails</option><option value="5">5 emails</option><option value="7">7 emails</option></select></div>
            <div className="form-group"><label>Goal</label><select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}><option value="sale">Drive sales</option><option value="trust">Build trust</option><option value="educate">Educate audience</option></select></div>
            <button className="btn btn-primary btn-full" onClick={generateSequence} disabled={generating}>{generating ? '...' : '🤖 Generate Sequence'}</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📬 Sequence Preview</h3>
            {generated && <button className="btn btn-sm btn-primary" onClick={saveSequence}>Save Sequence</button>}
          </div>
          <div className="card-body" style={{ maxHeight: 500, overflowY: 'auto' }}>
            {generating ? (
              <div className="loading-state"><div className="loader-ring" /><p>Generating emails...</p></div>
            ) : generated ? (
              <div className="fade-in">
                <h4>{generated.sequence_name}</h4>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{generated.description}</p>
                {generated.emails?.map((email, i) => (
                  <div key={i} style={{ padding: '1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Day {email.day}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{email.purpose}</span>
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>📧 {email.subject_line}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxHeight: 150, overflow: 'hidden' }}>{email.content?.substring(0, 300)}...</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">📧</div><h3>Generate an Email Sequence</h3><p>AI will create a complete email series.</p></div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">📋 Your Sequences</h3><span className="badge">{sequences.length}</span></div>
        <div className="card-body">
          {sequences.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {sequences.map(s => (
                <div key={s.id} style={{ padding: '1.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <h4>{s.name}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0' }}>{s.email_sequence_items?.length || 0} emails · {s.trigger_type} trigger</p>
                  <span className={`tag ${s.status === 'active' ? 'success' : 'info'}`}>{s.status}</span>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => deleteSequence(s.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">📭</div><p>No sequences yet. Generate your first email sequence!</p></div>
          )}
        </div>
      </div>
    </div>
  )
}

