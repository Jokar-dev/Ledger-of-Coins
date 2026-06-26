'use client'

import { useEffect, useState, useRef } from 'react'
import { useTour } from './tour-provider'
import { TOUR_STEPS } from '@/lib/tour-config'

export default function TourOverlay() {
  const { isActive, currentStepIndex, nextStep, prevStep, skipTour, finishTour, startTour } = useTour()
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 })

  const popupRef = useRef<HTMLDivElement>(null)
  const [popupDim, setPopupDim] = useState({ w: 380, h: 320 })

  const step = TOUR_STEPS[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === TOUR_STEPS.length - 1

  // Update target rect on step change or window resize/scroll
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
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      } else {
        setTargetRect(null)
      }
    }

    updateRect()
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, { passive: true })
    
    const timeout = setTimeout(updateRect, 150)

    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect)
      clearTimeout(timeout)
    }
  }, [isActive, currentStepIndex, step.targetId])

  // Observe popup dimensions dynamically
  useEffect(() => {
    if (!popupRef.current) return
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setPopupDim({
          w: entry.borderBoxSize?.[0]?.inlineSize || entry.contentRect.width || 380,
          h: entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height || 320,
        })
      }
    })
    observer.observe(popupRef.current)
    return () => observer.disconnect()
  }, [isActive, currentStepIndex])

  if (!isActive) return null

  // Default centered position
  let popupStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(380px, calc(100vw - 32px))',
  }

  // Intelligent Contextual Positioning Solver (like Notion/Figma/Vercel)
  if (targetRect && step.alignment !== 'center' && windowSize.w >= 640 && windowSize.h >= 500) {
    const margin = 20
    const safeEdge = 16
    const W = Math.min(380, windowSize.w - 32)
    const H = popupDim.h || 320

    const spaceRight = windowSize.w - targetRect.right - margin
    const spaceLeft = targetRect.left - margin
    const spaceBottom = windowSize.h - targetRect.bottom - margin
    const spaceTop = targetRect.top - margin

    const halfH = H / 2
    const halfW = W / 2

    const clampY = (y: number) => Math.max(safeEdge + halfH, Math.min(windowSize.h - safeEdge - halfH, y))
    const clampX = (x: number) => Math.max(safeEdge + halfW, Math.min(windowSize.w - safeEdge - halfW, x))

    const tryRight = () => spaceRight >= W + safeEdge ? ({
      top: clampY(targetRect.top + targetRect.height / 2),
      left: targetRect.right + margin,
      transform: 'translate(0, -50%)',
      width: `${W}px`,
    }) : null

    const tryLeft = () => spaceLeft >= W + safeEdge ? ({
      top: clampY(targetRect.top + targetRect.height / 2),
      left: targetRect.left - margin,
      transform: 'translate(-100%, -50%)',
      width: `${W}px`,
    }) : null

    const tryBottom = () => spaceBottom >= H + safeEdge ? ({
      top: targetRect.bottom + margin,
      left: clampX(targetRect.left + targetRect.width / 2),
      transform: 'translate(-50%, 0)',
      width: `${W}px`,
    }) : null

    const tryTop = () => spaceTop >= H + safeEdge ? ({
      top: targetRect.top - margin,
      left: clampX(targetRect.left + targetRect.width / 2),
      transform: 'translate(-50%, -100%)',
      width: `${W}px`,
    }) : null

    const pref = step.alignment
    let solved = null

    if (pref === 'right') solved = tryRight() || tryLeft() || tryBottom() || tryTop()
    else if (pref === 'left') solved = tryLeft() || tryRight() || tryBottom() || tryTop()
    else if (pref === 'bottom') solved = tryBottom() || tryTop() || tryRight() || tryLeft()
    else if (pref === 'top') solved = tryTop() || tryBottom() || tryRight() || tryLeft()

    if (solved) popupStyle = solved
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto h-[100dvh] max-h-[100dvh] overflow-hidden">
      {/* Dark overlay with a cutout mask for the target */}
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

      {/* Floating Contextual Parchment Modal */}
      <div 
        ref={popupRef}
        className="absolute bg-[#2D231E] border-2 border-primary/50 rounded-xl shadow-[0_0_40px_rgba(242,202,80,0.3)] flex flex-col overflow-hidden transition-all duration-500 ease-out z-20"
        style={{
          ...popupStyle,
          maxHeight: 'calc(100dvh - 32px)',
        }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(45deg, #f2ca50, #f2ca50 1px, transparent 1px, transparent 20px)" }} />
        
        {/* Sticky Header */}
        <div className="relative z-10 flex items-center justify-between p-5 sm:p-6 pb-3 border-b border-primary/20 shrink-0 bg-[#2D231E]">
          <h3 className="font-display-lg text-lg sm:text-xl text-primary-fixed gold-glow pr-2 break-words">{step.title}</h3>
          <span className="font-label-sm text-xs text-on-surface-variant shrink-0">
            {currentStepIndex + 1} / {TOUR_STEPS.length}
          </span>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-6 py-4 font-body-md text-sm sm:text-base text-on-surface whitespace-pre-wrap leading-relaxed min-h-0">
          {step.description}
        </div>

        {/* Sticky Footer */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6 pt-3 border-t border-primary/10 shrink-0 bg-[#2D231E]">
          <div className="flex gap-2">
            {isLast ? (
              <button onClick={startTour} className="px-3.5 py-2 border border-outline-variant text-on-surface-variant rounded text-xs uppercase tracking-widest hover:text-primary hover:border-primary transition-all">
                Restart
              </button>
            ) : (
              <button onClick={skipTour} className="px-3.5 py-2 border border-outline-variant text-on-surface-variant rounded text-xs uppercase tracking-widest hover:text-error hover:border-error transition-all">
                Skip Tour
              </button>
            )}
          </div>
          <div className="flex gap-2 ml-auto">
            {!isFirst && !isLast && (
              <button onClick={prevStep} className="px-3.5 py-2 bg-surface border border-outline-variant text-on-surface rounded text-xs uppercase tracking-widest hover:bg-surface-high transition-all">
                Previous
              </button>
            )}
            {isLast ? (
              <button onClick={finishTour} className="px-4 py-2 bg-primary/20 border border-primary text-primary rounded text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary hover:shadow-glow transition-all">
                Finish Journey
              </button>
            ) : (
              <button onClick={nextStep} className="px-4 py-2 bg-primary/10 border border-primary/50 text-primary rounded text-xs uppercase tracking-widest hover:bg-primary/20 hover:shadow-glow transition-all">
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
