import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { supabase, withTimeout } from '../lib/supabase'
import { formatCurrency, formatDate, percentage } from '../lib/utils'

export default function Analytics() {
  const { user, addToast } = useStore()
  const [analytics, setAnalytics] = useState([])
  const [summary, setSummary] = useState({ clicks: 0, conversions: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [form, setForm] = useState({ product: '', source: '', clicks: '', conversions: '', revenue: '', date: new Date().toISOString().split('T')[0] })
  const [products, setProducts] = useState([])

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
      const dateFilter = new Date()
      dateFilter.setDate(dateFilter.getDate() - parseInt(period))

      try {
        const [analyticsRes, productsRes] = await withTimeout(Promise.all([
          supabase.from('analytics').select('*, affiliate_products(product_name)').eq('user_id', user.id).gte('created_at', dateFilter.toISOString()).order('created_at', { ascending: false }),
          supabase.from('affiliate_products').select('id, product_name').eq('user_id', user.id)
        ]), 6000)
        
        if (isMounted) {
          const data = analyticsRes.data || []
          setAnalytics(data)
          setProducts(productsRes.data || [])
          setSummary({
            clicks: data.reduce((sum, a) => sum + (a.clicks || 0), 0),
            conversions: data.reduce((sum, a) => sum + (a.conversions || 0), 0),
            revenue: data.reduce((sum, a) => sum + (parseFloat(a.commission_earned) || 0), 0)
          })
        }
      } catch (error) {
        console.error('Load analytics error:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    
    fetchData()
    return () => { isMounted = false; clearTimeout(timeout) }
  }, [user?.id, period])

  const loadData = async () => {
    if (!user) return
    const dateFilter = new Date()
    dateFilter.setDate(dateFilter.getDate() - parseInt(period))

    try {
      const [analyticsRes, productsRes] = await Promise.all([
        supabase.from('analytics').select('*, affiliate_products(product_name)').eq('user_id', user.id).gte('created_at', dateFilter.toISOString()).order('created_at', { ascending: false }),
        supabase.from('affiliate_products').select('id, product_name').eq('user_id', user.id)
      ])
      
      const data = analyticsRes.data || []
      setAnalytics(data)
      setProducts(productsRes.data || [])
      setSummary({
        clicks: data.reduce((sum, a) => sum + (a.clicks || 0), 0),
        conversions: data.reduce((sum, a) => sum + (a.conversions || 0), 0),
        revenue: data.reduce((sum, a) => sum + (parseFloat(a.commission_earned) || 0), 0)
      })
    } catch (error) {
      console.error('Load analytics error:', error)
    }
  }

  const addEntry = async () => {
    try {
      await supabase.from('analytics').insert({
        user_id: user.id,
        product_id: form.product || null,
        source: form.source || 'manual',
        clicks: parseInt(form.clicks) || 0,
        conversions: parseInt(form.conversions) || 0,
        commission_earned: parseFloat(form.revenue) || 0
      })
      addToast('Analytics added!', 'success')
      setForm({ product: '', source: '', clicks: '', conversions: '', revenue: '', date: new Date().toISOString().split('T')[0] })
      loadData()
    } catch (error) { addToast('Error adding entry', 'error') }
  }

  const conversionRate = summary.clicks > 0 ? (summary.conversions / summary.clicks * 100).toFixed(2) : 0

  if (loading) return <div className="loading-state"><div className="loader-ring" /><p>Loading...</p></div>

  return (
    <div className="analytics-page fade-in">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {['7', '30', '90'].map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={`btn ${period === p ? 'btn-primary' : 'btn-secondary'}`}>
            Last {p} days
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">👆</div><div className="stat-content"><div className="stat-label">Total Clicks</div><div className="stat-value">{summary.clicks}</div></div></div>
        <div className="stat-card"><div className="stat-icon">🎯</div><div className="stat-content"><div className="stat-label">Conversions</div><div className="stat-value">{summary.conversions}</div></div></div>
        <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-content"><div className="stat-label">Commission Earned</div><div className="stat-value">{formatCurrency(summary.revenue)}</div></div></div>
        <div className="stat-card"><div className="stat-icon">📈</div><div className="stat-content"><div className="stat-label">Conversion Rate</div><div className="stat-value">{conversionRate}%</div></div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">📊 Performance History</h3></div>
          <div className="card-body">
            {analytics.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Product</th><th>Source</th><th>Clicks</th><th>Conv.</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {analytics.map(a => (
                      <tr key={a.id}>
                        <td>{formatDate(a.created_at)}</td>
                        <td>{a.affiliate_products?.product_name || '-'}</td>
                        <td><span className="tag">{a.source}</span></td>
                        <td>{a.clicks || 0}</td>
                        <td>{a.conversions || 0}</td>
                        <td style={{ color: 'var(--success)' }}>{formatCurrency(a.commission_earned || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">📊</div><p>No analytics data for this period.</p></div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">➕ Log Performance</h3></div>
          <div className="card-body">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Manually track your affiliate performance from different platforms.</p>
            <div className="form-group"><label>Product</label><select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}><option value="">Select product...</option>{products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}</select></div>
            <div className="form-group"><label>Traffic Source</label><input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g., blog, youtube, email" /></div>
            <div className="form-row">
              <div className="form-group"><label>Clicks</label><input type="number" value={form.clicks} onChange={(e) => setForm({ ...form, clicks: e.target.value })} placeholder="0" /></div>
              <div className="form-group"><label>Conversions</label><input type="number" value={form.conversions} onChange={(e) => setForm({ ...form, conversions: e.target.value })} placeholder="0" /></div>
            </div>
            <div className="form-group"><label>Revenue/Commission</label><input type="number" step="0.01" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} placeholder="0.00" /></div>
            <button className="btn btn-primary btn-full" onClick={addEntry}>Log Entry</button>
          </div>
        </div>
      </div>
    </div>
  )
}

