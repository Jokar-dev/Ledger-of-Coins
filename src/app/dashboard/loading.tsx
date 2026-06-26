import React from 'react'

export default function DashboardLoading() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1920px] mx-auto w-full pb-32 min-w-0 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-end mb-8 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="h-4 w-32 bg-primary/20 rounded mb-3" />
          <div className="h-10 w-72 bg-surface-container-high rounded mb-2" />
          <div className="h-4 w-96 bg-surface-container rounded" />
        </div>
      </div>

      {/* Hero Stats Card skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-6 relative overflow-hidden h-36 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="h-3 w-24 bg-on-surface-variant/20 rounded" />
              <div className="h-8 w-8 bg-surface-container rounded-lg" />
            </div>
            <div className="h-8 w-32 bg-primary/30 rounded mt-4" />
          </div>
        ))}
      </div>

      {/* Main Content Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-48 bg-surface-container-high rounded mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container border border-outline-variant/20 rounded-xl p-5 h-20" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-6 w-40 bg-surface-container-high rounded mb-4" />
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface-container border border-outline-variant/20 rounded-xl p-5 h-28" />
          ))}
        </div>
      </div>
    </div>
  )
}
