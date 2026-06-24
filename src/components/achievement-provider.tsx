'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { AchievementDef } from '@/lib/achievements'

interface AchievementContextType {
  showAchievement: (achievement: AchievementDef) => void
  showAchievements: (achievements: AchievementDef[]) => void
}

const AchievementContext = createContext<AchievementContextType | null>(null)

export function useAchievements() {
  const ctx = useContext(AchievementContext)
  if (!ctx) throw new Error('useAchievements must be used within AchievementProvider')
  return ctx
}

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<AchievementDef[]>([])
  const [current, setCurrent] = useState<AchievementDef | null>(null)

  const showAchievement = useCallback((achievement: AchievementDef) => {
    setQueue(q => [...q, achievement])
  }, [])

  const showAchievements = useCallback((achievements: AchievementDef[]) => {
    setQueue(q => [...q, ...achievements])
  }, [])

  // Process the queue
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0])
      setQueue(q => q.slice(1))

      // Keep it on screen for 4 seconds, then remove
      setTimeout(() => {
        setCurrent(null)
      }, 4000)
    }
  }, [current, queue])

  // Listen to the global window event for PDF generation or client-side triggers
  useEffect(() => {
    const handler = (e: CustomEvent<AchievementDef[]>) => {
      if (e.detail?.length) {
        showAchievements(e.detail)
      }
    }
    window.addEventListener('achievementsUnlocked', handler as EventListener)
    return () => window.removeEventListener('achievementsUnlocked', handler as EventListener)
  }, [showAchievements])

  return (
    <AchievementContext.Provider value={{ showAchievement, showAchievements }}>
      {children}
      
      {/* The Animated Popup */}
      <div 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-out pointer-events-none
          ${current ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}`}
      >
        {current && (
          <div className="bg-[#2D231E] border-2 border-primary/50 rounded-lg p-5 shadow-[0_0_40px_rgba(242,202,80,0.3)] min-w-[320px] max-w-[400px] relative overflow-hidden">
            {/* Parchment texture background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, #f2ca50, #f2ca50 1px, transparent 1px, transparent 20px)" }} />
            
            <div className="relative z-10 flex items-start gap-4">
              <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(242,202,80,0.5)] flex-shrink-0 animate-bounce" style={{ animationDuration: '2s' }}>
                {current.icon}
              </div>
              <div>
                <p className="font-label-sm text-[10px] text-primary uppercase tracking-[0.2em] mb-1 animate-pulse">Achievement Unlocked</p>
                <h3 className="font-display-lg text-xl text-primary-fixed mb-1 leading-tight">{current.name}</h3>
                <p className="font-body-md text-sm text-on-surface-variant italic">{current.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AchievementContext.Provider>
  )
}
