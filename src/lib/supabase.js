import { createClient } from '@supabase/supabase-js'
import { CONFIG } from './config'

export const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Simple query wrapper - just returns the promise as-is
// The safety timeouts in components will handle hanging
export const withTimeout = (promise) => promise

