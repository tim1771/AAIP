import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate, truncate, percentage } from '../lib/utils'
import { CONFIG } from '../lib/config'
import { SkeletonDashboard } from '../components/Skeleton'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, hasApiKey } = useStore()
  const [stats, setStats] = useState({ niches: 0, products: 0, content: 0, revenue: 0 })
  const [journey, setJourney] = useState([])
  const [recentContent, setRecentContent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let isLoaded = false
    
    // Safety timeout - force stop loading after 5 seconds
    const safetyTimeout = setTimeout(() => {
      if (isMounted && !isLoaded) {
        console.log('Dashboard safety timeout triggered')
        setLoading(false)
      }
    }, 5000)
    
    const loadData = async () => {
      if (!user) {
        if (isMounted) setLoading(false)
        isLoaded = true
        return
      }

      try {
        const [nichesRes, productsRes, contentRes, journeyRes, analyticsRes] = await Promise.all([
          supabase.from('user_niches').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('affiliate_products').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('content').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('user_journey').select('*').eq('user_id', user.id).order('step_number'),
          supabase.from('analytics').select('commission_earned').eq('user_id', user.id)
        ])

        if (!isMounted) return

        const totalRevenue = analyticsRes.data?.reduce((sum, a) => sum + (parseFloat(a.commission_earned) || 0), 0) || 0

        setStats({
          niches: nichesRes.count || 0,
          products: productsRes.count || 0,
          content: contentRes.data?.length || 0,
          revenue: totalRevenue
        })

        setJourney(journeyRes.data || [])
        setRecentContent(contentRes.data || [])
        isLoaded = true
      } catch (error) {
        console.error('Dashboard load error:', error)
        isLoaded = true
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    
    return () => { 
      isMounted = false 
      clearTimeout(safetyTimeout)
    }
  }, [user?.id])

  const completedSteps = journey.filter(s => s.completed).length
  const currentStep = journey.find(s => !s.completed)?.step_number || journey.length

  if (loading) {
    return <SkeletonDashboard />
  }

  return (
    <div className="dashboard fade-in">
      {/* Welcome & API Key Warning */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Welcome back, {profile?.full_name || 'User'}!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Ready to grow your affiliate marketing business?</p>
        
        {!hasApiKey() && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1rem',
            padding: '1rem 1.5rem',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🔑</span>
            <div style={{ flex: 1 }}>
              <strong style={{ color: 'var(--warning)' }}>Setup Required</strong>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>Configure your Groq API key to unlock AI features</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/settings')}>
              Setup Now
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Niches</div>
            <div className="stat-value">{stats.niches}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-label">Products</div>
            <div className="stat-value">{stats.products}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✍️</div>
          <div className="stat-content">
            <div className="stat-label">Content Pieces</div>
            <div className="stat-value">{stats.content}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Earnings</div>
            <div className="stat-value">{formatCurrency(stats.revenue)}</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        {/* Journey Progress */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🗺️ Your Journey</h3>
            <span className="tag primary">{completedSteps}/9 Complete</span>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '1.5rem' }}>
              {CONFIG.journeySteps.slice(0, 5).map((step, index) => {
                const isComplete = journey[index]?.completed
                const isCurrent = step.number === currentStep
                return (
                  <div key={step.number} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 0',
                    borderBottom: index < 4 ? '1px solid var(--border-color)' : 'none',
                    opacity: isComplete || isCurrent ? 1 : 0.5
                  }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      background: isComplete ? 'var(--success)' : isCurrent ? 'var(--gradient-primary)' : 'var(--bg-input)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: isComplete || isCurrent ? 'white' : 'var(--text-muted)'
                    }}>
                      {isComplete ? '✓' : step.number}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{step.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{step.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <button className="btn btn-primary btn-full" onClick={() => navigate('/journey')}>
              Continue Journey
            </button>
          </div>
        </div>

        {/* Quick Start */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚡ Quick Start</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {[
                { icon: '🎯', label: 'Find Niche', path: '/niche' },
                { icon: '🔎', label: 'Find Products', path: '/products' },
                { icon: '✍️', label: 'Create Content', path: '/content' },
                { icon: '🔍', label: 'SEO Research', path: '/seo' }
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1.25rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.background = 'var(--bg-card-hover)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                    e.currentTarget.style.background = 'var(--bg-input)'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Recent Activity</h3>
          </div>
          <div className="card-body">
            {recentContent.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentContent.map(item => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>{CONFIG.contentTypes[item.content_type]?.icon || '📄'}</span>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{truncate(item.title || 'Untitled', 40)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(item.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p>No recent activity yet. Start by finding your niche!</p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/niche')}>
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">💡 Pro Tips</h3>
          </div>
          <div className="card-body">
            {[
              { num: 1, title: 'Start narrow', text: 'Focus on a specific sub-niche rather than a broad market.' },
              { num: 2, title: 'Value first', text: 'Create helpful content before promoting products.' },
              { num: 3, title: 'Track everything', text: 'Monitor which content drives conversions.' },
              { num: 4, title: 'Be patient', text: 'Affiliate marketing takes 3-6 months to see results.' }
            ].map(tip => (
              <div key={tip.num} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                  width: 24, height: 24,
                  background: 'var(--gradient-primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  flexShrink: 0
                }}>{tip.num}</div>
                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <strong>{tip.title}:</strong> {tip.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

