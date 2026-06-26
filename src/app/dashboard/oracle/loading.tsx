import React from 'react'

export default function OracleLoading() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1920px] mx-auto w-full pb-32 min-w-0 animate-pulse">
      <div className="mb-8 border-b border-outline-variant/30 pb-6">
        <div className="h-10 w-72 bg-surface-container-high rounded mb-2" />
        <div className="h-4 w-96 bg-surface-container rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-container-high rounded-xl border border-outline-variant/30 p-6 h-36" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-container-high rounded-xl border border-outline-variant/30 p-6 h-80" />
        <div className="bg-surface-container-high rounded-xl border border-outline-variant/30 p-6 h-80" />
      </div>
    </div>
  )
}
