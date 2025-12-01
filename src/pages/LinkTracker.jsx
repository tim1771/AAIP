import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { generateShortCode, copyToClipboard } from '../lib/utils'

export default function LinkTracker() {
  const { user, addToast } = useStore()
  const [links, setLinks] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ url: '', product: '', source: '', medium: '', campaign: '' })

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
        const [linksRes, productsRes] = await Promise.all([
          supabase.from('tracked_links').select('*, affiliate_products(product_name), campaigns(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('affiliate_products').select('id, product_name').eq('user_id', user.id)
        ])
        if (isMounted) {
          setLinks(linksRes.data || [])
          setProducts(productsRes.data || [])
        }
      } catch (error) {
        console.error('Load links error:', error)
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
      const [linksRes, productsRes] = await Promise.all([
        supabase.from('tracked_links').select('*, affiliate_products(product_name), campaigns(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('affiliate_products').select('id, product_name').eq('user_id', user.id)
      ])
      setLinks(linksRes.data || [])
      setProducts(productsRes.data || [])
    } catch (error) {
      console.error('Load links error:', error)
    }
  }

  const createLink = async () => {
    if (!form.url) { addToast('Please enter a URL', 'warning'); return }
    try {
      const shortCode = generateShortCode()
      const destinationUrl = `${form.url}${form.url.includes('?') ? '&' : '?'}utm_source=${form.source || 'affiliateai'}&utm_medium=${form.medium || 'link'}&utm_campaign=${form.campaign || 'default'}`
      
      await supabase.from('tracked_links').insert({
        user_id: user.id, 
        original_url: form.url, 
        destination_url: destinationUrl, 
        short_code: shortCode,
        product_id: form.product || null,
        utm_source: form.source || 'affiliateai', 
        utm_medium: form.medium || 'link', 
        utm_campaign: form.campaign || 'default'
      })
      addToast('Link created!', 'success')
      setForm({ url: '', product: '', source: '', medium: '', campaign: '' })
      loadData()
    } catch (error) { addToast('Error creating link', 'error') }
  }

  const handleCopy = (url) => {
    copyToClipboard(url)
    addToast('Copied to clipboard!', 'success')
  }

  const deleteLink = async (id) => {
    await supabase.from('tracked_links').delete().eq('id', id)
    addToast('Link deleted', 'success')
    loadData()
  }

  const totalClicks = links.reduce((sum, l) => sum + (l.click_count || 0), 0)

  if (loading) return <div className="loading-state"><div className="loader-ring" /><p>Loading...</p></div>

  return (
    <div className="links-page fade-in">
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card"><div className="stat-icon">🔗</div><div className="stat-content"><div className="stat-label">Total Links</div><div className="stat-value">{links.length}</div></div></div>
        <div className="stat-card"><div className="stat-icon">👆</div><div className="stat-content"><div className="stat-label">Total Clicks</div><div className="stat-value">{totalClicks}</div></div></div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><h3 className="card-title">➕ Create Tracked Link</h3></div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group"><label>Original Affiliate URL*</label><input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://affiliate-link.com/product?ref=you" /></div>
            <div className="form-group"><label>Product</label><select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}><option value="">Select product...</option>{products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>UTM Source</label><input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g., blog, email, social" /></div>
            <div className="form-group"><label>UTM Medium</label><input value={form.medium} onChange={(e) => setForm({ ...form, medium: e.target.value })} placeholder="e.g., cpc, banner, post" /></div>
          </div>
          <div className="form-group"><label>UTM Campaign</label><input value={form.campaign} onChange={(e) => setForm({ ...form, campaign: e.target.value })} placeholder="e.g., summer_sale" /></div>
          <button className="btn btn-primary" onClick={createLink}>Create Link</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">📋 Your Links</h3></div>
        <div className="card-body">
          {links.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>URL</th><th>Product</th><th>Source</th><th>Clicks</th><th>Actions</th></tr></thead>
                <tbody>
                  {links.map(link => (
                    <tr key={link.id}>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.destination_url || link.original_url}</div>
                      </td>
                      <td>{link.affiliate_products?.product_name || '-'}</td>
                      <td><span className="tag">{link.utm_source}/{link.utm_medium}</span></td>
                      <td><strong style={{ color: 'var(--primary)' }}>{link.click_count || 0}</strong></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-sm btn-ghost" onClick={() => handleCopy(link.destination_url || link.original_url)}>📋</button>
                          <button className="btn btn-sm btn-ghost" onClick={() => deleteLink(link.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">🔗</div><p>No tracked links. Create your first link above!</p></div>
          )}
        </div>
      </div>
    </div>
  )
}
