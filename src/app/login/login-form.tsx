'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded-md text-sm font-body border border-error">
            {error}
          </div>
        )}

        {/* Scribe's Sigil (Email) */}
        <div className="flex flex-col gap-2">
          <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2" htmlFor="email">
            <span className="material-symbols-outlined text-[16px]">draw</span> Scribe&apos;s Sigil (Email)
          </label>
          <input 
            className="parchment-input w-full p-3 rounded font-body-md text-body-md placeholder-on-surface-variant/40" 
            id="email" 
            placeholder="archivist@guild.com" 
            required 
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        {/* Arcane Cipher (Password) */}
        <div className="flex flex-col gap-2 relative">
          <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2" htmlFor="password">
            <span className="material-symbols-outlined text-[16px]">key</span> Arcane Cipher (Password)
          </label>
          <div className="relative w-full">
            <input 
              className="parchment-input w-full p-3 pr-12 rounded font-body-md text-body-md placeholder-on-surface-variant/40" 
              id="password" 
              placeholder="••••••••" 
              required 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {/* Magical Eye Toggle */}
            <button 
              aria-label="Toggle password visibility" 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none" 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>

        {/* Remember / Forgot */}
        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5 border border-outline-variant rounded bg-surface-container-lowest group-hover:border-primary transition-colors">
              <input className="opacity-0 absolute inset-0 cursor-pointer" type="checkbox"/>
              <span className="material-symbols-outlined text-[14px] text-primary opacity-0 group-has-[:checked]:opacity-100 transition-opacity">check</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Seal Oath</span>
          </label>
          <a className="font-label-sm text-label-sm text-primary hover:text-primary-fixed hover:underline underline-offset-4 transition-colors" href="#">
            Lost Runes?
          </a>
        </div>

        {/* Enter Button */}
        <button 
          disabled={loading}
          className="w-full mt-4 py-4 rounded bg-surface-container-low text-primary font-headline-lg text-headline-lg glowing-border relative overflow-hidden group" 
          type="submit"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">auto_awesome</span>
            {loading ? 'Entering...' : 'Enter the Ledger'}
          </span>
          <div className="absolute inset-0 bg-primary/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out skew-x-[-20deg]" />
        </button>
      </form>

      {/* Footer Hook */}
      <div className="mt-8 text-center border-t border-outline-variant/30 pt-6 w-full">
        <span className="font-body-md text-body-md text-on-surface-variant">New to the Guild?</span>
        <Link 
          href="/signup"
          className="font-label-sm text-label-sm text-primary hover:text-primary-fixed hover:underline underline-offset-4 ml-2 transition-colors uppercase"
        >
          Register Artifact
        </Link>
      </div>
    </>
  )
}
