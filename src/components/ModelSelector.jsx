import { CONFIG } from '../lib/config'
import { useStore } from '../store/useStore'

export default function ModelSelector({ 
  type = 'text', // 'text' or 'image'
  value, 
  onChange,
  compact = false,
  showStatus = true 
}) {
  const { hasApiKey } = useStore()
  
  const providers = type === 'text' 
    ? ['groq', 'anthropic', 'google']
    : ['google']

  const getProviderInfo = (providerId) => {
    const provider = CONFIG.ai.providers[providerId]
    const hasKey = hasApiKey(providerId)
    
    return {
      ...provider,
      hasKey,
      status: hasKey ? 'ready' : 'needs-key'
    }
  }

  if (compact) {
    return (
      <div className="model-selector-compact">
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          {providers.map(providerId => {
            const info = getProviderInfo(providerId)
            return (
              <option key={providerId} value={providerId} disabled={!info.hasKey}>
                {info.icon} {info.name} {!info.hasKey ? '(No Key)' : ''}
              </option>
            )
          })}
        </select>
      </div>
    )
  }

  return (
    <div className="model-selector" style={{ 
      display: 'flex', 
      gap: '0.75rem', 
      flexWrap: 'wrap' 
    }}>
      {providers.map(providerId => {
        const info = getProviderInfo(providerId)
        const isSelected = value === providerId
        
        return (
          <button
            key={providerId}
            onClick={() => info.hasKey && onChange(providerId)}
            disabled={!info.hasKey}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: isSelected 
                ? 'rgba(16, 185, 129, 0.2)' 
                : 'var(--bg-input)',
              border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: info.hasKey ? 'pointer' : 'not-allowed',
              opacity: info.hasKey ? 1 : 0.5,
              transition: 'all var(--transition-fast)',
              position: 'relative'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{info.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                fontWeight: 600, 
                fontSize: '0.9rem',
                color: isSelected ? 'var(--primary)' : 'var(--text-primary)'
              }}>
                {info.name}
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: 'var(--text-muted)',
                maxWidth: 120
              }}>
                {info.description}
              </div>
            </div>
            
            {showStatus && (
              <span 
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  padding: '0.15rem 0.4rem',
                  background: info.hasKey 
                    ? (info.free ? 'var(--success)' : 'var(--warning)') 
                    : 'var(--error)',
                  color: 'white',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  borderRadius: '999px',
                  textTransform: 'uppercase'
                }}
              >
                {info.hasKey ? (info.free ? 'Free' : 'Pro') : 'No Key'}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// Inline model badge for displaying current model
export function ModelBadge({ provider }) {
  const info = CONFIG.ai.providers[provider]
  if (!info) return null
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.5rem',
      background: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: 'var(--radius-sm)',
      fontSize: '0.75rem',
      color: 'var(--primary)'
    }}>
      {info.icon} {info.name}
    </span>
  )
}

