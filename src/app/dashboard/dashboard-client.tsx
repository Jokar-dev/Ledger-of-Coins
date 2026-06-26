'use client'

import Link from 'next/link'
import ExportLedgerButton from '@/components/export-ledger-button'
import { formatFullTimestamp } from '@/lib/timestamp-utils'

const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍖', Transport: '🐎', Entertainment: '🎭', Shopping: '💎',
  Utilities: '⚡', Health: '🧪', Other: '📜',
  tavern: '🍖', potions: '🧪', expeditions: '🗺', relics: '💎',
}

export default function DashboardClient({
  explorerName, chronicleName, totalGold, activeExpeditions,
  goldOwed, goldCollectible, recentExpenses, recentExpeditions
}: {
  explorerName: string
  chronicleName: string
  totalGold: number
  activeExpeditions: number
  goldOwed: number
  goldCollectible: number
  recentExpenses: any[]
  recentExpeditions: any[]
}) {
  const isEmpty = totalGold === 0 && activeExpeditions === 0 && recentExpenses.length === 0

  const QUICK_ACTIONS = [
    { label: 'Add Expense', icon: 'receipt_long', href: '/dashboard/expenses', color: 'text-secondary border-secondary/40 hover:bg-secondary/10' },
    { label: 'Expeditions', icon: 'explore', href: '/dashboard/groups', color: 'text-primary border-primary/40 hover:bg-primary/10' },
    { label: 'Oracle Chamber', icon: 'auto_awesome', href: '/dashboard/oracle', color: 'text-tertiary border-tertiary/40 hover:bg-tertiary/10' },
    { label: 'Relic Vault', icon: 'diamond', href: '/dashboard/relics', color: 'text-primary-fixed border-primary-container/40 hover:bg-primary-container/10' },
  ]

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1920px] mx-auto w-full pb-32 space-y-8 min-w-0">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-surface-container-high p-6 shadow-[0_0_30px_rgba(242,202,80,0.1)]">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, #f2ca50, #f2ca50 1px, transparent 1px, transparent 20px)" }} />
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary m-3" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary m-3" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary m-3" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary m-3" />
        <div className="relative z-10">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.2em] mb-1">Welcome Back</p>
          <h1 className="font-display-lg text-[32px] sm:text-[40px] md:text-[48px] text-primary-fixed gold-glow leading-tight break-words">{explorerName}</h1>
        </div>
      </div>

      {/* Empty Chronicle State */}
      {isEmpty ? (
        <div className="text-center py-16 bg-surface-container-high border border-outline-variant/40 rounded-xl px-4">
          <p className="text-[48px] mb-4">📜</p>
          <h2 className="font-display-lg text-[24px] text-primary-fixed gold-glow mb-2">Your Chronicle is Empty</h2>
          <p className="text-on-surface-variant mb-6 max-w-md mx-auto">Begin your first expedition to start recording your adventures.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/dashboard/groups" className="bg-primary/10 border border-primary/50 text-primary px-6 py-3 rounded-lg font-label-sm text-xs uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">explore</span> Forge First Expedition
            </Link>
            <Link href="/dashboard/expenses" className="bg-secondary/10 border border-secondary/50 text-secondary px-6 py-3 rounded-lg font-label-sm text-xs uppercase tracking-widest hover:bg-secondary/20 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">receipt_long</span> Record First Expense
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: 'Total Gold Spent', value: `${totalGold.toFixed(0)} G`, icon: 'toll', color: 'text-primary', glow: 'shadow-[0_0_15px_rgba(242,202,80,0.1)]' },
              { label: 'Active Expeditions', value: activeExpeditions.toString(), icon: 'explore', color: 'text-tertiary', glow: 'shadow-[0_0_15px_rgba(163,211,255,0.1)]' },
              { label: 'Gold Owed', value: goldOwed > 0 ? `${goldOwed.toFixed(0)} G` : '—', icon: 'trending_up', color: goldOwed > 0 ? 'text-error' : 'text-outline', glow: goldOwed > 0 ? 'shadow-[0_0_15px_rgba(255,180,171,0.1)]' : '' },
              { label: 'Gold Collectible', value: goldCollectible > 0 ? `${goldCollectible.toFixed(0)} G` : '—', icon: 'trending_down', color: goldCollectible > 0 ? 'text-secondary' : 'text-outline', glow: goldCollectible > 0 ? 'shadow-[0_0_15px_rgba(74,225,131,0.1)]' : '' },
            ].map((stat) => (
              <div key={stat.label} className={`bg-surface-container-high border border-outline-variant rounded-xl p-5 ${stat.glow} flex flex-col justify-between`}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`material-symbols-outlined text-[26px] ${stat.color}`}>{stat.icon}</span>
                  <div className={`w-2 h-2 rounded-full ${stat.color} opacity-60 candle-flicker`} />
                </div>
                <div>
                  <p className={`font-display-lg text-2xl sm:text-3xl ${stat.color} leading-none break-all`}>{stat.value}</p>
                  <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest mt-1.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-headline-lg text-[15px] sm:text-[16px] text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">bolt</span> Quick Actions
              </h2>
              <ExportLedgerButton data={{ explorerName, chronicleName, totalGold, activeExpeditions, goldOwed, goldCollectible, recentExpenses, recentExpeditions }} variant="secondary" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {QUICK_ACTIONS.map(action => (
                <Link key={action.label} href={action.href} className={`flex flex-col items-center justify-center gap-2.5 p-4.5 rounded-xl border bg-surface-container-low ${action.color} transition-all duration-200 hover:scale-[1.02] group`}>
                  <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">{action.icon}</span>
                  <span className="font-label-sm text-[11px] uppercase tracking-widest text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Recent Expenses */}
            <div className="bg-surface-container-high border border-outline-variant rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-outline-variant/50">
                <h3 className="font-headline-lg text-[16px] text-primary-fixed flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span> Recent Expenses
                </h3>
                <Link href="/dashboard/expenses" className="font-label-sm text-[10px] text-primary uppercase tracking-widest hover:text-primary-fixed transition-colors">View All →</Link>
              </div>
              <div className="divide-y divide-outline-variant/20">
                {recentExpenses.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant/50">
                    <span className="text-[32px] block mb-2">📜</span>
                    <p className="text-sm">The Treasury is Empty.</p>
                  </div>
                ) : recentExpenses.map((e: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-[18px]">{CATEGORY_ICONS[e.category] || '📜'}</span>
                      <div>
                        <p className="font-body-md text-[14px] text-on-surface">{e.description}</p>
                        <p className="font-label-sm text-[10px] text-outline uppercase">{e.category} · {formatFullTimestamp(e.created_at)}</p>
                      </div>
                    </div>
                    <span className="font-headline-lg text-[15px] text-error">-{Number(e.amount).toFixed(0)}G</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Expeditions */}
            <div className="bg-surface-container-high border border-outline-variant rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-outline-variant/50">
                <h3 className="font-headline-lg text-[16px] text-primary-fixed flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">explore</span> Active Expeditions
                </h3>
                <Link href="/dashboard/groups" className="font-label-sm text-[10px] text-primary uppercase tracking-widest hover:text-primary-fixed transition-colors">View All →</Link>
              </div>
              <div className="divide-y divide-outline-variant/20">
                {recentExpeditions.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant/50">
                    <span className="text-[32px] block mb-2">🗺</span>
                    <p className="text-sm">No Expeditions Have Been Forged Yet.</p>
                  </div>
                ) : recentExpeditions.map((exp: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-[18px]">🗺</span>
                      <div>
                        <p className="font-body-md text-[14px] text-on-surface">{exp.group_name}</p>
                        <p className="font-label-sm text-[10px] text-outline uppercase">{exp.destination || 'Destination Unknown'}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">chevron_right</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
