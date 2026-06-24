'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { TOUR_STEPS } from '@/lib/tour-config'
import TourOverlay from './tour-overlay'

interface TourContextType {
  isActive: boolean
  currentStepIndex: number
  startTour: () => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  finishTour: () => void
}

const TourContext = createContext<TourContextType | null>(null)

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within TourProvider')
  return ctx
}

export function TourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Wait for client mount
  useEffect(() => {
    setIsMounted(true)
    
    // Check if we need to auto-start
    const hasCompleted = localStorage.getItem('tour_completed')
    if (!hasCompleted) {
      // Delay slightly to let the UI settle
      setTimeout(() => {
        setIsActive(true)
        setCurrentStepIndex(0)
      }, 1000)
    }
  }, [])

  const startTour = useCallback(() => {
    setCurrentStepIndex(0)
    setIsActive(true)
  }, [])

  const nextStep = useCallback(() => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }, [currentStepIndex])

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }, [currentStepIndex])

  const skipTour = useCallback(() => {
    setIsActive(false)
    localStorage.setItem('tour_completed', 'true')
  }, [])

  const finishTour = useCallback(() => {
    setIsActive(false)
    localStorage.setItem('tour_completed', 'true')
  }, [])

  if (!isMounted) return <>{children}</>

  return (
    <TourContext.Provider value={{ isActive, currentStepIndex, startTour, nextStep, prevStep, skipTour, finishTour }}>
      {children}
      <TourOverlay />
    </TourContext.Provider>
  )
}
