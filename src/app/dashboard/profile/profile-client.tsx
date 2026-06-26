'use client'

import { useState, useRef } from 'react'
import { updateProfile } from './actions'

const ACHIEVEMENT_INFO: Record<string, { name: string, icon: string, desc: string }> = {
  first_expense: { name: 'First Blood', icon: '🩸', desc: 'Recorded thy first expense.' },
  expedition_founder: { name: 'Expedition Founder', icon: '🏕️', desc: 'Forged a new expedition.' },
  gold_hoarder: { name: 'Gold Hoarder', icon: '💰', desc: 'Spent over 1,000 Gold.' },
  reckless_spender: { name: 'Reckless Spender', icon: '🔥', desc: 'Recorded a legendary expense.' },
  merchant_king: { name: 'Merchant King', icon: '👑', desc: 'Spent over 10,000 Gold total.' },
  master_explorer: { name: 'Master Explorer', icon: '🗺️', desc: 'Forged 5 or more expeditions.' }
}

export default function ProfileClient({
  user, profile, achievements, stats
}: {
  user: any, profile: any, achievements: any[], stats: { expeditions: number, totalGold: number }
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: profile.name || user.email?.split('@')[0] || '',
    explorer_name: profile.explorer_name || profile.name || user.email?.split('@')[0] || '',
    chronicle_name: profile.chronicle_name || `The ${profile.name || 'Wanderer'}'s Ledger`,
    bio: profile.bio || '',
    location: profile.location || '',
    avatar_url: profile.avatar_url || localStorage.getItem(`avatar_${user.id}`) || ''
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setFormData(prev => ({ ...prev, avatar_url: base64 }))
      localStorage.setItem(`avatar_${user.id}`, base64) // Fallback for layout
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      setErrorMsg('')
      const fd = new FormData()
      Object.entries(formData).forEach(([k, v]) => {
        if (k !== 'avatar_url') {
          fd.append(k, v)
        }
      })
      const result = await updateProfile(fd)
      if (result.success) {
        setIsEditing(false)
      } else {
        setErrorMsg(result.error || 'Failed to update profile')
      }
    } catch (e: any) {
      console.error(e)
      setErrorMsg('Unexpected Error: ' + (e.message || String(e)))
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls = "w-full bg-surface-container-highest border border-outline-variant rounded p-3 text-on-surface focus:outline-none focus:border-primary transition-all text-sm font-body-md"
  const labelCls = "block font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-1.5"

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full max-w-[1400px] mx-auto pb-32 space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline-variant pb-4 mb-8">
        <div>
          <h2 className="font-display-lg text-[32px] sm:text-[40px] text-primary-fixed gold-glow break-words">Explorer Profile</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 tracking-widest uppercase">Thy Identity in the Realm</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="bg-primary/10 border border-primary/50 text-primary px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary/20 hover:shadow-glow transition-all shrink-0">
            <span className="material-symbols-outlined text-[15px]">edit</span> Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Avatar & Quick Stats */}
        <div className="space-y-6">
          <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5 sm:p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30 m-2" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30 m-2" />
            
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full border-2 border-primary/50 overflow-hidden bg-surface-container mx-auto">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[64px] text-on-surface-variant mt-4">account_circle</span>
                )}
              </div>
              {isEditing && (
                <>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-full p-2 shadow-lg hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  </button>
                </>
              )}
            </div>

            <h3 className="font-display-lg text-[24px] text-primary-fixed gold-glow leading-tight break-words">{formData.explorer_name}</h3>
            <p className="text-on-surface-variant text-sm mt-1 mb-4 break-all">{user.email}</p>

            <div className="flex items-center justify-center gap-2 text-sm text-outline mb-4">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {formData.location || 'Unknown Realms'}
            </div>

            <div className="grid grid-cols-2 gap-2 text-left border-t border-outline-variant/30 pt-4">
              <div>
                <p className="font-label-sm text-[10px] text-outline uppercase">Expeditions</p>
                <p className="font-headline-lg text-primary">{stats.expeditions}</p>
              </div>
              <div>
                <p className="font-label-sm text-[10px] text-outline uppercase">Gold Spent</p>
                <p className="font-headline-lg text-primary">{stats.totalGold.toFixed(0)} G</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Achievements */}
        <div className="xl:col-span-2 space-y-6 min-w-0">
          {/* Profile Details */}
          <div className="bg-surface-container border border-outline-variant rounded-xl p-5 sm:p-6 relative overflow-hidden">
            <h3 className="font-headline-lg text-[18px] text-on-surface-variant uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">menu_book</span> Chronicle Information
            </h3>

            {errorMsg && <div className="mb-4 p-3 rounded bg-error/20 border border-error/40 text-on-error-container text-sm">{errorMsg}</div>}

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>True Name</label><input className={inputCls} value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} /></div>
                  <div><label className={labelCls}>Explorer Title</label><input className={inputCls} value={formData.explorer_name} onChange={e => setFormData(p => ({...p, explorer_name: e.target.value}))} /></div>
                  <div className="sm:col-span-2"><label className={labelCls}>Chronicle Name</label><input className={inputCls} value={formData.chronicle_name} onChange={e => setFormData(p => ({...p, chronicle_name: e.target.value}))} /></div>
                  <div className="sm:col-span-2"><label className={labelCls}>Location</label><input className={inputCls} value={formData.location} onChange={e => setFormData(p => ({...p, location: e.target.value}))} /></div>
                  <div className="sm:col-span-2"><label className={labelCls}>Biography</label><textarea className={`${inputCls} resize-none`} rows={4} value={formData.bio} onChange={e => setFormData(p => ({...p, bio: e.target.value}))} /></div>
                </div>
                <div className="flex flex-wrap gap-3 pt-4 border-t border-outline-variant/30">
                  <button onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none px-6 py-2.5 rounded border border-outline-variant text-on-surface-variant text-xs uppercase tracking-widest hover:bg-surface-container transition-colors text-center">Cancel</button>
                  <button onClick={handleSave} disabled={isSubmitting} className="flex-1 sm:flex-none px-6 py-2.5 rounded bg-primary/10 border border-primary/50 text-primary text-xs uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50 text-center">
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="font-label-sm text-[10px] text-outline uppercase tracking-widest mb-1">Biography</p>
                  <p className="text-on-surface text-sm italic">{formData.bio || 'This explorer has not yet written their history.'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/30">
                  <div>
                    <p className="font-label-sm text-[10px] text-outline uppercase tracking-widest mb-1">True Name</p>
                    <p className="text-on-surface">{formData.name || '—'}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-[10px] text-outline uppercase tracking-widest mb-1">Chronicle Title</p>
                    <p className="text-on-surface font-headline-lg text-primary">{formData.chronicle_name}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Achievements */}
          {!isEditing && (
            <div className="bg-surface-container border border-outline-variant rounded-xl p-6">
              <h3 className="font-headline-lg text-[18px] text-on-surface-variant uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">military_tech</span> Unlocked Achievements
              </h3>
              
              {achievements.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant/50">
                  <p className="text-[32px] mb-2">⭐</p>
                  <p className="text-sm">No achievements unlocked yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {achievements.map(ach => {
                    const info = ACHIEVEMENT_INFO[ach.achievement_key] || { name: ach.achievement_key, icon: '⭐', desc: 'A mysterious feat.' }
                    return (
                      <div key={ach.achievement_key} className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-surface-container-low">
                        <span className="text-[24px]">{info.icon}</span>
                        <div>
                          <p className="font-headline-lg text-[14px] text-primary">{info.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{info.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
