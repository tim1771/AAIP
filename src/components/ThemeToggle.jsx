/**
 * Theme Toggle Component
 * Switches between light and dark modes
 */

import { useStore } from '../store/useStore'

export default function ThemeToggle({ showLabel = false }) {
  const { theme, setTheme } = useStore()
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {showLabel && (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {theme === 'dark' ? 'Dark' : 'Light'} Mode
        </span>
      )}
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <div className="theme-toggle-indicator">
          {theme === 'dark' ? '🌙' : '☀️'}
        </div>
      </button>
    </div>
  )
}

