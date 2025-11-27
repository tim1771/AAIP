/**
 * AffiliateAI Pro - Global State Store (Zustand)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

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
      
      // Toast notifications
      toasts: [],
      
      // Actions
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setAiSidebarOpen: (open) => set({ aiSidebarOpen: open }),
      setCurrentModule: (module) => set({ currentModule: module }),

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
          set({ user: null, profile: null })
          get().addToast('Signed out successfully', 'info')
        } catch (error) {
          get().addToast(error.message, 'error')
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
          get().addToast('Profile updated!', 'success')
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
          }
          
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              set({ user: session.user })
              await get().loadProfile()
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, profile: null })
            }
          })
        } finally {
          set({ isLoading: false })
        }
      },

      // Getters
      getGroqApiKey: () => {
        const { profile } = get()
        return profile?.groq_api_key || localStorage.getItem('affiliateai_groq_api_key')
      },
      
      hasApiKey: () => !!get().getGroqApiKey(),
      
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
        sidebarOpen: state.sidebarOpen
      })
    }
  )
)

