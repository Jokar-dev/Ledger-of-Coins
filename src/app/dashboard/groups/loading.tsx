import React from 'react'

export default function GroupsLoading() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1920px] mx-auto w-full pb-32 min-w-0 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="h-4 w-32 bg-primary/20 rounded mb-2" />
          <div className="h-10 w-72 bg-surface-container-high rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-36 bg-secondary/10 rounded-lg" />
          <div className="h-10 w-48 bg-primary/10 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-surface-container-high rounded-xl border border-outline-variant/30 p-5 h-60 flex flex-col justify-between" />
        ))}
      </div>
    </div>
  )
}
