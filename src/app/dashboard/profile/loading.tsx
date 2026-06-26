import React from 'react'

export default function ProfileLoading() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1920px] mx-auto w-full pb-32 min-w-0 animate-pulse">
      <div className="mb-8 border-b border-outline-variant/30 pb-6">
        <div className="h-10 w-64 bg-surface-container-high rounded mb-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-container-high rounded-xl border border-outline-variant/30 p-6 h-80" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-high rounded-xl border border-outline-variant/30 p-6 h-48" />
          <div className="bg-surface-container-high rounded-xl border border-outline-variant/30 p-6 h-64" />
        </div>
      </div>
    </div>
  )
}
