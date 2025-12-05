/**
 * Video Modal Component
 * Displays a video in a modal overlay
 */

import { useEffect, useRef } from 'react'

export default function VideoModal({ isOpen, onClose, videoSrc, title }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="video-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div 
        className="video-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '900px',
          width: '100%',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeInScale 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🎬</span> {title || 'Video'}
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.75rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}
          >
            <span>✕</span> Close
          </button>
        </div>
        
        {/* Video Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio
          background: '#000'
        }}>
          <video
            ref={videoRef}
            controls
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-darker)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Press <kbd style={{ 
              padding: '0.15rem 0.4rem', 
              background: 'var(--bg-input)', 
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              fontSize: '0.75rem'
            }}>ESC</kbd> or click outside to close
          </p>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}

