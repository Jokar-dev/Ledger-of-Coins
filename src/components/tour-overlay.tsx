'use client'

import { useEffect, useState } from 'react'
import { useTour } from './tour-provider'
import { TOUR_STEPS } from '@/lib/tour-config'

export default function TourOverlay() {
  const { isActive, currentStepIndex, nextStep, prevStep, skipTour, finishTour, startTour } = useTour()
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 })

  const step = TOUR_STEPS[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === TOUR_STEPS.length - 1

  // Update target rect on step change or window resize
  useEffect(() => {
    if (!isActive) return

    const updateRect = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight })
      if (!step.targetId) {
        setTargetRect(null)
        return
      }
      const el = document.querySelector(`[data-tour="${step.targetId}"]`)
      if (el) {
        setTargetRect(el.getBoundingClientRect())
        // Smooth scroll to element if it's out of view
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      } else {
        setTargetRect(null)
      }
    }

    updateRect()
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, { passive: true })
    
    // Give DOM a moment to render dynamically generated elements
    const timeout = setTimeout(updateRect, 150)

    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect)
      clearTimeout(timeout)
    }
  }, [isActive, currentStepIndex, step.targetId])

  if (!isActive) return null

  // Calculate popup position based on alignment and targetRect
  let popupStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }

  if (targetRect && step.alignment !== 'center') {
    const margin = 20
    if (step.alignment === 'right') {
      popupStyle = {
        top: Math.max(20, targetRect.top + targetRect.height / 2),
        left: targetRect.right + margin,
        transform: 'translate(0, -50%)',
      }
    } else if (step.alignment === 'left') {
      popupStyle = {
        top: Math.max(20, targetRect.top + targetRect.height / 2),
        right: windowSize.w - targetRect.left + margin,
        transform: 'translate(0, -50%)',
      }
    } else if (step.alignment === 'bottom') {
      popupStyle = {
        top: targetRect.bottom + margin,
        left: targetRect.left + targetRect.width / 2,
        transform: 'translate(-50%, 0)',
      }
    }
    
    // Safety clamp for mobile screens
    if (windowSize.w < 768) {
      popupStyle = {
        top: targetRect.bottom + margin,
        left: '50%',
        transform: 'translate(-50%, 0)',
        width: 'calc(100% - 40px)'
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto">
      {/* Dark overlay with a hole cut out for the target */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-500 ease-out">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="8"
                fill="black"
                className="transition-all duration-500 ease-out"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#tour-mask)"
        />
        {/* Glowing border around target */}
        {targetRect && (
          <rect
            x={targetRect.left - 8}
            y={targetRect.top - 8}
            width={targetRect.width + 16}
            height={targetRect.height + 16}
            rx="8"
            fill="none"
            stroke="#f2ca50"
            strokeWidth="2"
            className="transition-all duration-500 ease-out"
            filter="drop-shadow(0 0 8px rgba(242,202,80,0.8))"
          />
        )}
      </svg>

      {/* Parchment Popup */}
      <div 
        className="absolute bg-[#2D231E] border-2 border-primary/50 rounded-xl p-6 shadow-[0_0_40px_rgba(242,202,80,0.3)] w-[360px] max-w-[90vw] transition-all duration-500 ease-out overflow-hidden"
        style={popupStyle}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(45deg, #f2ca50, #f2ca50 1px, transparent 1px, transparent 20px)" }} />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-primary/20">
            <h3 className="font-display-lg text-xl text-primary-fixed gold-glow">{step.title}</h3>
            <span className="font-label-sm text-xs text-on-surface-variant">
              {currentStepIndex + 1} / {TOUR_STEPS.length}
            </span>
          </div>
          
          <div className="font-body-md text-sm text-on-surface whitespace-pre-wrap leading-relaxed mb-8">
            {step.description}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {isLast ? (
                <button onClick={startTour} className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded text-xs uppercase tracking-widest hover:text-primary hover:border-primary transition-all">
                  Restart
                </button>
              ) : (
                <button onClick={skipTour} className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded text-xs uppercase tracking-widest hover:text-error hover:border-error transition-all">
                  Skip Tour
                </button>
              )}
            </div>
            <div className="flex gap-2 ml-auto">
              {!isFirst && !isLast && (
                <button onClick={prevStep} className="px-4 py-2 bg-surface border border-outline-variant text-on-surface rounded text-xs uppercase tracking-widest hover:bg-surface-high transition-all">
                  Previous
                </button>
              )}
              {isLast ? (
                <button onClick={finishTour} className="px-5 py-2 bg-primary/20 border border-primary text-primary rounded text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary hover:shadow-glow transition-all">
                  Finish Journey
                </button>
              ) : (
                <button onClick={nextStep} className="px-5 py-2 bg-primary/10 border border-primary/50 text-primary rounded text-xs uppercase tracking-widest hover:bg-primary/20 hover:shadow-glow transition-all">
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
