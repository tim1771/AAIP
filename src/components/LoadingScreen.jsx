export default function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg-darker)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      <div className="loader-ring" style={{ width: 60, height: 60 }} />
      <p style={{ color: 'var(--text-muted)' }}>Initializing AffiliateAI...</p>
    </div>
  )
}

