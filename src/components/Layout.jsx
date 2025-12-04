import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getInitials, percentage } from '../lib/utils'
import { useState, useEffect } from 'react'
import AISidebar from './AISidebar'
import ThemeToggle from './ThemeToggle'
import OnboardingTour from './OnboardingTour'
import './Layout.css'

const navItems = [
  { path: '/', icon: '⌘', label: 'Dashboard' },
  { path: '/journey', icon: '🗺️', label: 'My Journey', badge: true },
  { divider: 'AI Tools' },
  { path: '/niche', icon: '🎯', label: 'Niche Discovery' },
  { path: '/products', icon: '📦', label: 'Product Research' },
  { path: '/content', icon: '✍️', label: 'Content Generator' },
  { path: '/seo', icon: '🔍', label: 'SEO & Keywords' },
  { divider: 'Marketing' },
  { path: '/campaigns', icon: '📊', label: 'Campaigns' },
  { path: '/email', icon: '📧', label: 'Email Sequences' },
  { path: '/calendar', icon: '📅', label: 'Content Calendar' },
  { divider: 'Resources' },
  { path: '/affiliates', icon: '🏦', label: 'Affiliate Programs' },
  { path: '/canva', icon: '🎨', label: 'Canva Studio' },
  { path: '/links', icon: '🔗', label: 'Link Tracker' },
  { divider: 'Analytics' },
  { path: '/analytics', icon: '📈', label: 'Analytics' },
  { path: '/roi', icon: '💰', label: 'ROI Calculator' }
]

const pageTitles = {
  '/': ['Dashboard', 'Your affiliate marketing command center'],
  '/journey': ['My Journey', 'Track your progress to passive income'],
  '/niche': ['Niche Discovery', 'Find your profitable niche with AI'],
  '/products': ['Product Research', 'Discover high-converting products'],
  '/content': ['Content Generator', 'Create AI-powered marketing content'],
  '/seo': ['SEO & Keywords', 'Optimize for search engines'],
  '/campaigns': ['Campaigns', 'Manage your marketing campaigns'],
  '/email': ['Email Sequences', 'Create automated email campaigns'],
  '/calendar': ['Content Calendar', 'Schedule and plan your content'],
  '/affiliates': ['Affiliate Programs', 'Browse 50+ affiliate programs'],
  '/canva': ['Canva Studio', 'Create stunning visuals'],
  '/links': ['Link Tracker', 'Track your affiliate links'],
  '/analytics': ['Analytics', 'Monitor your performance'],
  '/roi': ['ROI Calculator', 'Calculate your returns'],
  '/settings': ['Settings', 'Configure your account']
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { 
    profile, user, signOut, sidebarOpen, setSidebarOpen, 
    aiSidebarOpen, setAiSidebarOpen,
    journeyProgress, currentStep, loadJourneyProgress,
    theme
  } = useStore()
  
  const [showTour, setShowTour] = useState(false)

  // Load journey progress and initialize theme
  useEffect(() => {
    if (user?.id) {
      loadJourneyProgress()
      
      // Check if user needs onboarding
      const tourCompleted = localStorage.getItem('affiliateai_tour_completed')
      if (!tourCompleted && !profile?.onboarding_completed) {
        // Small delay to let the layout render first
        setTimeout(() => setShowTour(true), 500)
      }
    }
  }, [user?.id, profile?.onboarding_completed])

  // Apply theme on mount and changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const [title, subtitle] = pageTitles[location.pathname] || ['Page', '']
  const progressPercent = percentage(journeyProgress.completed, journeyProgress.total)

  return (
    <div className="app-container">
      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">AffiliateAI</span>
          </div>
        </div>

        <div className="user-info">
          <div className="user-avatar">{getInitials(profile?.full_name || 'U')}</div>
          <div className="user-details">
            <span className="user-name">{profile?.full_name || user?.email?.split('@')[0]}</span>
            <span className="user-level">{profile?.experience_level || 'Beginner'}</span>
          </div>
        </div>

        <div className="journey-progress">
          <div className="progress-label">
            <span>Journey Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <ul className="nav-menu">
          {navItems.map((item, index) => (
            item.divider ? (
              <li key={index} className="nav-divider">{item.divider}</li>
            ) : (
              <li
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
                {item.badge && <span className="nav-badge">Step {currentStep}</span>}
              </li>
            )
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="theme-toggle-wrapper" style={{ padding: '0.5rem 1rem', marginBottom: '0.5rem' }}>
            <ThemeToggle showLabel />
          </div>
          <button className="nav-item" onClick={() => navigate('/settings')}>
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </button>
          <button className="nav-item" onClick={signOut}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="page-title">
            <h1>{title}</h1>
            <span className="page-subtitle">{subtitle}</span>
          </div>
          <div className="top-bar-actions">
            <button className="btn btn-ghost" onClick={() => setAiSidebarOpen(true)}>
              <span>🤖</span>
              <span className="btn-text">AI Assistant</span>
            </button>
          </div>
        </header>

        <div className="content-wrapper">
          {/* Key forces React to remount page components on navigation */}
          <Outlet key={location.pathname} />
        </div>
      </main>

      {/* AI Sidebar */}
      <AISidebar open={aiSidebarOpen} onClose={() => setAiSidebarOpen(false)} />
      
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      
      {/* Onboarding Tour */}
      {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
    </div>
  )
}
