/**
 * AffiliateAI Pro - Main App Component
 */

import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'

// Layout
import Layout from './components/Layout'
import AuthLayout from './components/AuthLayout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Journey from './pages/Journey'
import NicheDiscovery from './pages/NicheDiscovery'
import Products from './pages/Products'
import ContentGenerator from './pages/ContentGenerator'
import SEO from './pages/SEO'
import Campaigns from './pages/Campaigns'
import EmailSequences from './pages/EmailSequences'
import Calendar from './pages/Calendar'
import CanvaStudio from './pages/CanvaStudio'
import LinkTracker from './pages/LinkTracker'
import Analytics from './pages/Analytics'
import ROICalculator from './pages/ROICalculator'
import Settings from './pages/Settings'

// Components
import Toast from './components/Toast'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const { user, isLoading, initAuth, toasts } = useStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        </Route>

        {/* Protected Routes */}
        <Route element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/niche" element={<NicheDiscovery />} />
          <Route path="/products" element={<Products />} />
          <Route path="/content" element={<ContentGenerator />} />
          <Route path="/seo" element={<SEO />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/email" element={<EmailSequences />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/canva" element={<CanvaStudio />} />
          <Route path="/links" element={<LinkTracker />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/roi" element={<ROICalculator />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </>
  )
}

export default App

