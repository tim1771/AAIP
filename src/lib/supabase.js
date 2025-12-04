import { createClient } from '@supabase/supabase-js'
import { CONFIG } from './config'

export const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Promise that resolves when auth is ready
let authReadyPromise = null
let authReadyResolve = null

// Initialize the auth ready promise
const initAuthReady = () => {
  if (!authReadyPromise) {
    authReadyPromise = new Promise(resolve => {
      authReadyResolve = resolve
    })
    
    // Check if already authenticated
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        authReadyResolve(data.session)
      }
    })
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        authReadyResolve(session)
      } else if (event === 'SIGNED_OUT') {
        // Reset for next login
        authReadyPromise = new Promise(resolve => {
          authReadyResolve = resolve
        })
      }
    })
  }
  return authReadyPromise
}

// Initialize on load
initAuthReady()

/**
 * Wait for auth to be ready before making queries
 * Use this wrapper for queries that need authentication
 */
export const withAuth = async (queryFn) => {
  await initAuthReady()
  // Small additional delay for RLS policies to be fully ready
  await new Promise(resolve => setTimeout(resolve, 50))
  return queryFn()
}

/**
 * Wrapper for database queries with optional timeout
 */
export const withTimeout = (promise, ms = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), ms)
    )
  ])
}

/**
 * Safe query helper - combines auth waiting and timeout
 */
export const safeQuery = async (queryFn, timeoutMs = 10000) => {
  return withAuth(() => withTimeout(queryFn(), timeoutMs))
}
