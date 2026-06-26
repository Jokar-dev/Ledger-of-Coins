import React from 'react'

export default function ExpensesLoading() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1920px] mx-auto w-full pb-32 min-w-0 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="h-4 w-28 bg-primary/20 rounded mb-2" />
          <div className="h-10 w-64 bg-surface-container-high rounded" />
        </div>
        <div className="h-10 w-44 bg-primary/10 border border-primary/30 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-6 h-96" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-surface-container-high border border-outline-variant/20 rounded-xl p-5 h-24" />
          ))}
        </div>
      </div>
    </div>
  )
}
