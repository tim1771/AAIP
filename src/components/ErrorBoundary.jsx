/**
 * Error Boundary Component
 * Catches JavaScript errors and displays a fallback UI
 */

import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--gradient-dark)',
          padding: '2rem'
        }}>
          <div style={{
            maxWidth: 500,
            textAlign: 'center',
            padding: '3rem',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😵</div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Oops! Something went wrong
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.href = '/'
                }}
              >
                Go Home
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details style={{ 
                marginTop: '2rem', 
                textAlign: 'left',
                padding: '1rem',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem'
              }}>
                <summary style={{ cursor: 'pointer', color: 'var(--error)' }}>
                  Error Details (Dev Only)
                </summary>
                <pre style={{ 
                  marginTop: '0.5rem', 
                  overflow: 'auto',
                  color: 'var(--text-muted)'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

