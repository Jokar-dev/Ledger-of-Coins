'use client'

const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍖', Transport: '🐎', Entertainment: '🎭', Shopping: '💎',
  Utilities: '⚡', Health: '🧪', Other: '📜',
}
const CAT_COLORS: Record<string, string> = {
  Food: '#f2ca50', Transport: '#a3d3ff', Entertainment: '#4ae183',
  Shopping: '#ff8fab', Utilities: '#ffd166', Health: '#06d6a0', Other: '#99907c',
}

export default function OracleClient({
  expenses, totalSpent, monthly, categories, topCategory, expeditions
}: {
  expenses: any[], totalSpent: number, monthly: { month: string; amount: number }[],
  categories: [string, number][], topCategory: [string, number], expeditions: any[]
}) {
  const maxMonthly = Math.max(...monthly.map(m => m.amount), 1)
  const totalCat = categories.reduce((s, [, v]) => s + v, 0) || 1

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1920px] mx-auto w-full pb-32 space-y-8 min-w-0">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-3 flex-wrap">
          <span className="text-[32px] sm:text-[40px]">🔮</span>
          <h2 className="font-display-lg text-[32px] sm:text-[40px] text-primary-fixed gold-glow break-words">Oracle Chamber</h2>
          <span className="text-[32px] sm:text-[40px]">🔮</span>
        </div>
        <p className="text-on-surface-variant text-sm sm:text-base">The Oracle Foresees thy financial destiny.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-surface-container-high border border-primary/30 rounded-xl p-5 text-center shadow-[0_0_20px_rgba(242,202,80,0.08)]">
          <p className="text-4xl mb-2">💰</p>
          <p className="font-display-lg text-[28px] text-primary gold-glow break-all">{totalSpent.toFixed(0)} G</p>
          <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Total Gold Lost</p>
        </div>
        <div className="bg-surface-container-high border border-secondary/30 rounded-xl p-5 text-center">
          <p className="text-4xl mb-2">{CATEGORY_ICONS[topCategory[0]] || '📜'}</p>
          <p className="font-headline-lg text-[20px] text-secondary truncate">{topCategory[0]}</p>
          <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Most Gold Lost To</p>
        </div>
        <div className="bg-surface-container-high border border-tertiary/30 rounded-xl p-5 text-center sm:col-span-2 lg:col-span-1">
          <p className="text-4xl mb-2">🗺</p>
          <p className="font-headline-lg text-[20px] text-tertiary">{expeditions.length}</p>
          <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Active Expeditions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Monthly Trend — Bar Chart (SVG-based) */}
        <div className="bg-surface-container-high border border-outline-variant rounded-xl p-6">
          <h3 className="font-headline-lg text-[18px] text-primary-fixed mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">trending_up</span> Monthly Spending
          </h3>
          {monthly.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-on-surface-variant/40 text-sm">No data yet.</div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {monthly.map(({ month, amount }) => {
                const pct = (amount / maxMonthly) * 100
                const label = month.slice(5) // MM
                const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                const mName = monthNames[parseInt(label) - 1] || label
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-label-sm">{amount.toFixed(0)}G</span>
                    <div className="w-full rounded-t-sm bg-primary/20 border border-primary/30 relative overflow-hidden" style={{ height: `${Math.max(8, pct)}%` }}>
                      <div className="absolute inset-x-0 bottom-0 bg-primary/60" style={{ height: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-label-sm">{mName}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown — horizontal bars */}
        <div className="bg-surface-container-high border border-outline-variant rounded-xl p-6">
          <h3 className="font-headline-lg text-[18px] text-primary-fixed mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-secondary">donut_large</span> Category Breakdown
          </h3>
          {categories.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-on-surface-variant/40 text-sm">No data yet.</div>
          ) : (
            <div className="space-y-3">
              {categories.slice(0, 6).map(([cat, amount]) => {
                const pct = (amount / totalCat) * 100
                const color = CAT_COLORS[cat] || '#99907c'
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-on-surface flex items-center gap-1.5">
                        {CATEGORY_ICONS[cat] || '📜'} {cat}
                      </span>
                      <span className="font-label-sm text-[11px] text-outline">{amount.toFixed(0)}G ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}60` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Oracle Message */}
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-surface-container p-8 text-center">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='5' y='35' font-size='30' fill='%23f2ca50'%3E✦%3C/text%3E%3C/svg%3E\")" }} />
        <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-[0.3em] mb-3">The Oracle Proclaims</p>
        <p className="font-display-lg text-[22px] text-primary italic">
          {totalSpent === 0
            ? '"Thy ledger is pure. The ancients await thy first transaction."'
            : totalSpent > 5000
            ? '"The Treasury Spirits grow restless. Thy spending rivals the ancient kings."'
            : '"The gold flows steadily. Thy chronicle grows with each passing moon."'}
        </p>
      </div>
    </div>
  )
}
