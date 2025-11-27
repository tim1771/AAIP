import { useStore } from '../store/useStore'

const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}

export default function Toast({ id, message, type = 'info' }) {
  const { removeToast } = useStore()

  return (
    <div className={`toast ${type}`}>
      <span style={{ fontSize: '1.25rem' }}>{icons[type]}</span>
      <span style={{ flex: 1, fontSize: '0.9rem' }}>{message}</span>
      <button
        onClick={() => removeToast(id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '0.25rem',
          fontSize: '1.25rem'
        }}
      >
        ×
      </button>
    </div>
  )
}

