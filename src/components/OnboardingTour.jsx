/**
 * Onboarding Tour Component
 * Guides new users through the app features
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

const tourSteps = [
  {
    id: 'welcome',
    target: null, // Full screen welcome
    title: '👋 Welcome to AffiliateAI Pro!',
    content: "Let's take a quick tour to help you get started with building your affiliate marketing business.",
    position: 'center'
  },
  {
    id: 'sidebar',
    target: '.sidebar',
    title: '📍 Navigation Sidebar',
    content: 'This is your command center. Access all features from here - from niche discovery to analytics.',
    position: 'right'
  },
  {
    id: 'journey',
    target: '.journey-progress',
    title: '🗺️ Your Journey Progress',
    content: 'Track your progress through the 9-step affiliate marketing journey. Complete each step to build your business.',
    position: 'right'
  },
  {
    id: 'dashboard',
    target: '.stats-grid',
    title: '📊 Dashboard Stats',
    content: 'See your key metrics at a glance - niches, products, content pieces, and earnings.',
    position: 'bottom'
  },
  {
    id: 'ai-assistant',
    target: '.top-bar-actions',
    title: '🤖 AI Assistant',
    content: 'Click here anytime to chat with your AI assistant for help with content, strategies, and more.',
    position: 'bottom'
  },
  {
    id: 'settings',
    target: '.sidebar-footer',
    title: '⚙️ Settings & API Keys',
    content: 'Configure your AI provider API keys in Settings to unlock all AI-powered features.',
    position: 'top',
    path: '/settings'
  },
  {
    id: 'complete',
    target: null,
    title: '🎉 You\'re All Set!',
    content: 'Start your journey by discovering a profitable niche. Click "Let\'s Go" to begin!',
    position: 'center',
    path: '/niche'
  }
]

export default function OnboardingTour({ onComplete }) {
  const navigate = useNavigate()
  const { profile, updateProfile, addToast } = useStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [spotlightRect, setSpotlightRect] = useState(null)

  const step = tourSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === tourSteps.length - 1

  const calculatePosition = useCallback(() => {
    if (!step.target || step.position === 'center') {
      setSpotlightRect(null)
      setTooltipPosition({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      })
      return
    }

    const element = document.querySelector(step.target)
    if (!element) return

    const rect = element.getBoundingClientRect()
    const padding = 10

    setSpotlightRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2
    })

    // Calculate tooltip position based on step.position
    const tooltipWidth = 360
    const tooltipHeight = 200 // Approximate
    let pos = {}

    switch (step.position) {
      case 'right':
        pos = {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.right + 20
        }
        break
      case 'left':
        pos = {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.left - tooltipWidth - 20
        }
        break
      case 'bottom':
        pos = {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2 - tooltipWidth / 2
        }
        break
      case 'top':
        pos = {
          top: rect.top - tooltipHeight - 20,
          left: rect.left + rect.width / 2 - tooltipWidth / 2
        }
        break
      default:
        pos = {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
    }

    // Keep tooltip in viewport
    pos.left = Math.max(20, Math.min(window.innerWidth - tooltipWidth - 20, pos.left))
    pos.top = Math.max(20, Math.min(window.innerHeight - tooltipHeight - 20, pos.top))

    setTooltipPosition(pos)
  }, [step])

  useEffect(() => {
    calculatePosition()
    window.addEventListener('resize', calculatePosition)
    return () => window.removeEventListener('resize', calculatePosition)
  }, [calculatePosition, currentStep])

  const handleNext = () => {
    if (isLastStep) {
      completeTour()
    } else {
      // Navigate if needed
      if (tourSteps[currentStep + 1]?.path) {
        navigate(tourSteps[currentStep + 1].path)
      }
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    completeTour()
  }

  const completeTour = async () => {
    // Save that user has completed the tour
    if (profile) {
      await updateProfile({ onboarding_completed: true })
    }
    localStorage.setItem('affiliateai_tour_completed', 'true')
    addToast('Welcome! Let\'s build your affiliate business 🚀', 'success')
    if (onComplete) onComplete()
    if (step.path) navigate(step.path)
  }

  const getArrowPosition = () => {
    switch (step.position) {
      case 'right': return 'left'
      case 'left': return 'right'
      case 'bottom': return 'top'
      case 'top': return 'bottom'
      default: return null
    }
  }

  const arrowPos = getArrowPosition()

  return (
    <div className="tour-overlay">
      {/* Spotlight */}
      {spotlightRect && (
        <div 
          className="tour-spotlight"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height
          }}
        />
      )}

      {/* Tooltip */}
      <div 
        className="tour-tooltip"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: tooltipPosition.transform
        }}
      >
        {arrowPos && <div className={`tour-tooltip-arrow ${arrowPos}`} />}
        
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>{step.title}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {step.content}
        </p>

        {/* Step indicators */}
        <div className="tour-step-indicator">
          {tourSteps.map((_, i) => (
            <div 
              key={i} 
              className={`tour-step-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={handleSkip}
          >
            Skip Tour
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isFirstStep && (
              <button className="btn btn-secondary btn-sm" onClick={handlePrev}>
                Back
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={handleNext}>
              {isLastStep ? "Let's Go!" : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


