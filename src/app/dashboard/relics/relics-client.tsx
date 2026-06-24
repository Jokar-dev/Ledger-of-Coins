'use client'

import { useState } from 'react'
import { addRelic, deleteRelic } from './actions'

const RARITY_BORDERS: Record<string, string> = {
  low:    'border-outline-variant',
  mid:    'border-secondary/40 shadow-[0_0_12px_rgba(74,225,131,0.08)]',
  high:   'border-primary/50 shadow-[0_0_16px_rgba(242,202,80,0.12)]',
  legend: 'border-error/50 shadow-[0_0_20px_rgba(255,180,171,0.15)]',
}

function rarityByValue(val: number) {
  if (val >= 1000) return 'legend'
  if (val >= 500) return 'high'
  if (val >= 100) return 'mid'
  return 'low'
}

function relicEmoji(name: string) {
  const n = name.toLowerCase()
  if (n.includes('sword') || n.includes('blade') || n.includes('dagger')) return '⚔️'
  if (n.includes('compass') || n.includes('map') || n.includes('scroll')) return '🗺️'
  if (n.includes('ring') || n.includes('gem') || n.includes('jewel') || n.includes('diamond')) return '💎'
  if (n.includes('crown') || n.includes('helm') || n.includes('crown')) return '👑'
  if (n.includes('potion') || n.includes('vial') || n.includes('elixir')) return '🧪'
  if (n.includes('staff') || n.includes('wand') || n.includes('rod')) return '🪄'
  if (n.includes('shield') || n.includes('armor') || n.includes('cloak')) return '🛡️'
  if (n.includes('book') || n.includes('tome') || n.includes('grimoire')) return '📖'
  return '🏺'
}

import { ACHIEVEMENT_LIST } from '@/lib/achievements'

export default function RelicsClient({
  relics, expeditions, userId, unlockedAchievements = []
}: {
  relics: any[], expeditions: any[], userId: string, unlockedAchievements?: any[]
}) {
  const [allRelics, setAllRelics] = useState(relics)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'vault' | 'deeds'>('vault')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [expeditionId, setExpeditionId] = useState('')
  const [estimatedValue, setEstimatedValue] = useState('')

  const inputCls = "w-full bg-surface-container-highest border border-outline-variant rounded p-3 text-on-surface focus:outline-none focus:border-primary transition-all text-sm"
  const labelCls = "block font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-1.5"

  const handleAdd = async () => {
    if (!name.trim()) { setErrorMsg('Relic name is required'); return }
    setIsSubmitting(true); setErrorMsg('')
    const fd = new FormData()
    fd.append('name', name)
    fd.append('description', description)
    fd.append('expedition_id', expeditionId)
    const expName = expeditions.find(e => e.id === expeditionId)?.group_name || ''
    fd.append('expedition_name', expName)
    fd.append('estimated_value', estimatedValue || '0')

    const result = await addRelic(fd)
    if (result.success && result.relic) {
      setAllRelics(prev => [result.relic, ...prev])
      setName(''); setDescription(''); setExpeditionId(''); setEstimatedValue('')
      setShowForm(false)
      // Achievements are handled by the page reload or global event
      if (result.newAchievements?.length && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('achievementsUnlocked', { detail: result.newAchievements }))
      }
    } else setErrorMsg(result.error || 'Failed to add relic')
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this relic from the Vault?')) return
    const result = await deleteRelic(id)
    if (result.success) setAllRelics(prev => prev.filter(r => r.id !== id))
    else alert(result.error)
  }

  // Calculate achievements stats
  const unlockedKeys = new Set(unlockedAchievements.map(a => a.achievement_key))
  const totalAchievements = ACHIEVEMENT_LIST.length
  const progressPercent = Math.round((unlockedKeys.size / totalAchievements) * 100)

  return (
    <>
      {/* Add Relic Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => { setShowForm(false); setErrorMsg('') }}>
          <div className="relative bg-surface-container-high border border-primary/40 rounded-xl p-6 w-full max-w-md shadow-[0_0_60px_rgba(242,202,80,0.15)] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary m-3" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary m-3" />
            <h3 className="font-display-lg text-[24px] text-primary-fixed gold-glow text-center mb-1">Catalogue a Relic</h3>
            <p className="text-center text-on-surface-variant text-sm mb-5">Record a discovery for the Vault.</p>
            {errorMsg && <div className="mb-4 p-3 rounded bg-error/20 border border-error/40 text-on-error-container text-sm">{errorMsg}</div>}
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Relic Name *</label>
                <input className={inputCls} placeholder="e.g., Golden Compass" value={name} onChange={e => setName(e.target.value)} />
                {name && (
                  <p className="text-[10px] text-primary/60 mt-1 font-label-sm italic">
                    Will be displayed as: &ldquo;The {name} {expeditionId ? `of ${expeditions.find(e => e.id === expeditionId)?.group_name?.replace(/^(The |Lost |Ancient )/i, '') || '...'}` : 'of Forgotten Tides'}&rdquo;
                  </p>
                )}
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea className={`${inputCls} resize-none`} rows={3} placeholder="A compass believed to guide lost travelers..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Expedition Found In</label>
                <select className={inputCls} value={expeditionId} onChange={e => setExpeditionId(e.target.value)} style={{ colorScheme: 'dark' }}>
                  <option value="" style={{ background: '#2a1d15' }}>— Unknown Origin —</option>
                  {expeditions.map(exp => (
                    <option key={exp.id} value={exp.id} style={{ background: '#2a1d15' }}>{exp.group_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Estimated Value (Gold)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-fixed-dim text-sm">💰</span>
                  <input className={`${inputCls} pl-8`} type="number" min="0" step="0.01" placeholder="0" value={estimatedValue} onChange={e => setEstimatedValue(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowForm(false); setErrorMsg('') }} className="flex-1 py-3 rounded border border-outline-variant text-on-surface-variant text-xs uppercase tracking-widest hover:bg-surface-container transition-colors">Cancel</button>
                <button onClick={handleAdd} disabled={isSubmitting} className="flex-1 py-3 rounded bg-primary/10 border border-primary/50 text-primary text-xs uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[15px]">diamond</span>
                  {isSubmitting ? 'Cataloguing...' : 'Add to Vault'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 md:p-8 w-full pb-32">
        {/* Header Tabs */}
        <div className="flex border-b border-outline-variant mb-8 w-full">
          <button 
            className={`pb-4 px-6 font-headline-lg uppercase tracking-widest text-sm transition-all relative ${activeTab === 'vault' ? 'text-primary gold-glow' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('vault')}
          >
            🏺 Relic Vault
            {activeTab === 'vault' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-glow" />}
          </button>
          <button 
            className={`pb-4 px-6 font-headline-lg uppercase tracking-widest text-sm transition-all relative ${activeTab === 'deeds' ? 'text-primary gold-glow' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('deeds')}
          >
            📜 Hall of Deeds
            {activeTab === 'deeds' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-glow" />}
          </button>
        </div>

        {activeTab === 'vault' ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <p className="text-on-surface-variant text-sm">A collection of treasures recovered across thy expeditions.</p>
              <button onClick={() => { setShowForm(true); setErrorMsg('') }}
                className="bg-primary/10 border border-primary/50 text-primary px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary/20 hover:shadow-glow transition-all">
                <span className="material-symbols-outlined text-[15px]">add</span> Catalogue Relic
              </button>
            </div>
        {/* Empty State */}
        {allRelics.length === 0 ? (
          <div className="text-center py-24 bg-surface-container border border-outline-variant/30 rounded-xl">
            <p className="text-[56px] mb-4">🏺</p>
            <h3 className="font-headline-lg text-[22px] text-on-surface-variant mb-2">No Relics Have Been Discovered Yet</h3>
            <p className="text-on-surface-variant/60 text-sm mb-6">Add treasures recovered on your expeditions.</p>
            <button onClick={() => { setShowForm(true); setErrorMsg('') }}
              className="bg-primary/10 border border-primary/50 text-primary px-6 py-3 rounded-lg text-xs uppercase tracking-widest flex items-center gap-2 mx-auto hover:bg-primary/20 transition-all">
              <span className="material-symbols-outlined text-[15px]">add</span> Add First Relic
            </button>
          </div>
        ) : (
          <>
            {/* Vault Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-surface-container-high border border-outline-variant rounded-xl p-4">
                <p className="text-[28px] mb-1">🏺</p>
                <p className="font-display-lg text-[24px] text-primary">{allRelics.length}</p>
                <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">Relics Collected</p>
              </div>
              <div className="bg-surface-container-high border border-outline-variant rounded-xl p-4">
                <p className="text-[28px] mb-1">💰</p>
                <p className="font-display-lg text-[24px] text-primary">
                  {allRelics.reduce((s, r) => s + Number(r.estimated_value || 0), 0).toFixed(0)} G
                </p>
                <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">Total Vault Value</p>
              </div>
              <div className="bg-surface-container-high border border-outline-variant rounded-xl p-4 col-span-2 md:col-span-1">
                <p className="text-[28px] mb-1">⭐</p>
                <p className="font-headline-lg text-[18px] text-primary truncate">
                  {allRelics.sort((a, b) => Number(b.estimated_value) - Number(a.estimated_value))[0]?.display_name || allRelics[0]?.name || '—'}
                </p>
                <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">Most Prized Relic</p>
              </div>
            </div>

            {/* Relic Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {allRelics.map((relic) => {
                const rarity = rarityByValue(Number(relic.estimated_value || 0))
                const border = RARITY_BORDERS[rarity]
                const emoji = relicEmoji(relic.name)
                return (
                  <div key={relic.id} className={`relative bg-surface-container-high border rounded-xl p-5 group transition-all duration-300 hover:translate-y-[-2px] ${border}`}>
                    {/* Relic header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-14 h-14 rounded-full bg-surface-container-lowest border border-primary/20 flex items-center justify-center text-[28px] shrink-0">
                        {emoji}
                      </div>
                      <button onClick={() => handleDelete(relic.id)} className="text-outline/30 hover:text-error transition-colors p-1">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>

                    {/* Display name (fantasy) */}
                    <h3 className="font-headline-lg text-[17px] text-primary-fixed gold-glow leading-tight mb-1">
                      {relic.display_name || relic.name}
                    </h3>

                    {/* Original name label */}
                    {relic.display_name && relic.display_name !== relic.name && (
                      <p className="font-label-sm text-[9px] text-outline uppercase tracking-widest mb-3">
                        Originally: {relic.name}
                      </p>
                    )}

                    {/* Description */}
                    {relic.description && (
                      <p className="text-sm text-on-surface-variant/80 italic mb-3 line-clamp-3">
                        &ldquo;{relic.description}&rdquo;
                      </p>
                    )}

                    {/* Meta */}
                    <div className="space-y-1.5 border-t border-outline-variant/30 pt-3">
                      {relic.expedition_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[14px]">🗺️</span>
                          <span className="text-on-surface-variant">{relic.expedition_name}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[14px]">💰</span>
                          <span className={`font-headline-lg ${Number(relic.estimated_value) >= 1000 ? 'text-primary gold-glow' : 'text-on-surface'}`}>
                            {Number(relic.estimated_value || 0).toFixed(0)} Gold
                          </span>
                        </div>
                        <span className={`font-label-sm text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          rarity === 'legend' ? 'border-error/50 text-error bg-error/10' :
                          rarity === 'high'   ? 'border-primary/50 text-primary bg-primary/10' :
                          rarity === 'mid'    ? 'border-secondary/50 text-secondary bg-secondary/10' :
                          'border-outline-variant text-outline'
                        }`}>
                          {rarity === 'legend' ? 'Legendary' : rarity === 'high' ? 'Rare' : rarity === 'mid' ? 'Uncommon' : 'Common'}
                        </span>
                      </div>
                      <p className="font-label-sm text-[9px] text-outline">
                        Catalogued {new Date(relic.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Bottom glow on hover */}
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
                  </div>
                )
              })}
            </div>
          </>
        )}
        </>
      ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-surface-container-high border border-outline-variant rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-highest">
                <div className="h-full bg-primary shadow-glow transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex items-center justify-between mb-2 mt-2">
                <h3 className="font-display-lg text-2xl text-primary-fixed">Achievement Progress</h3>
                <span className="font-headline-lg text-primary">{progressPercent}%</span>
              </div>
              <p className="text-on-surface-variant text-sm">You have unlocked {unlockedKeys.size} of {totalAchievements} total deeds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {ACHIEVEMENT_LIST.map(ach => {
                const isUnlocked = unlockedKeys.has(ach.id)
                const unlockData = unlockedAchievements.find(a => a.achievement_key === ach.id)
                return (
                  <div key={ach.id} className={`border rounded-xl p-4 flex gap-4 items-start transition-all ${
                    isUnlocked ? 'bg-surface-container border-primary/30 shadow-[0_0_15px_rgba(242,202,80,0.05)]' : 'bg-surface-container-low border-outline-variant/30 opacity-60 grayscale'
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
                      isUnlocked ? 'bg-primary/10 border border-primary/40 text-primary drop-shadow-[0_0_5px_rgba(242,202,80,0.5)]' : 'bg-surface border border-outline-variant'
                    }`}>
                      {ach.icon}
                    </div>
                    <div>
                      <h4 className={`font-headline-lg text-sm mb-1 ${isUnlocked ? 'text-primary-fixed' : 'text-on-surface'}`}>{ach.name}</h4>
                      <p className="text-xs text-on-surface-variant italic mb-2">{ach.description}</p>
                      {isUnlocked && unlockData && (
                        <p className="font-label-sm text-[9px] text-primary uppercase tracking-widest">
                          Unlocked {new Date(unlockData.unlocked_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
