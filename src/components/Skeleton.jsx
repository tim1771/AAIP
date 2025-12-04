/**
 * Skeleton Loader Components
 * Provides loading placeholders for various UI elements
 */

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={className}>
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i} 
          className={`skeleton skeleton-text ${i === lines - 1 ? 'sm' : i === 0 ? 'lg' : 'md'}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ height = 200 }) {
  return (
    <div className="skeleton-card animate-fade-in-up">
      <div className="skeleton skeleton-title" />
      <SkeletonText lines={3} />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <div className="skeleton skeleton-button" />
        <div className="skeleton skeleton-button" style={{ width: 80 }} />
      </div>
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="skeleton-stat animate-fade-in-up">
      <div className="skeleton skeleton-avatar" />
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-text sm" style={{ width: '40%' }} />
        <div className="skeleton skeleton-text lg" style={{ width: '60%', height: '1.5rem' }} />
      </div>
    </div>
  )
}

export function SkeletonStats({ count = 4 }) {
  return (
    <div className="stats-grid">
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`stagger-${i + 1}`} style={{ opacity: 0, animation: 'fadeInUp 0.4s ease-out forwards' }}>
          <SkeletonStat />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="card animate-fade-in-up">
      <div className="card-header">
        <div className="skeleton skeleton-text" style={{ width: 150, marginBottom: 0 }} />
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {[...Array(rows)].map((_, i) => (
          <div 
            key={i} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '1rem 1.5rem',
              borderBottom: i < rows - 1 ? '1px solid var(--border-color)' : 'none'
            }}
          >
            <div className="skeleton skeleton-avatar" style={{ width: 40, height: 40 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-text" style={{ width: '30%' }} />
              <div className="skeleton skeleton-text sm" style={{ width: '20%' }} />
            </div>
            <div className="skeleton skeleton-text" style={{ width: 80, marginBottom: 0 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonNicheCard() {
  return (
    <div className="skeleton-card animate-fade-in-scale">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div className="skeleton skeleton-text lg" style={{ width: 180 }} />
          <div className="skeleton skeleton-text sm" style={{ width: 100 }} />
        </div>
        <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 'var(--radius-full)' }} />
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div className="skeleton skeleton-text" style={{ width: 80 }} />
        <div className="skeleton skeleton-text" style={{ width: 100 }} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div className="skeleton skeleton-button" style={{ width: 120 }} />
        <div className="skeleton skeleton-button" style={{ width: 80 }} />
      </div>
    </div>
  )
}

export function SkeletonJourneyStep({ index = 0 }) {
  return (
    <div 
      className="animate-fade-in-up"
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1.5rem', 
        padding: '1.5rem',
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        animationDelay: `${index * 0.05}s`
      }}
    >
      <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-text" style={{ width: '40%' }} />
        <div className="skeleton skeleton-text sm" style={{ width: '60%' }} />
      </div>
      <div className="skeleton" style={{ width: 80, height: 28, borderRadius: 'var(--radius-full)' }} />
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="fade-in">
      {/* Welcome Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="skeleton skeleton-title" style={{ width: 250 }} />
        <div className="skeleton skeleton-text sm" style={{ width: 300 }} />
      </div>
      
      {/* Stats */}
      <SkeletonStats count={4} />
      
      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

// Default export for convenience
export default {
  Text: SkeletonText,
  Card: SkeletonCard,
  Stat: SkeletonStat,
  Stats: SkeletonStats,
  Table: SkeletonTable,
  NicheCard: SkeletonNicheCard,
  JourneyStep: SkeletonJourneyStep,
  Dashboard: SkeletonDashboard
}

