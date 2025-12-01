import { createClient } from '@supabase/supabase-js'
import { CONFIG } from './config'

export const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'affiliateai-pro'
    }
  },
  db: {
    schema: 'public'
  },
  // Disable realtime to prevent stale connections
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
})

// Query timeout wrapper - prevents hanging queries
export const withTimeout = (promise, timeoutMs = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
    )
  ])
}

// Handle visibility change - refresh connection when tab becomes visible
if (typeof document !== 'undefined') {
  let wasHidden = false
  
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') {
      wasHidden = true
    } else if (document.visibilityState === 'visible' && wasHidden) {
      wasHidden = false
      // Small delay then refresh session
      setTimeout(async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            await supabase.auth.setSession(session)
          }
        } catch (e) {
          console.warn('Session refresh failed:', e)
        }
      }, 100)
    }
  })
}

