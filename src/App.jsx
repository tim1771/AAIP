/**
 * AffiliateAI Pro - Main App Component
 */

import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'

// Layout - loaded immediately
import Layout from './components/Layout'
import AuthLayout from './components/AuthLayout'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingScreen from './components/LoadingScreen'
import Toast from './components/Toast'

// Lazy-loaded pages for better performance
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Journey = lazy(() => import('./pages/Journey'))
const NicheDiscovery = lazy(() => import('./pages/NicheDiscovery'))
const Products = lazy(() => import('./pages/Products'))
const ContentGenerator = lazy(() => import('./pages/ContentGenerator'))
const SEO = lazy(() => import('./pages/SEO'))
const Campaigns = lazy(() => import('./pages/Campaigns'))
const EmailSequences = lazy(() => import('./pages/EmailSequences'))
const Calendar = lazy(() => import('./pages/Calendar'))
const AffiliatePrograms = lazy(() => import('./pages/AffiliatePrograms'))
const CanvaStudio = lazy(() => import('./pages/CanvaStudio'))
const LinkTracker = lazy(() => import('./pages/LinkTracker'))
const Analytics = lazy(() => import('./pages/Analytics'))
const ROICalculator = lazy(() => import('./pages/ROICalculator'))
const Settings = lazy(() => import('./pages/Settings'))

// Page loading fallback
function PageLoader() {
  return (
    <div className="loading-state" style={{ minHeight: '50vh' }}>
      <div className="loader-ring" />
      <p>Loading...</p>
    </div>
  )
}

function App() {
  const { user, isLoading, initAuth, toasts } = useStore()

  useEffect(() => {
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          </Route>

          {/* Protected Routes */}
          <Route element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/" element={
              <Suspense fallback={<PageLoader />}><Dashboard /></Suspense>
            } />
            <Route path="/journey" element={
              <Suspense fallback={<PageLoader />}><Journey /></Suspense>
            } />
            <Route path="/niche" element={
              <Suspense fallback={<PageLoader />}><NicheDiscovery /></Suspense>
            } />
            <Route path="/products" element={
              <Suspense fallback={<PageLoader />}><Products /></Suspense>
            } />
            <Route path="/content" element={
              <Suspense fallback={<PageLoader />}><ContentGenerator /></Suspense>
            } />
            <Route path="/seo" element={
              <Suspense fallback={<PageLoader />}><SEO /></Suspense>
            } />
            <Route path="/campaigns" element={
              <Suspense fallback={<PageLoader />}><Campaigns /></Suspense>
            } />
            <Route path="/email" element={
              <Suspense fallback={<PageLoader />}><EmailSequences /></Suspense>
            } />
            <Route path="/calendar" element={
              <Suspense fallback={<PageLoader />}><Calendar /></Suspense>
            } />
            <Route path="/affiliates" element={
              <Suspense fallback={<PageLoader />}><AffiliatePrograms /></Suspense>
            } />
            <Route path="/canva" element={
              <Suspense fallback={<PageLoader />}><CanvaStudio /></Suspense>
            } />
            <Route path="/links" element={
              <Suspense fallback={<PageLoader />}><LinkTracker /></Suspense>
            } />
            <Route path="/analytics" element={
              <Suspense fallback={<PageLoader />}><Analytics /></Suspense>
            } />
            <Route path="/roi" element={
              <Suspense fallback={<PageLoader />}><ROICalculator /></Suspense>
            } />
            <Route path="/settings" element={
              <Suspense fallback={<PageLoader />}><Settings /></Suspense>
            } />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ErrorBoundary>
  )
}

export default App
