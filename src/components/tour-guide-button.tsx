'use client'

import { useTour } from './tour-provider'

export default function TourGuideButton({ onClick }: { onClick?: () => void }) {
  const { startTour } = useTour()

  return (
    <button 
      onClick={() => {
        if (onClick) onClick()
        startTour()
      }} 
      className="w-full text-left px-4 py-3 hover:bg-surface-container flex items-center gap-3 transition-colors border-b border-outline-variant/30 text-on-surface"
    >
      <span className="material-symbols-outlined text-[18px] text-secondary">menu_book</span>
      Guide to the Realm
    </button>
  )
}
