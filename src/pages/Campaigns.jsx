import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { formatCurrency, truncate } from '../lib/utils'

export default function Campaigns() {
  const { user, addToast } = useStore()
  const [campaigns, setCampaigns] = useState([])
  const [niches, setNiches] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', niche: '', product: '', budget: '', description: '', audience: '' })

  useEffect(() => { loadData() }, [user])

  const loadData = async () => {
    if (!user) return
    try {
      const [campaignsRes, nichesRes, productsRes] = await Promise.all([
        supabase.from('campaigns').select('*, user_niches(niche_name), affiliate_products(product_name)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('user_niches').select('id, niche_name').eq('user_id', user.id),
        supabase.from('affiliate_products').select('id, product_name').eq('user_id', user.id).eq('status', 'promoting')
      ])
      setCampaigns(campaignsRes.data || [])
      setNiches(nichesRes.data || [])
      setProducts(productsRes.data || [])
    } finally { setLoading(false) }
  }

  const createCampaign = async () => {
    if (!form.name) { addToast('Please enter a campaign name', 'warning'); return }
    try {
      await supabase.from('campaigns').insert({
        user_id: user.id, name: form.name, niche_id: form.niche || null, product_id: form.product || null,
        budget: parseFloat(form.budget) || 0, description: form.description, target_audience: form.audience, status: 'planning'
      })
      addToast('Campaign created!', 'success')
      setForm({ name: '', niche: '', product: '', budget: '', description: '', audience: '' })
      loadData()
    } catch (error) { addToast('Error creating campaign', 'error') }
  }

  const updateStatus = async (id, status) => {
    await supabase.from('campaigns').update({ status }).eq('id', id)
    addToast('Status updated!', 'success')
    loadData()
  }

  const deleteCampaign = async (id) => {
    await supabase.from('campaigns').delete().eq('id', id)
    addToast('Campaign deleted', 'success')
    loadData()
  }

  const active = campaigns.filter(c => c.status === 'active').length

  if (loading) return <div className="loading-state"><div className="loader-ring" /><p>Loading...</p></div>

  return (
    <div className="campaigns-page fade-in">
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-content"><div className="stat-label">Total Campaigns</div><div className="stat-value">{campaigns.length}</div></div></div>
        <div className="stat-card"><div className="stat-icon">🚀</div><div className="stat-content"><div className="stat-label">Active</div><div className="stat-value">{active}</div></div></div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><h3 className="card-title">➕ Create Campaign</h3></div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group"><label>Campaign Name*</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Summer Fitness Promo" /></div>
            <div className="form-group"><label>Niche</label><select value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })}><option value="">Select niche...</option>{niches.map(n => <option key={n.id} value={n.id}>{n.niche_name}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Product</label><select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}><option value="">Select product...</option>{products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}</select></div>
            <div className="form-group"><label>Budget</label><input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g., 500" /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Campaign goals..." /></div>
          <div className="form-group"><label>Target Audience</label><input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} placeholder="e.g., Women 25-45" /></div>
          <button className="btn btn-primary" onClick={createCampaign}>Create Campaign</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">📋 Your Campaigns</h3></div>
        <div className="card-body">
          {campaigns.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
              {campaigns.map(c => (
                <div key={c.id} style={{ padding: '1.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{c.name}</span>
                    <span className={`tag ${c.status === 'active' ? 'success' : c.status === 'completed' ? 'primary' : c.status === 'paused' ? 'warning' : 'info'}`}>{c.status}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {c.user_niches?.niche_name || 'No niche'} · {c.affiliate_products?.product_name || 'No product'} · {c.budget ? formatCurrency(c.budget) : 'No budget'}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{truncate(c.description || 'No description', 100)}</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select value={c.status} onChange={(e) => updateStatus(c.id, e.target.value)} style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                      <option value="planning">Planning</option><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option>
                    </select>
                    <button className="btn btn-sm btn-ghost" onClick={() => deleteCampaign(c.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">📊</div><p>No campaigns yet. Create your first campaign above!</p></div>
          )}
        </div>
      </div>
    </div>
  )
}

