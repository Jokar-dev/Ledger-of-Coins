'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createExpedition, musterMember, deleteExpedition } from './actions'

const ROLES = ['Leader', 'Treasurer', 'Scout', 'Member']
const EXP_ICONS = ['castle', 'forest', 'water_drop', 'account_balance', 'diamond', 'auto_awesome']

export default function GroupsClient({
  expeditions, currentUserId,
}: { expeditions: any[]; currentUserId: string }) {
  const [allExp, setAllExp] = useState(expeditions)
  const [modal, setModal] = useState<null | 'forge' | 'muster'>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setAllExp(expeditions)
  }, [expeditions])

  const [forgeName, setForgeName] = useState('')
  const [forgeDest, setForgeDest] = useState('')
  const [forgeDesc, setForgeDesc] = useState('')
  const [forgeSize, setForgeSize] = useState('6')
  const [forgeStart, setForgeStart] = useState('')
  const [forgeEnd, setForgeEnd] = useState('')

  const [musterExpId, setMusterExpId] = useState('')
  const [musterName, setMusterName] = useState('')
  const [musterEmail, setMusterEmail] = useState('')
  const [musterRole, setMusterRole] = useState('Member')

  const closeModal = () => { setModal(null); setErrorMsg('') }

  const handleForge = async () => {
    if (!forgeName.trim()) { setErrorMsg('Expedition name is required'); return }
    setIsSubmitting(true); setErrorMsg('')
    const fd = new FormData()
    fd.append('name', forgeName); fd.append('destination', forgeDest)
    fd.append('description', forgeDesc); fd.append('party_size', forgeSize)
    fd.append('start_date', forgeStart); fd.append('end_date', forgeEnd)
    const result = await createExpedition(fd)
    if (result.success && result.group) {
      setAllExp(prev => [{ ...result.group, memberCount: 1, totalSpent: 0, debtCount: 0 }, ...prev])
      setForgeName(''); setForgeDest(''); setForgeDesc(''); setForgeSize('6'); setForgeStart(''); setForgeEnd('')
      closeModal()
    } else setErrorMsg(result.error || 'Failed to forge expedition')
    setIsSubmitting(false)
  }

  const handleMuster = async () => {
    if (!musterExpId || !musterName || !musterEmail) { setErrorMsg('All fields required'); return }
    setIsSubmitting(true); setErrorMsg('')
    const fd = new FormData()
    fd.append('group_id', musterExpId); fd.append('member_name', musterName)
    fd.append('member_email', musterEmail); fd.append('role', musterRole)
    const result = await musterMember(fd)
    if (result.success) {
      setAllExp(prev => prev.map(exp => exp.id === musterExpId ? ({
        ...exp,
        memberCount: (exp.memberCount || 1) + 1
      }) : exp))
      setMusterName(''); setMusterEmail(''); setMusterRole('Member'); closeModal()
    } else setErrorMsg(result.error || 'Failed to muster member')
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Disband this expedition permanently?')) return
    const result = await deleteExpedition(id)
    if (result.success) setAllExp(prev => prev.filter(e => e.id !== id))
    else alert(result.error)
  }

  const inputCls = "w-full bg-surface-container-highest border border-outline-variant rounded p-3 text-on-surface focus:outline-none focus:border-primary transition-all text-sm"
  const labelCls = "block font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-1.5"

  return (
    <>
      {/* FORGE MODAL */}
      {modal === 'forge' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto" onClick={closeModal}>
          <div className="relative bg-surface-container-high border border-primary/40 rounded-xl p-5 sm:p-6 w-full max-w-lg shadow-[0_0_60px_rgba(242,202,80,0.15)] max-h-[90vh] overflow-y-auto my-auto" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary m-3" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary m-3" />
            <h3 className="font-display-lg text-[22px] sm:text-[24px] text-primary-fixed gold-glow text-center mb-1">Forge New Expedition</h3>
            <p className="text-center text-on-surface-variant text-sm mb-5">Chart thy course into the unknown.</p>
            {errorMsg && <div className="mb-4 p-3 rounded bg-error/20 border border-error/40 text-on-error-container text-sm">{errorMsg}</div>}
            <div className="space-y-4">
              <div><label className={labelCls}>Expedition Name *</label><input className={inputCls} placeholder="e.g., Lost City of Aurelia" value={forgeName} onChange={e => setForgeName(e.target.value)} /></div>
              <div><label className={labelCls}>Destination</label><input className={inputCls} placeholder="e.g., Sunken Desert Kingdom" value={forgeDest} onChange={e => setForgeDest(e.target.value)} /></div>
              <div><label className={labelCls}>Description</label><textarea className={`${inputCls} resize-none`} rows={2} placeholder="Describe the quest..." value={forgeDesc} onChange={e => setForgeDesc(e.target.value)} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className={labelCls}>Party Size</label><input className={inputCls} type="number" min={1} max={20} value={forgeSize} onChange={e => setForgeSize(e.target.value)} /></div>
                <div><label className={labelCls}>Start Date</label><input className={inputCls} type="date" value={forgeStart} onChange={e => setForgeStart(e.target.value)} style={{ colorScheme: 'dark' }} /></div>
                <div><label className={labelCls}>End Date</label><input className={inputCls} type="date" value={forgeEnd} onChange={e => setForgeEnd(e.target.value)} style={{ colorScheme: 'dark' }} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 py-3 rounded border border-outline-variant text-on-surface-variant text-xs uppercase tracking-widest hover:bg-surface-container transition-colors">Cancel</button>
                <button onClick={handleForge} disabled={isSubmitting} className="flex-1 py-3 rounded bg-primary/10 border border-primary/50 text-primary text-xs uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[15px]">explore</span>
                  {isSubmitting ? 'Forging...' : 'Forge Expedition'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MUSTER MODAL */}
      {modal === 'muster' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto" onClick={closeModal}>
          <div className="relative bg-surface-container-high border border-secondary/40 rounded-xl p-5 sm:p-6 w-full max-w-md shadow-[0_0_60px_rgba(74,225,131,0.1)] max-h-[90vh] overflow-y-auto my-auto" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-secondary m-3" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-secondary m-3" />
            <h3 className="font-display-lg text-[22px] sm:text-[24px] text-secondary text-center mb-1">Muster New Party</h3>
            <p className="text-center text-on-surface-variant text-sm mb-5">Send a Raven Invitation to an adventurer.</p>
            {errorMsg && <div className="mb-4 p-3 rounded bg-error/20 border border-error/40 text-on-error-container text-sm">{errorMsg}</div>}
            {allExp.length === 0 ? (
              <div className="text-center py-6 text-on-surface-variant/60">
                <p className="text-sm">Forge an expedition first before mustering a party.</p>
                <button onClick={() => { setModal('forge'); setErrorMsg('') }} className="mt-3 text-primary text-xs uppercase tracking-widest hover:text-primary-fixed">Forge Expedition →</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div><label className={labelCls}>Select Expedition *</label>
                  <select className={inputCls} value={musterExpId} onChange={e => setMusterExpId(e.target.value)} style={{ colorScheme: 'dark' }}>
                    <option value="" style={{ background: '#2a1d15' }}>— Choose Expedition —</option>
                    {allExp.map(exp => <option key={exp.id} value={exp.id} style={{ background: '#2a1d15' }}>{exp.group_name}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Adventurer Name *</label><input className={inputCls} placeholder="e.g., Rowan Stormcaller" value={musterName} onChange={e => setMusterName(e.target.value)} /></div>
                <div><label className={labelCls}>Email Address *</label><input className={inputCls} type="email" placeholder="rowan@guild.net" value={musterEmail} onChange={e => setMusterEmail(e.target.value)} /></div>
                <div><label className={labelCls}>Role in Party</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(role => (
                      <button key={role} type="button" onClick={() => setMusterRole(role)}
                        className={`py-2 px-3 rounded border text-sm uppercase tracking-wider transition-all ${musterRole === role ? 'border-secondary bg-secondary/20 text-secondary' : 'border-outline-variant text-on-surface-variant hover:border-secondary/50'}`}>
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={closeModal} className="flex-1 py-3 rounded border border-outline-variant text-on-surface-variant text-xs uppercase tracking-widest hover:bg-surface-container transition-colors">Cancel</button>
                  <button onClick={handleMuster} disabled={isSubmitting} className="flex-1 py-3 rounded bg-secondary/10 border border-secondary/50 text-secondary text-xs uppercase tracking-widest hover:bg-secondary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[15px]">send</span>
                    {isSubmitting ? 'Sending...' : 'Send Raven'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1920px] mx-auto w-full pb-32 min-w-0">
        {/* Header — ONE forge button only */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 className="font-display-lg text-[32px] sm:text-[40px] text-on-background gold-glow break-words">Expeditions</h2>
            <p className="text-on-surface-variant mt-1 text-sm">Manage thy active quests and their brave parties.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => { setModal('muster'); setErrorMsg('') }}
              className="border border-secondary/50 text-secondary px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-secondary/10 transition-all">
              <span className="material-symbols-outlined text-[15px]">group_add</span> Muster Party
            </button>
            <button onClick={() => { setModal('forge'); setErrorMsg('') }}
              className="bg-primary/10 border border-primary/50 text-primary px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary/20 hover:shadow-glow transition-all">
              <span className="material-symbols-outlined text-[15px]">explore</span> Forge New Expedition
            </button>
          </div>
        </div>

        {/* Empty State */}
        {allExp.length === 0 ? (
          <div className="text-center py-24 bg-surface-container border border-outline-variant/30 rounded-xl px-4">
            <p className="text-[56px] mb-4">🗺</p>
            <h3 className="font-headline-lg text-[22px] text-on-surface-variant mb-2">No Expeditions Have Been Forged Yet</h3>
            <p className="text-on-surface-variant/60 text-sm mb-6">The world awaits thy brave ventures.</p>
            <button onClick={() => { setModal('forge'); setErrorMsg('') }}
              className="bg-primary/10 border border-primary/50 text-primary px-6 py-3 rounded-lg text-xs uppercase tracking-widest flex items-center gap-2 mx-auto hover:bg-primary/20 transition-all">
              <span className="material-symbols-outlined text-[16px]">explore</span> Forge Your First Expedition
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {allExp.map((exp, i) => (
              <div key={exp.id} className="bg-surface-container-high rounded-xl border border-outline-variant p-5 relative overflow-hidden group hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(242,202,80,0.08)]">
                <div className="absolute inset-0 opacity-[0.04] bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-y9IG0slkqgYqX93eOThNhzWJsLNIPqkeI3oORaepV_hdWfEhG3u3SA-8Kwm0Jygv1yuv5uSuxsJKqxi_ADv34f59EjA-jz8CJC-2DA0dpPFhE8qOgjuposfzD1DpreT5blzMCZ8HJY596BXr1LjD_vLzjJCGohdys_O9XdKGovpgo2G8m6EVmYiyG6hFWCQkhO6sNaTN2jCbYtrnFxO_PR-dm_-qwWQVElBtHy-1QriW5YQ9gwsEsaZQNtEOA6S4rgox0oTVJEi1')" }} />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-primary/30 shrink-0">
                        <span className="material-symbols-outlined text-[20px] text-primary">{EXP_ICONS[i % EXP_ICONS.length]}</span>
                      </div>
                      <div>
                        <h3 className="font-headline-lg text-[19px] text-on-background leading-tight">🏛 {exp.group_name}</h3>
                        {exp.destination && (
                          <p className="text-[11px] text-on-surface-variant flex items-center gap-1">📍 {exp.destination}</p>
                        )}
                      </div>
                    </div>
                    {exp.created_by === currentUserId && (
                      <button onClick={() => handleDelete(exp.id)} className="text-outline/40 hover:text-error transition-colors p-1">
                        <span className="material-symbols-outlined text-[17px]">delete</span>
                      </button>
                    )}
                  </div>

                  {exp.description && (
                    <p className="text-sm text-on-surface-variant/70 mb-3 line-clamp-2">{exp.description}</p>
                  )}

                  <div className="space-y-1.5 border-t border-outline-variant/30 pt-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">👥 Adventurers</span>
                      <span className="text-on-surface">{exp.memberCount} / {exp.party_size || 6}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">💰 Gold Spent</span>
                      <span className="text-primary">{exp.totalSpent.toFixed(0)} G</span>
                    </div>
                    {exp.debtCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">📜 Debt Scrolls</span>
                        <span className="text-error">{exp.debtCount}</span>
                      </div>
                    )}
                    {(exp.start_date || exp.end_date) && (
                      <div className="flex justify-between text-[11px] text-outline pt-1">
                        <span>🗓 {exp.start_date ? new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '?'}</span>
                        <span>→</span>
                        <span>{exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Ongoing'}</span>
                      </div>
                    )}
                  </div>

                  {/* Party bar */}
                  <div className="mt-3 w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 rounded-full" style={{ width: `${Math.min(100, (exp.memberCount / (exp.party_size || 6)) * 100)}%` }} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
