import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { supabase, withTimeout } from '../lib/supabase'
import { formatDate } from '../lib/utils'

export default function Calendar() {
  const { user, addToast } = useStore()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', type: 'blog_article', date: '', platform: 'blog', status: 'planned' })

  useEffect(() => {
    let isMounted = true
    const timeout = setTimeout(() => {
      if (isMounted && loading) setLoading(false)
    }, 2000)
    
    const fetchData = async () => {
      if (!user) {
        if (isMounted) setLoading(false)
        return
      }
      try {
        const { data } = await withTimeout(
          supabase.from('content_calendar').select('*').eq('user_id', user.id).order('scheduled_date'),
          6000
        )
        if (isMounted) setItems(data || [])
      } catch (error) {
        console.error('Load calendar error:', error)
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
      const { data } = await supabase.from('content_calendar').select('*').eq('user_id', user.id).order('scheduled_date')
      setItems(data || [])
    } catch (error) {
      console.error('Load calendar error:', error)
    }
  }

  const addItem = async () => {
    if (!form.title || !form.date) { addToast('Please fill title and date', 'warning'); return }
    try {
      await supabase.from('content_calendar').insert({
        user_id: user.id, title: form.title, content_type: form.type, scheduled_date: form.date, platform: form.platform, status: form.status
      })
      addToast('Content scheduled!', 'success')
      setForm({ title: '', type: 'blog_article', date: '', platform: 'blog', status: 'planned' })
      loadData()
    } catch (error) { addToast('Error adding item', 'error') }
  }

  const updateStatus = async (id, status) => {
    await supabase.from('content_calendar').update({ status }).eq('id', id)
    loadData()
  }

  const deleteItem = async (id) => {
    await supabase.from('content_calendar').delete().eq('id', id)
    addToast('Removed', 'success')
    loadData()
  }

  const grouped = items.reduce((acc, item) => {
    const date = item.scheduled_date?.split('T')[0] || 'Unscheduled'
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {})

  if (loading) return <div className="loading-state"><div className="loader-ring" /><p>Loading...</p></div>

  return (
    <div className="calendar-page fade-in">
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><h3 className="card-title">➕ Schedule Content</h3></div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group"><label>Title*</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Content title" /></div>
            <div className="form-group"><label>Scheduled Date*</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Content Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{Object.entries({ blog_article: 'Blog Article', social_post: 'Social Post', youtube_script: 'YouTube Script', email: 'Email', pinterest_pin: 'Pinterest Pin' }).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div className="form-group"><label>Platform</label><select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>{['blog', 'facebook', 'instagram', 'twitter', 'youtube', 'pinterest', 'email'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}</select></div>
          </div>
          <button className="btn btn-primary" onClick={addItem}>Schedule</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">📅 Content Calendar</h3><span className="badge">{items.length} items</span></div>
        <div className="card-body">
          {Object.keys(grouped).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {Object.entries(grouped).sort().map(([date, dayItems]) => (
                <div key={date}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: 50, height: 50, background: 'var(--gradient-primary)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{new Date(date).getDate()}</span>
                      <span style={{ fontSize: '0.65rem' }}>{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    </div>
                    <div><div style={{ fontWeight: 500 }}>{new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dayItems.length} items</div></div>
                  </div>
                  <div style={{ marginLeft: '4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {dayItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ fontSize: '1.25rem' }}>{item.content_type === 'blog_article' ? '📝' : item.content_type === 'social_post' ? '📱' : item.content_type === 'youtube_script' ? '🎬' : '📧'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>{item.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.platform}</div>
                        </div>
                        <span className={`tag ${item.status === 'published' ? 'success' : item.status === 'in_progress' ? 'warning' : 'info'}`}>{item.status}</span>
                        <select value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)} style={{ padding: '0.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                          <option value="planned">Planned</option><option value="in_progress">In Progress</option><option value="published">Published</option>
                        </select>
                        <button className="btn btn-sm btn-ghost" onClick={() => deleteItem(item.id)}>🗑️</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">📅</div><p>No scheduled content. Add items above!</p></div>
          )}
        </div>
      </div>
    </div>
  )
}

