'use client'

import React, { useState, useEffect } from 'react'
import { createChronicle, deleteChronicle, type ChronicleEntry } from './actions'
import { formatFullTimestamp } from '@/lib/timestamp-utils'

const CATEGORY_ICONS: Record<string, string> = {
  Adventure: '⚔️',
  Lore: '📜',
  Treasury: '💰',
  Expedition: '🗺️',
  Relic: '🏺',
  Victory: '👑',
  Other: '✨',
}

export default function ChroniclesClient({ initialChronicles }: { initialChronicles: ChronicleEntry[] }) {
  const [chronicles, setChronicles] = useState<ChronicleEntry[]>(initialChronicles)

  useEffect(() => {
    setChronicles(prev => JSON.stringify(prev) === JSON.stringify(initialChronicles) ? prev : initialChronicles)
  }, [initialChronicles])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Adventure')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Title and Chronicle story are required.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    const fd = new FormData()
    fd.append('title', title)
    fd.append('category', category)
    fd.append('content', content)

    const result = await createChronicle(fd)
    if (result.success && result.chronicle) {
      setChronicles(prev => [result.chronicle!, ...prev])
      setTitle('')
      setContent('')
      setCategory('Adventure')
      setIsModalOpen(false)
    } else {
      setErrorMsg(result.error || 'Failed to scribe Chronicle entry.')
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Shall this Chronicle entry be erased from the ancient archives forever?')) return

    // Optimistic delete
    setChronicles(prev => prev.filter(c => c.id !== id))
    const res = await deleteChronicle(id)
    if (!res.success) {
      alert(res.error || 'Failed to erase Chronicle')
    }
  }

  const inputCls = "w-full bg-surface-container-highest border border-outline-variant rounded p-3 text-on-surface focus:outline-none focus:border-primary transition-all text-sm"
  const labelCls = "block font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-1.5"

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1920px] mx-auto w-full pb-32 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h2 className="font-display-lg text-[32px] sm:text-[40px] text-on-background gold-glow break-words">The Grand Chronicles</h2>
          <p className="text-on-surface-variant mt-1 text-sm">Preserve thy legendary deeds, lore, and sacred expedition memories.</p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setErrorMsg('') }}
          className="bg-primary/10 border border-primary/50 text-primary px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary/20 hover:shadow-glow transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">history_edu</span> Scribe New Chronicle
        </button>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setIsModalOpen(false)}>
          <div className="relative bg-surface-container-high border border-primary/40 rounded-xl p-5 sm:p-6 w-full max-w-lg shadow-[0_0_60px_rgba(242,202,80,0.15)] max-h-[90vh] overflow-y-auto my-auto" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary m-3 pointer-events-none" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary m-3 pointer-events-none" />
            
            <h3 className="font-display-lg text-[22px] sm:text-[24px] text-primary-fixed gold-glow text-center mb-1">Scribe Sacred Chronicle</h3>
            <p className="text-center text-on-surface-variant text-sm mb-5">Let thy deeds echo through eternity.</p>
            
            {errorMsg && <div className="mb-4 p-3 rounded bg-error/20 border border-error/40 text-on-error-container text-sm">{errorMsg}</div>}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={labelCls}>Chronicle Title *</label>
                <input className={inputCls} placeholder="e.g., The Discovery of the Sunken Vault" value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>Sacred Category</label>
                <select className={inputCls} value={category} onChange={e => setCategory(e.target.value)} style={{ colorScheme: 'dark' }}>
                  {Object.keys(CATEGORY_ICONS).map(cat => (
                    <option key={cat} value={cat} style={{ background: '#2a1d15' }}>{CATEGORY_ICONS[cat]} {cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>The Chronicle Tale *</label>
                <textarea
                  className={`${inputCls} resize-none font-body-md leading-relaxed`}
                  rows={6}
                  placeholder="Recount thy heroic journey or notable transaction..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded border border-outline-variant text-on-surface-variant text-xs font-label-sm uppercase tracking-widest hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded bg-primary/10 border border-primary/50 text-primary text-xs font-label-sm uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">history_edu</span>
                  {isSubmitting ? 'Scribing...' : 'Seal Chronicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHRONICLES LIST */}
      {chronicles.length === 0 ? (
        <div className="text-center py-24 bg-surface-container border border-outline-variant/30 rounded-xl px-4">
          <p className="text-[56px] mb-4">📜</p>
          <h3 className="font-headline-lg text-[22px] text-on-surface-variant mb-2">Thy Chronicle is Currently Unwritten</h3>
          <p className="text-on-surface-variant/60 text-sm mb-6">Take up the quill and record thy first legendary adventure.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary/10 border border-primary/50 text-primary px-6 py-3 rounded-lg text-xs uppercase tracking-widest flex items-center gap-2 mx-auto hover:bg-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">history_edu</span> Scribe First Chronicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {chronicles.map((c) => (
            <div
              key={c.id}
              className="bg-surface-container-high rounded-xl border border-outline-variant p-6 relative overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_25px_rgba(242,202,80,0.08)]"
            >
              <div className="absolute inset-0 opacity-[0.03] bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-y9IG0slkqgYqX93eOThNhzWJsLNIPqkeI3oORaepV_hdWfEhG3u3SA-8Kwm0Jygv1yuv5uSuxsJKqxi_ADv34f59EjA-jz8CJC-2DA0dpPFhE8qOgjuposfzD1DpreT5blzMCZ8HJY596BXr1LjD_vLzjJCGohdys_O9XdKGovpgo2G8m6EVmYiyG6hFWCQkhO6sNaTN2jCbYtrnFxO_PR-dm_-qwWQVElBtHy-1QriW5YQ9gwsEsaZQNtEOA6S4rgox0oTVJEi1')" }} />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[26px] p-2 bg-surface-container rounded-lg border border-outline-variant/40 shrink-0">
                      {CATEGORY_ICONS[c.category] || '📜'}
                    </span>
                    <div>
                      <span className="font-label-sm text-[10px] text-primary uppercase tracking-widest block mb-0.5">
                        {c.category}
                      </span>
                      <h3 className="font-display-lg text-[18px] sm:text-[20px] text-on-background leading-snug break-words">
                        {c.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-outline/40 hover:text-error transition-colors p-1 shrink-0"
                    title="Erase Chronicle"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                <div className="bg-surface-container/50 border border-outline-variant/30 rounded-lg p-4 mb-6">
                  <p className="font-body-md text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap break-words">
                    {c.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4 text-xs text-outline font-label-sm uppercase tracking-wider relative z-10">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-primary/70">auto_stories</span> Sealed Entry
                </span>
                <span>📅 {formatFullTimestamp(c.created_at)}</span>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
