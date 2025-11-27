import { Outlet } from 'react-router-dom'
import './AuthLayout.css'

export default function AuthLayout() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">AffiliateAI Pro</span>
          </div>
          <p className="auth-subtitle">AI-Powered Passive Income Generation</p>
        </div>
        
        <Outlet />

        <div className="auth-features">
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>AI Niche Discovery</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📈</span>
            <span>Automated Content</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <span>Passive Income</span>
          </div>
        </div>
      </div>
    </div>
  )
}

