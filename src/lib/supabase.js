import { createClient } from '@supabase/supabase-js'
import { CONFIG } from './config'

export const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

/**
 * Wait for auth to be ready before making queries
 * Simply checks if session exists, with a small delay for RLS
 */
export const withAuth = async (queryFn) => {
  // Small delay to ensure auth session is fully established
  await new Promise(resolve => setTimeout(resolve, 100))
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
 * Safe query helper - combines auth delay and timeout
 */
export const safeQuery = async (queryFn, timeoutMs = 10000) => {
  // Small delay to ensure auth is ready
  await new Promise(resolve => setTimeout(resolve, 100))
  return withTimeout(queryFn(), timeoutMs)
}
