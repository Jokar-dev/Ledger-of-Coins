'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, LayoutDashboard, Receipt, Users, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Expenses', href: '/dashboard/expenses', icon: Receipt },
    { name: 'My Groups', href: '/dashboard/groups', icon: Users },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface-bright border-b border-outline-variant z-50 flex items-center justify-between px-4">
        <h1 className="font-display text-xl text-primary font-bold">Ledger</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-on-surface">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Content */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface-bright border-r border-outline-variant transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-16 flex items-center px-6 border-b border-outline-variant md:flex hidden">
          <h1 className="font-display text-2xl text-primary font-bold">Ledger of the Wanderers</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md font-body transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary-fixed border border-primary/30 shadow-[inset_0_0_10px_rgba(242,202,80,0.1)]' 
                    : 'text-on-surface-variant hover:bg-surface hover:text-on-surface'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-primary' : 'opacity-70'} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-outline-variant bg-surface-container-low">
          <div className="text-xs font-label text-on-surface-variant truncate mb-4 px-2">
            {userEmail}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 font-label text-xs uppercase tracking-widest text-error border border-error/50 rounded hover:bg-error/10 transition-colors"
          >
            <LogOut size={16} />
            Abandon Ledger
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
