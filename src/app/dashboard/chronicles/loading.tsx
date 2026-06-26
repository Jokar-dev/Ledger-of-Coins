import React from 'react'

export default function ChroniclesLoading() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1920px] mx-auto w-full pb-32 min-w-0 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="h-10 w-64 bg-surface-container-high rounded mb-2" />
          <div className="h-4 w-96 bg-surface-container rounded" />
        </div>
        <div className="h-10 w-48 bg-primary/10 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-surface-container-high rounded-xl border border-outline-variant/30 p-6 h-56 flex flex-col justify-between" />
        ))}
      </div>
    </div>
  )
}
