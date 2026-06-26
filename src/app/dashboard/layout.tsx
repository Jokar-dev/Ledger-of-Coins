'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef } from 'react'
import ExportLedgerButton from '@/components/export-ledger-button'
import { AchievementProvider } from '@/components/achievement-provider'
import { TourProvider } from '@/components/tour-provider'
import TourGuideButton from '@/components/tour-guide-button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [userEmail, setUserEmail] = useState('')
  const [explorerName, setExplorerName] = useState('Archivist')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || '')
        const storedAvatar = localStorage.getItem(`avatar_${user.id}`)
        
        // Fetch profile data
        const { data: profileData } = await supabase.from('users').select('*').eq('id', user.id).single()
        const profile = { ...profileData, ...user.user_metadata }
        
        if (profile) {
          setExplorerName(profile.explorer_name || profile.name || 'Wanderer')
          if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
          else if (storedAvatar) setAvatarUrl(storedAvatar)
        } else if (storedAvatar) {
          setAvatarUrl(storedAvatar)
        }
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    // Convert to base64 for local storage (no Supabase storage bucket needed)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        localStorage.setItem(`avatar_${user.id}`, base64)
        setAvatarUrl(base64)
      }
      setUploadingAvatar(false)
      setShowProfileMenu(false)
    }
    reader.readAsDataURL(file)
  }

  const NAV_ITEMS = [
    { name: 'Hall of Records', href: '/dashboard', icon: 'account_balance' },
    { name: 'Treasury Ledger', href: '/dashboard/expenses', icon: 'receipt_long' },
    { name: 'Expeditions', href: '/dashboard/groups', icon: 'explore' },
    { name: 'Oracle Chamber', href: '/dashboard/oracle', icon: 'auto_awesome' },
    { name: 'Relic Vault', href: '/dashboard/relics', icon: 'diamond' },
  ]

  const NOTIFICATIONS: { id: number; icon: string; color: string; text: string; time: string }[] = []

  const getBackgroundStyle = (path: string) => {
    if (path.includes('/expenses')) return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop'
    if (path.includes('/groups')) return 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=2070&auto=format&fit=crop'
    if (path.includes('/oracle')) return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2068&auto=format&fit=crop'
    if (path.includes('/relics')) return 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2070&auto=format&fit=crop'
    if (path.includes('/profile')) return 'https://images.unsplash.com/photo-1507842286343-583d248b18f4?q=80&w=2070&auto=format&fit=crop'
    return 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=2070&auto=format&fit=crop'
  }

  return (
    <AchievementProvider>
      <TourProvider>
      <div className="bg-background text-on-background font-body-md min-h-screen antialiased selection:bg-primary-container selection:text-on-primary-container">
        {/* Atmospheric Themed Background */}
        <div className="atmospheric-bg">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out opacity-30 scale-105 filter contrast-125 saturate-150"
            style={{ backgroundImage: `url(${getBackgroundStyle(pathname)})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0704] via-[#160d07]/85 to-[#0e0704]/90" />
          <div className="rune-overlay" />
          <div className="dust-particle w-1 h-1 top-[10%] left-[20%]" style={{ animationDelay: '0s' }} />
          <div className="dust-particle w-1.5 h-1.5 top-[30%] left-[70%]" style={{ animationDelay: '-3s' }} />
          <div className="dust-particle w-0.5 h-0.5 top-[60%] left-[40%]" style={{ animationDelay: '-7s' }} />
          <div className="dust-particle w-2 h-2 top-[80%] left-[85%]" style={{ animationDelay: '-11s' }} />
          <div className="dust-particle w-1 h-1 top-[50%] left-[10%]" style={{ animationDelay: '-14s' }} />
        </div>

      <div className="flex h-screen relative z-10 w-full max-w-[1920px] mx-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-outline-variant/20 overflow-hidden">
        
        {/* SideNavBar */}
        <nav className="hidden md:flex flex-col fixed left-[max(0px,calc(50%-960px))] top-0 h-full w-64 xl:w-72 border-r border-outline-variant bg-surface-container-high shadow-[inset_-10px_0_20px_rgba(0,0,0,0.5),0_0_15px_rgba(0,0,0,0.8)] py-stone-margin z-40">
          <div className="px-container-padding mb-stone-margin">
            <h1 className="font-display-lg text-headline-lg text-primary-fixed drop-shadow-[0_0_8px_rgba(233,195,73,0.5)]">Ledger of Lost Kingdoms</h1>
          </div>
          
          <div className="flex-1 flex flex-col gap-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              const tourId = item.href === '/dashboard' ? 'tour-dashboard' : `tour-${item.href.split('/').pop()}`
              return isActive ? (
                <Link key={item.name} href={item.href} prefetch={true} data-tour={tourId} className="flex items-center gap-3 text-primary font-bold bg-primary-container/20 border-l-4 border-primary px-4 py-3 shadow-[0_0_12px_rgba(242,202,80,0.2)] rounded-r-lg transition-all">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  <span className="font-body-md text-sm">{item.name}</span>
                </Link>
              ) : (
                <Link key={item.name} href={item.href} prefetch={true} data-tour={tourId} className="flex items-center gap-3 text-on-surface-variant px-4 py-3 opacity-70 hover:opacity-100 hover:bg-surface-container-highest hover:text-primary-fixed-dim transition-all duration-200 rounded-lg border-l-4 border-transparent hover:border-outline-variant">
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="font-body-md text-sm">{item.name}</span>
                </Link>
              )
            })}
          </div>
          
          <div className="px-4 mt-4">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-surface border border-outline-variant/50 text-on-surface-variant font-label-sm text-label-sm rounded hover:bg-surface-bright hover:border-error hover:text-error transition-all flex items-center justify-center gap-2 text-xs tracking-widest uppercase"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Sign Out
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex pointer-events-auto">
            {/* Backdrop */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            />
            {/* Drawer Content */}
            <div className="relative w-72 max-w-[85vw] h-full bg-[#2D231E] border-r-2 border-primary/40 shadow-[0_0_40px_rgba(0,0,0,0.9)] flex flex-col py-6 z-10">
              <div className="px-6 flex items-center justify-between mb-6 pb-4 border-b border-primary/20 shrink-0">
                <h1 className="font-display-lg text-lg text-primary-fixed drop-shadow-[0_0_8px_rgba(233,195,73,0.5)] leading-tight">Ledger of Lost Kingdoms</h1>
                <button onClick={() => setMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary p-1">
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  const tourId = item.href === '/dashboard' ? 'tour-dashboard' : `tour-${item.href.split('/').pop()}`
                  return isActive ? (
                    <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} data-tour={tourId} className="flex items-center gap-3 text-primary font-bold bg-primary-container/20 border-l-4 border-primary px-4 py-3 shadow-[0_0_12px_rgba(242,202,80,0.2)] rounded-r-lg transition-all">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                      <span className="font-body-md text-sm">{item.name}</span>
                    </Link>
                  ) : (
                    <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} data-tour={tourId} className="flex items-center gap-3 text-on-surface-variant px-4 py-3 opacity-70 hover:opacity-100 hover:bg-surface-container-highest hover:text-primary transition-all duration-200 rounded-lg border-l-4 border-transparent">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span className="font-body-md text-sm">{item.name}</span>
                    </Link>
                  )
                })}
              </div>

              <div className="px-4 mt-auto pt-4 border-t border-outline-variant/20 shrink-0">
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full py-3 bg-surface border border-outline-variant/50 text-on-surface-variant rounded hover:bg-surface-bright hover:border-error hover:text-error transition-all flex items-center justify-center gap-2 text-xs tracking-widest uppercase font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col md:ml-64 xl:ml-72 w-full min-w-0 h-full relative overflow-y-auto scroll-smooth">
          {/* TopAppBar */}
          <header className="flex justify-between items-center w-full px-container-padding h-16 bg-surface-container-low/90 backdrop-blur-md border-b border-outline-variant/30 shadow-md sticky top-0 z-30">
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-primary hover:bg-surface-variant rounded-lg transition-colors flex items-center justify-center -ml-1"
                aria-label="Open navigation menu"
              >
                <span className="material-symbols-outlined text-[26px]">menu</span>
              </button>
              <h2 className="font-display-lg text-headline-lg-mobile text-primary tracking-widest">Ledger</h2>
            </div>
            <div className="hidden md:block" />

            <div className="flex items-center gap-2 ml-auto relative">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setShowNotifPanel(!showNotifPanel); setShowProfileMenu(false) }}
                  className="p-2 text-on-surface-variant hover:text-secondary-fixed transition-colors rounded-full hover:bg-surface-variant relative"
                >
                  <span className="material-symbols-outlined text-[22px]">notifications_active</span>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-surface" />
                </button>

                {/* Notification Panel */}
                {showNotifPanel && (
                  <div className="absolute right-0 top-12 w-80 bg-surface-container-high border border-outline-variant rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] z-50 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-outline-variant/50">
                      <h4 className="font-headline-lg text-[16px] text-primary-fixed">Chronicles</h4>
                      <button onClick={() => setShowNotifPanel(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>
                    <div className="divide-y divide-outline-variant/30">
                      {NOTIFICATIONS.map(n => (
                        <div key={n.id} className="flex items-start gap-3 p-4 hover:bg-surface-container transition-colors">
                          <span className={`material-symbols-outlined text-[20px] mt-0.5 ${n.color}`}>{n.icon}</span>
                          <div className="flex-1">
                            <p className="font-body-md text-[14px] text-on-surface">{n.text}</p>
                            <p className="font-label-sm text-[10px] text-outline mt-1 uppercase tracking-widest">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-outline-variant/50">
                      <button className="w-full text-center font-label-sm text-[11px] text-primary uppercase tracking-widest hover:text-primary-fixed transition-colors">
                        View All Chronicles
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar */}
              <div className="relative">
                <button
                  data-tour="tour-profile"
                  onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifPanel(false) }}
                  className="w-9 h-9 rounded-full border-2 border-outline-variant hover:border-primary transition-colors overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.5)] relative"
                >
                  {avatarUrl ? (
                    <img alt="Profile" className="w-full h-full object-cover" src={avatarUrl} />
                  ) : (
                    <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-primary animate-spin">progress_activity</span>
                    </div>
                  )}
                </button>

                {/* Profile dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-64 bg-surface-container-high border border-outline-variant rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] z-50 overflow-hidden">
                    <div className="p-4 border-b border-outline-variant/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-primary/40 overflow-hidden">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-headline-lg text-[14px] text-on-surface truncate">{explorerName}</p>
                          <p className="font-label-sm text-[10px] text-outline truncate">{userEmail}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col py-2">
                      <Link href="/dashboard/profile" onClick={() => setShowProfileMenu(false)} className="w-full text-left px-4 py-3 hover:bg-surface-container flex items-center gap-3 transition-colors border-b border-outline-variant/30 text-on-surface">
                        <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                        Explorer Profile
                      </Link>
                      <Link href="/dashboard/relics" onClick={() => setShowProfileMenu(false)} className="w-full text-left px-4 py-3 hover:bg-surface-container flex items-center gap-3 transition-colors border-b border-outline-variant/30 text-on-surface">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">diamond</span>
                        Relic Collection
                      </Link>
                      <ExportLedgerButton variant="dropdown" />
                      <TourGuideButton onClick={() => setShowProfileMenu(false)} />
                      <button className="w-full text-left px-4 py-3 hover:bg-surface-container flex items-center gap-3 transition-colors border-b border-outline-variant/30 text-on-surface opacity-50 cursor-not-allowed">
                        <span className="material-symbols-outlined text-[18px] text-outline">settings</span>
                        Settings
                      </button>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-surface-bright flex items-center gap-3 transition-colors text-error hover:text-error-hover mt-1">
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Sign Out
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Click-outside overlay to close dropdowns */}
          {(showNotifPanel || showProfileMenu) && (
            <div className="fixed inset-0 z-20" onClick={() => { setShowNotifPanel(false); setShowProfileMenu(false) }} />
          )}
          
          {/* Dashboard Canvas (Page Children) */}
          {children}
        </main>
      </div>
      </div>
      </TourProvider>
    </AchievementProvider>
  )
}
