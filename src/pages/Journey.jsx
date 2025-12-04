import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase, safeQuery } from '../lib/supabase'
import { CONFIG } from '../lib/config'
import { percentage } from '../lib/utils'
import { SkeletonJourneyStep } from '../components/Skeleton'

const stepIcons = {
  onboarding: '🚀', niche_discovery: '🎯', product_research: '🔍', strategy: '📋',
  content_creation: '✍️', seo: '🔎', campaigns: '📊', analytics: '📈', automation: '⚡'
}

const moduleMap = {
  onboarding: '/settings', niche_discovery: '/niche', product_research: '/products',
  strategy: '/campaigns', content_creation: '/content', seo: '/seo',
  campaigns: '/campaigns', analytics: '/analytics', automation: '/calendar'
}

const stepTasks = {
  onboarding: ['Configure your Groq API key for AI features', 'Set your experience level', 'Review the dashboard overview'],
  niche_discovery: ['Explore different niche categories', 'Use AI to analyze niche potential', 'Select your primary niche'],
  product_research: ['Search ClickBank for digital products', 'Research Amazon products', 'Add products to your portfolio'],
  strategy: ['Define your target audience', 'Choose your content platforms', 'Set realistic income goals'],
  content_creation: ['Generate blog articles with AI', 'Create social media posts', 'Write email sequences'],
  seo: ['Research target keywords', 'Analyze search intent', 'Optimize existing content'],
  campaigns: ['Create your first campaign', 'Set up tracking links', 'Define campaign goals'],
  analytics: ['Review click-through rates', 'Analyze conversion data', 'Identify top performers'],
  automation: ['Set up content calendar', 'Create automated sequences', 'Scale what works']
}

export default function Journey() {
  const navigate = useNavigate()
  const { user, addToast, updateProfile, loadJourneyProgress } = useStore()
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      if (!user) {
        if (isMounted) setLoading(false)
        return
      }
      
      try {
        const { data, error } = await safeQuery(() =>
          supabase
            .from('user_journey')
            .select('*')
            .eq('user_id', user.id)
            .order('step_number')
        )

        if (error) {
          console.error('Journey query error:', error)
          addToast('Error loading journey data', 'error')
        }

        if (isMounted) {
          const merged = CONFIG.journeySteps.map(configStep => {
            const dbStep = data?.find(d => d.step_number === configStep.number)
            return { ...configStep, completed: dbStep?.completed || false, completedAt: dbStep?.completed_at }
          })
          setSteps(merged)
        }
      } catch (error) {
        console.error('Load journey error:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    
    fetchData()
    return () => { isMounted = false }
  }, [user?.id])

  const loadJourney = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('user_journey')
        .select('*')
        .eq('user_id', user.id)
        .order('step_number')

      const merged = CONFIG.journeySteps.map(configStep => {
        const dbStep = data?.find(d => d.step_number === configStep.number)
        return { ...configStep, completed: dbStep?.completed || false, completedAt: dbStep?.completed_at }
      })
      setSteps(merged)
    } catch (error) {
      console.error('Load journey error:', error)
    }
  }

  const completeStep = async (stepNumber) => {
    try {
      await supabase.from('user_journey').update({
        completed: true,
        completed_at: new Date().toISOString()
      }).eq('user_id', user.id).eq('step_number', stepNumber)

      await updateProfile({ current_step: stepNumber + 1 })
      
      // Refresh both local and global state
      await loadJourney()
      await loadJourneyProgress()
      
      addToast('Step completed! Keep going!', 'success')
    } catch (error) {
      addToast('Error updating progress', 'error')
    }
  }

  const currentStepIndex = steps.findIndex(s => !s.completed)
  const currentStep = currentStepIndex >= 0 ? currentStepIndex : steps.length - 1
  const completedCount = steps.filter(s => s.completed).length
  const progressPercent = percentage(completedCount, steps.length)

  if (loading) {
    return (
      <div className="journey-page fade-in" style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div className="skeleton-card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <div className="skeleton skeleton-title" style={{ width: 300 }} />
          <div className="skeleton skeleton-text" style={{ width: 400 }} />
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="skeleton" style={{ width: 60, height: 40, marginBottom: '0.5rem' }} />
                <div className="skeleton skeleton-text sm" style={{ width: 70 }} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[...Array(5)].map((_, i) => (
            <SkeletonJourneyStep key={i} index={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="journey-page fade-in" style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Progress Overview */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem',
        padding: '2rem', background: 'var(--gradient-card)', border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)', marginBottom: '2rem'
      }}>
        <div>
          <h2>Your Path to Passive Income</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Follow these steps to build a successful affiliate marketing business
          </p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {[{ num: completedCount, label: 'Completed' }, { num: steps.length - completedCount, label: 'Remaining' }, { num: `${progressPercent}%`, label: 'Progress' }].map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{stat.num}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          width: 140, height: 140, borderRadius: '50%',
          background: `conic-gradient(var(--primary) ${progressPercent}%, var(--bg-input) ${progressPercent}%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: 110, height: 110, background: 'var(--bg-card)', borderRadius: '50%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{progressPercent}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Complete</span>
          </div>
        </div>
      </div>

      {/* Steps Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {steps.map((step, index) => {
          const isComplete = step.completed
          const isCurrent = index === currentStep
          const isLocked = index > currentStep && !step.completed

          return (
            <div
              key={step.number}
              onClick={() => !isLocked && navigate(moduleMap[step.module])}
              style={{
                display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem',
                background: 'var(--bg-card)', border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)', cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.4 : 1,
                boxShadow: isCurrent ? 'var(--shadow-glow)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: isComplete ? 'var(--success)' : isCurrent ? 'var(--gradient-primary)' : 'var(--bg-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isComplete ? '1.25rem' : '1.5rem', fontWeight: 600,
                color: isComplete || isCurrent ? 'white' : 'var(--text-muted)'
              }}>
                {isComplete ? '✓' : stepIcons[step.module] || step.number}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{step.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{step.description}</div>
              </div>
              <span className={`tag ${isComplete ? 'success' : isCurrent ? 'primary' : ''}`}>
                {isComplete ? 'Complete' : isCurrent ? 'In Progress' : 'Locked'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Current Step Details */}
      {currentStepIndex >= 0 && (
        <div style={{
          padding: '2rem', background: 'var(--gradient-card)',
          border: '2px solid var(--primary)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{stepIcons[steps[currentStep].module]}</span>
            <div style={{ flex: 1 }}>
              <h3>Step {steps[currentStep].number}: {steps[currentStep].name}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{steps[currentStep].description}</p>
            </div>
            <span className="tag primary">Current Step</span>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>Tasks to Complete:</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(stepTasks[steps[currentStep].module] || []).map((task, i) => (
                <li key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)'
                }}>
                  <span style={{ color: 'var(--primary)' }}>✦</span> {task}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => navigate(moduleMap[steps[currentStep].module])}>
              Start This Step
            </button>
            <button className="btn btn-secondary" onClick={() => completeStep(steps[currentStep].number)}>
              Mark as Complete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
