/**
 * AffiliateAI Pro - Global State Store (Zustand)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, withTimeout } from '../lib/supabase'

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth State
      user: null,
      profile: null,
      isLoading: true,
      
      // UI State
      sidebarOpen: true,
      aiSidebarOpen: false,
      currentModule: 'dashboard',
      theme: localStorage.getItem('affiliateai_theme') || 'dark',
      showOnboarding: false,
      
      // Journey State (synced globally)
      journeyProgress: { completed: 0, total: 9 },
      currentStep: 1,
      
      // AI Provider State
      selectedTextProvider: 'groq',
      selectedImageProvider: 'google',
      
      // Toast notifications
      toasts: [],
      
      // Actions
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setAiSidebarOpen: (open) => set({ aiSidebarOpen: open }),
      setCurrentModule: (module) => set({ currentModule: module }),
      setTheme: (theme) => {
        localStorage.setItem('affiliateai_theme', theme)
        set({ theme })
      },
      setShowOnboarding: (show) => set({ showOnboarding: show }),
      
      // AI Provider Actions
      setSelectedTextProvider: (provider) => set({ selectedTextProvider: provider }),
      setSelectedImageProvider: (provider) => set({ selectedImageProvider: provider }),

      // Journey Actions
      setJourneyProgress: (progress) => set({ journeyProgress: progress }),
      setCurrentStep: (step) => set({ currentStep: step }),
      
      loadJourneyProgress: async () => {
        const { user } = get()
        if (!user) return
        
        try {
          const { data } = await withTimeout(
            supabase
              .from('user_journey')
              .select('*')
              .eq('user_id', user.id)
              .order('step_number'),
            6000
          )

          if (data && data.length > 0) {
            const completed = data.filter(s => s.completed).length
            const total = data.length
            const current = data.find(s => !s.completed)?.step_number || total
            
            set({ 
              journeyProgress: { completed, total },
              currentStep: current 
            })
          }
        } catch (error) {
          console.error('Error loading journey progress:', error)
        }
      },

      // Toast actions
      addToast: (message, type = 'info') => {
        const id = Date.now()
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }]
        }))
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id)
          }))
        }, 5000)
      },
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      })),

      // Auth actions
      signIn: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
          
          set({ user: data.user })
          await get().loadProfile()
          await get().loadJourneyProgress()
          get().addToast('Welcome back!', 'success')
          return { success: true }
        } catch (error) {
          get().addToast(error.message, 'error')
          return { success: false, error }
        }
      },

      signUp: async (email, password, fullName) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
          })
          if (error) throw error
          
          get().addToast('Account created! Check your email to verify.', 'success')
          return { success: true, data }
        } catch (error) {
          get().addToast(error.message, 'error')
          return { success: false, error }
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut()
          set({ user: null, profile: null, journeyProgress: { completed: 0, total: 9 }, currentStep: 1 })
          get().addToast('Signed out successfully', 'info')
        } catch (error) {
          get().addToast(error.message, 'error')
        }
      },

      resetPassword: async (email) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/login?reset=true`
          })
          if (error) throw error
          get().addToast('Password reset email sent! Check your inbox.', 'success')
          return { success: true }
        } catch (error) {
          get().addToast(error.message, 'error')
          return { success: false, error }
        }
      },

      loadProfile: async () => {
        const { user } = get()
        if (!user) return null

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (error) throw error
          set({ profile: data })
          return data
        } catch (error) {
          console.error('Error loading profile:', error)
          return null
        }
      },

      updateProfile: async (updates) => {
        const { user } = get()
        if (!user) return { success: false }

        try {
          const { data, error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', user.id)
            .select()
            .single()
          
          if (error) throw error
          set({ profile: data })
          get().addToast('Settings saved!', 'success')
          return { success: true, data }
        } catch (error) {
          get().addToast(error.message, 'error')
          return { success: false, error }
        }
      },

      // Initialize auth state
      initAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            set({ user: session.user })
            await get().loadProfile()
            await get().loadJourneyProgress()
          }
          
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              set({ user: session.user })
              await get().loadProfile()
              await get().loadJourneyProgress()
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, profile: null })
            }
          })
        } finally {
          set({ isLoading: false })
        }
      },

      // API Key Getters (multi-provider)
      getApiKey: (provider) => {
        const { profile } = get()
        const keyMap = {
          groq: 'groq_api_key',
          anthropic: 'anthropic_api_key',
          google: 'google_api_key'
        }
        const keyName = keyMap[provider]
        return profile?.[keyName] || localStorage.getItem(`affiliateai_${keyName}`)
      },
      
      // Legacy getter for backwards compatibility
      getGroqApiKey: () => get().getApiKey('groq'),
      
      hasApiKey: (provider = 'groq') => !!get().getApiKey(provider),
      
      hasAnyTextApiKey: () => {
        return get().hasApiKey('groq') || get().hasApiKey('anthropic') || get().hasApiKey('google')
      },
      
      hasImageApiKey: () => get().hasApiKey('google'),
      
      getDisplayName: () => {
        const { profile, user } = get()
        return profile?.full_name || user?.email?.split('@')[0] || 'User'
      },
      
      getExperienceLevel: () => {
        const { profile } = get()
        return profile?.experience_level || 'beginner'
      }
    }),
    {
      name: 'affiliateai-storage',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        selectedTextProvider: state.selectedTextProvider,
        selectedImageProvider: state.selectedImageProvider,
        theme: state.theme
      })
    }
  )
)
