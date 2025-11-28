import { useState, useMemo } from 'react'
import { CONFIG } from '../lib/config'
import { useStore } from '../store/useStore'

export default function AffiliatePrograms() {
  const { addToast } = useStore()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [nicheFilter, setNicheFilter] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const [showRecurring, setShowRecurring] = useState(false)
  const [showFreeOnly, setShowFreeOnly] = useState(false)

  const programs = CONFIG.affiliatePrograms

  // Get unique categories and niches
  const categories = useMemo(() => {
    const cats = [...new Set(programs.map(p => p.category))]
    return cats.sort()
  }, [])

  const allNiches = useMemo(() => {
    const niches = new Set()
    programs.forEach(p => p.niches.forEach(n => niches.add(n)))
    return [...niches].sort()
  }, [])

  // Filter and sort programs
  const filteredPrograms = useMemo(() => {
    let result = [...programs]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower) ||
        p.niches.some(n => n.toLowerCase().includes(searchLower))
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter)
    }

    // Niche filter
    if (nicheFilter !== 'all') {
      result = result.filter(p => p.niches.includes(nicheFilter))
    }

    // Recurring filter
    if (showRecurring) {
      result = result.filter(p => p.recurring)
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'commission':
        // Sort by percentage (rough estimate)
        result.sort((a, b) => {
          const aNum = parseInt(a.commission) || 0
          const bNum = parseInt(b.commission) || 0
          return bNum - aNum
        })
        break
    }

    return result
  }, [programs, search, categoryFilter, nicheFilter, sortBy, showRecurring])

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url)
    addToast('URL copied to clipboard!', 'success')
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5
    const stars = []
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} style={{ color: '#FFD700' }}>★</span>)
    }
    if (hasHalf) {
      stars.push(<span key="half" style={{ color: '#FFD700' }}>★</span>)
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} style={{ color: 'var(--border-color)' }}>★</span>)
    }
    
    return stars
  }

  return (
    <div className="affiliate-programs-page fade-in" style={{ maxWidth: 1400 }}>
      {/* Hero Section */}
      <div style={{
        padding: '2rem',
        background: 'var(--gradient-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '3rem' }}>🏦</span>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>Affiliate Program Database</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Browse {programs.length}+ hand-picked affiliate programs with AI-powered matching
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ 
            padding: '1rem 1.5rem', 
            background: 'var(--bg-input)', 
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
              {programs.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Programs</div>
          </div>
          <div style={{ 
            padding: '1rem 1.5rem', 
            background: 'var(--bg-input)', 
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>
              {programs.filter(p => p.recurring).length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Recurring</div>
          </div>
          <div style={{ 
            padding: '1rem 1.5rem', 
            background: 'var(--bg-input)', 
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning)' }}>
              {categories.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Categories</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Search Programs</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, category, or niche..."
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Niche</label>
              <select value={nicheFilter} onChange={(e) => setNicheFilter(e.target.value)}>
                <option value="all">All Niches</option>
                {allNiches.map(niche => (
                  <option key={niche} value={niche}>{niche}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="rating">Rating</option>
                <option value="name">Name</option>
                <option value="commission">Commission</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showRecurring}
                onChange={(e) => setShowRecurring(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <span>Recurring commissions only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
        Showing {filteredPrograms.length} of {programs.length} programs
      </div>

      {/* Program Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
        {filteredPrograms.map(program => (
          <div 
            key={program.id}
            className="card"
            style={{ 
              transition: 'all var(--transition-fast)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>{program.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{renderStars(program.rating)}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{program.rating}</span>
                  </div>
                </div>
                <span className="tag info">{program.category}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Commission</div>
                  <div style={{ fontWeight: 600, color: 'var(--success)' }}>{program.commission}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Cookie</div>
                  <div style={{ fontWeight: 500 }}>{program.cookieDuration}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Threshold</div>
                  <div style={{ fontWeight: 500 }}>{program.paymentThreshold}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Type</div>
                  <div>
                    {program.recurring ? (
                      <span className="tag success" style={{ fontSize: '0.7rem' }}>Recurring</span>
                    ) : (
                      <span className="tag" style={{ fontSize: '0.7rem' }}>One-time</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Best for niches:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {program.niches.map((niche, i) => (
                    <span 
                      key={i}
                      style={{
                        padding: '0.2rem 0.5rem',
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {niche}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a 
                  href={program.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Join Program →
                </a>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => { e.stopPropagation(); copyUrl(program.url) }}
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No programs found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button className="btn btn-secondary" onClick={() => {
                setSearch('')
                setCategoryFilter('all')
                setNicheFilter('all')
                setShowRecurring(false)
              }}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pro Tips */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">💡 Pro Tips for Choosing Affiliate Programs</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '🔄', title: 'Prioritize Recurring', desc: 'Programs with recurring commissions build passive income over time' },
              { icon: '🍪', title: 'Check Cookie Duration', desc: 'Longer cookie windows give you more time to earn from referrals' },
              { icon: '📊', title: 'Consider Gravity', desc: 'High gravity means proven sales, but also more competition' },
              { icon: '💰', title: 'Balance Commission & Threshold', desc: 'High commissions are useless if thresholds are unreachable' }
            ].map((tip, i) => (
              <div key={i} style={{
                padding: '1rem',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{tip.icon}</span>
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{tip.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

