'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createExpedition, musterMember, deleteExpedition, recordGroupExpense, removeMember, updateMemberRole } from './actions'
import { formatExpenseDate, formatExpenseTime } from '@/lib/timestamp-utils'

const ROLES = ['Leader', 'Treasurer', 'Scout', 'Member']
const EXP_ICONS = ['castle', 'forest', 'water_drop', 'account_balance', 'diamond', 'auto_awesome']

export default function GroupsClient({
  expeditions, currentUserId,
}: { expeditions: any[]; currentUserId: string }) {
  const [allExp, setAllExp] = useState(expeditions)
  const [modal, setModal] = useState<null | 'forge' | 'muster' | 'ledger' | 'record'>(null)
  const [activeExpedition, setActiveExpedition] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [expenseDesc, setExpenseDesc] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')

  useEffect(() => {
    setAllExp(prev => JSON.stringify(prev) === JSON.stringify(expeditions) ? prev : expeditions)
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

  const closeModal = () => { setModal(null); setErrorMsg(''); setExpenseDesc(''); setExpenseAmount('') }

  const handleRecordExpense = async () => {
    if (!activeExpedition || !expenseDesc || !expenseAmount) { setErrorMsg('All fields required'); return }
    setIsSubmitting(true); setErrorMsg('')
    const fd = new FormData()
    fd.append('group_id', activeExpedition.id)
    fd.append('description', expenseDesc)
    fd.append('amount', expenseAmount)
    const result = await recordGroupExpense(fd)
    if (result.success && result.expense) {
      const newExp = { ...result.expense, users: { explorer_name: 'You' }, created_at: result.expense.created_at || new Date().toISOString() }
      const updatedList = [newExp, ...(activeExpedition.recentExpenses || [])]
      const newTotal = activeExpedition.totalSpent + parseFloat(expenseAmount)
      setActiveExpedition({ ...activeExpedition, totalSpent: newTotal, recentExpenses: updatedList })
      setAllExp(prev => prev.map(e => e.id === activeExpedition.id ? { ...e, totalSpent: newTotal, recentExpenses: updatedList } : e))
      setExpenseDesc(''); setExpenseAmount(''); setModal('ledger')
    } else setErrorMsg(result.error || 'Failed to record expense')
    setIsSubmitting(false)
  }

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
    if (result.success && result.member) {
      setAllExp(prev => prev.map(exp => exp.id === musterExpId ? ({
        ...exp,
        members: [...(exp.members || []), result.member],
        memberCount: (exp.memberCount || 1) + 1
      }) : exp))
      setMusterName(''); setMusterEmail(''); setMusterRole('Member')
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
          <div className="relative bg-surface-container-high border border-secondary/40 rounded-xl p-5 sm:p-6 w-full max-w-xl shadow-[0_0_60px_rgba(74,225,131,0.1)] max-h-[90vh] overflow-y-auto my-auto" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-secondary m-3 pointer-events-none" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-secondary m-3 pointer-events-none" />
            <h3 className="font-display-lg text-[22px] sm:text-[24px] text-secondary text-center mb-1">Muster & Party Roster</h3>
            <p className="text-center text-on-surface-variant text-sm mb-5">Manage thy brave companions and invite new adventurers.</p>
            {errorMsg && <div className="mb-4 p-3 rounded bg-error/20 border border-error/40 text-on-error-container text-sm">{errorMsg}</div>}
            {allExp.length === 0 ? (
              <div className="text-center py-6 text-on-surface-variant/60">
                <p className="text-sm">Forge an expedition first before mustering a party.</p>
                <button onClick={() => { setModal('forge'); setErrorMsg('') }} className="mt-3 text-primary text-xs uppercase tracking-widest hover:text-primary-fixed">Forge Expedition →</button>
              </div>
            ) : (
              <div className="space-y-5">
                <div><label className={labelCls}>Select Expedition *</label>
                  <select className={inputCls} value={musterExpId} onChange={e => setMusterExpId(e.target.value)} style={{ colorScheme: 'dark' }}>
                    <option value="" style={{ background: '#2a1d15' }}>— Choose Expedition —</option>
                    {allExp.map(exp => <option key={exp.id} value={exp.id} style={{ background: '#2a1d15' }}>{exp.group_name}</option>)}
                  </select>
                </div>

                {musterExpId && (() => {
                  const selExp = allExp.find(e => e.id === musterExpId)
                  if (!selExp) return null
                  return (
                    <div className="border border-outline-variant/40 rounded-lg p-4 bg-surface-container/50">
                      <h4 className="font-label-sm text-[11px] text-secondary uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">groups</span> Current Party Roster ({selExp.members?.length || 1})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {(!selExp.members || selExp.members.length === 0) ? (
                          <p className="text-xs text-on-surface-variant/60 italic p-2 text-center">No companions listed yet.</p>
                        ) : selExp.members.map((m: any, idx: number) => (
                          <div key={m.id || idx} className="flex items-center justify-between p-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-xs">
                            <div className="min-w-0 pr-2">
                              <span className="font-medium text-on-surface block truncate">{m.member_name}</span>
                              <span className="text-[10px] text-outline block truncate">{m.member_email}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <select 
                                value={m.role || 'Member'} 
                                onChange={async (e) => {
                                  const newRole = e.target.value;
                                  setAllExp(prev => prev.map(exp => exp.id === selExp.id ? ({
                                    ...exp,
                                    members: exp.members.map((mem: any) => mem.id === m.id ? { ...mem, role: newRole } : mem)
                                  }) : exp));
                                  if (m.id) await updateMemberRole(m.id, newRole);
                                }}
                                className="bg-surface-container text-secondary text-[10px] rounded px-1.5 py-1 border border-secondary/30 focus:outline-none"
                                style={{ colorScheme: 'dark' }}
                              >
                                {ROLES.map(r => <option key={r} value={r} style={{ background: '#2a1d15' }}>{r}</option>)}
                              </select>
                              {m.role !== 'Leader' && (
                                <button 
                                  type="button"
                                  onClick={async () => {
                                    if (!confirm(`Dismiss ${m.member_name} from this expedition?`)) return;
                                    setAllExp(prev => prev.map(exp => exp.id === selExp.id ? ({
                                      ...exp,
                                      members: exp.members.filter((mem: any) => mem.id !== m.id),
                                      memberCount: Math.max(1, (exp.memberCount || 1) - 1)
                                    }) : exp));
                                    if (m.id) await removeMember(m.id, selExp.id);
                                  }}
                                  className="text-outline hover:text-error transition-colors p-1"
                                  title="Dismiss adventurer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">person_remove</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                <div className="border-t border-outline-variant/30 pt-4">
                  <h4 className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest mb-3">Invite New Adventurer</h4>
                  <div className="space-y-3">
                    <div><label className={labelCls}>Adventurer Name *</label><input className={inputCls} placeholder="e.g., Rowan Stormcaller" value={musterName} onChange={e => setMusterName(e.target.value)} /></div>
                    <div><label className={labelCls}>Email Address *</label><input className={inputCls} type="email" placeholder="rowan@guild.net" value={musterEmail} onChange={e => setMusterEmail(e.target.value)} /></div>
                    <div><label className={labelCls}>Role in Party</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ROLES.map(role => (
                          <button key={role} type="button" onClick={() => setMusterRole(role)}
                            className={`py-2 px-3 rounded border text-xs uppercase tracking-wider transition-all ${musterRole === role ? 'border-secondary bg-secondary/20 text-secondary font-medium' : 'border-outline-variant text-on-surface-variant hover:border-secondary/50'}`}>
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={closeModal} className="flex-1 py-3 rounded border border-outline-variant text-on-surface-variant text-xs uppercase tracking-widest hover:bg-surface-container transition-colors">Done</button>
                  <button onClick={handleMuster} disabled={isSubmitting || !musterExpId} className="flex-1 py-3 rounded bg-secondary/10 border border-secondary/50 text-secondary text-xs uppercase tracking-widest hover:bg-secondary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[15px]">send</span>
                    {isSubmitting ? 'Mustering...' : 'Muster Adventurer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEDGER MODAL */}
      {modal === 'ledger' && activeExpedition && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto" onClick={closeModal}>
          <div className="relative bg-surface-container-high border border-primary/40 rounded-xl p-5 sm:p-6 w-full max-w-lg shadow-[0_0_60px_rgba(242,202,80,0.1)] max-h-[90vh] overflow-hidden my-auto flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div>
                <h3 className="font-display-lg text-xl text-primary-fixed gold-glow">📜 {activeExpedition.group_name} Ledger</h3>
                <p className="text-[11px] text-on-surface-variant font-label-sm uppercase tracking-widest">Total Spent: {activeExpedition.totalSpent.toFixed(0)} G</p>
              </div>
              <button onClick={() => { setModal('record'); setErrorMsg('') }}
                className="bg-primary text-on-primary px-3 py-1.5 rounded text-[10px] font-label-sm uppercase tracking-widest hover:bg-primary-fixed transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">add</span> Record Expense
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 divide-y divide-outline-variant/20 min-h-[150px] my-4">
              {(!activeExpedition.recentExpenses || activeExpedition.recentExpenses.length === 0) ? (
                <div className="py-12 text-center text-on-surface-variant/60">
                  <p className="text-3xl mb-2">📜</p>
                  <p className="text-sm">No expenses recorded in this expedition yet.</p>
                </div>
              ) : (
                activeExpedition.recentExpenses.map((exp: any, idx: number) => (
                  <div key={exp.id || idx} className="pt-2.5 pb-1 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-headline-lg text-sm text-on-surface break-words">{exp.description}</p>
                      <div className="text-[10px] font-label-sm text-on-surface-variant/80 space-y-0.5 mt-0.5">
                        <p className="text-secondary/90 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">person</span> Paid by {exp.users?.explorer_name || exp.users?.name || 'Explorer'}
                        </p>
                        <p className="text-[#d4af37]/80 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">calendar_month</span> {formatExpenseDate(exp.created_at)}
                        </p>
                        <p className="text-[#d4af37]/60 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">schedule</span> {formatExpenseTime(exp.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className="font-display-lg text-base text-error font-bold shrink-0">-{Number(exp.amount).toFixed(2)}G</span>
                  </div>
                ))
              )}
            </div>

            <button onClick={closeModal} className="w-full py-2.5 rounded border border-outline-variant text-on-surface-variant text-xs font-label-sm uppercase tracking-widest hover:bg-surface-container transition-colors mt-auto">Close Ledger</button>
          </div>
        </div>
      )}

      {/* RECORD MODAL */}
      {modal === 'record' && activeExpedition && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto" onClick={closeModal}>
          <div className="relative bg-surface-container-high border border-primary/40 rounded-xl p-5 sm:p-6 w-full max-w-md shadow-[0_0_60px_rgba(242,202,80,0.1)] my-auto space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-display-lg text-xl text-primary-fixed gold-glow">Add Gold to {activeExpedition.group_name}</h3>
            {errorMsg && <div className="mb-4 p-3 rounded bg-error/20 border border-error/40 text-on-error-container text-sm">{errorMsg}</div>}
            <div>
              <label className="text-[11px] font-label-sm text-on-surface-variant uppercase tracking-widest block mb-1">Expense Description</label>
              <input value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} placeholder="e.g., Tavern Feast" className="w-full bg-surface-container-highest border border-outline-variant rounded p-3 text-on-surface text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-[11px] font-label-sm text-on-surface-variant uppercase tracking-widest block mb-1">Amount (Gold)</label>
              <input value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} type="number" step="0.01" min="0.01" placeholder="0.00" className="w-full bg-surface-container-highest border border-outline-variant rounded p-3 text-on-surface text-sm focus:outline-none focus:border-primary" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setModal('ledger'); setErrorMsg('') }} className="flex-1 py-3 rounded border border-outline-variant text-on-surface-variant text-xs font-label-sm uppercase tracking-widest hover:bg-surface-container transition-colors">Back to Ledger</button>
              <button onClick={handleRecordExpense} disabled={isSubmitting} className="flex-1 py-3 rounded bg-primary/10 border border-primary/50 text-primary text-xs font-label-sm uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[15px]">edit_document</span>
                {isSubmitting ? 'Recording...' : 'Record Gold'}
              </button>
            </div>
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

                  <div className="flex gap-1.5 mt-4 pt-3 border-t border-outline-variant/30 relative z-20">
                    <button onClick={() => { setActiveExpedition(exp); setModal('ledger'); setErrorMsg('') }}
                      className="flex-1 py-2 px-1 rounded bg-primary/10 border border-primary/40 text-primary font-label-sm text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-[14px]">receipt_long</span> Ledger
                    </button>
                    <button onClick={() => { setActiveExpedition(exp); setModal('record'); setErrorMsg('') }}
                      className="flex-1 py-2 px-1 rounded bg-secondary/10 border border-secondary/40 text-secondary font-label-sm text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-secondary/20 transition-all flex items-center justify-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-[14px]">add_circle</span> Gold
                    </button>
                    <button onClick={() => { setMusterExpId(exp.id); setModal('muster'); setErrorMsg('') }}
                      className="flex-1 py-2 px-1 rounded bg-tertiary/10 border border-tertiary/40 text-tertiary font-label-sm text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-tertiary/20 transition-all flex items-center justify-center gap-1 shrink-0"
                      title="View & Muster Party Roster">
                      <span className="material-symbols-outlined text-[14px]">groups</span> Party
                    </button>
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
