import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getInitials, percentage } from '../lib/utils'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AISidebar from './AISidebar'
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
  { divider: 'Integrations' },
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
  '/canva': ['Canva Studio', 'Create stunning visuals'],
  '/links': ['Link Tracker', 'Track your affiliate links'],
  '/analytics': ['Analytics', 'Monitor your performance'],
  '/roi': ['ROI Calculator', 'Calculate your returns'],
  '/settings': ['Settings', 'Configure your account']
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, user, signOut, sidebarOpen, setSidebarOpen, aiSidebarOpen, setAiSidebarOpen } = useStore()
  const [journeyProgress, setJourneyProgress] = useState({ completed: 0, total: 9 })
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    loadJourneyProgress()
  }, [user])

  const loadJourneyProgress = async () => {
    if (!user) return
    const { data } = await supabase
      .from('user_journey')
      .select('*')
      .eq('user_id', user.id)

    if (data) {
      const completed = data.filter(s => s.completed).length
      setJourneyProgress({ completed, total: data.length })
      const current = data.find(s => !s.completed)?.step_number || data.length
      setCurrentStep(current)
    }
  }

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
          <Outlet />
        </div>
      </main>

      {/* AI Sidebar */}
      <AISidebar open={aiSidebarOpen} onClose={() => setAiSidebarOpen(false)} />
      
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

