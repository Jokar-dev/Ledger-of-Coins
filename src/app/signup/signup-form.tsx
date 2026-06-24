'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            explorer_name: name,
            chronicle_name: `The ${name} Ledger`,
          }
        }
      })

      if (signUpError) throw signUpError

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error creating account')
    } finally {
      setLoading(false)
    }
  }

  // Password strength
  let strength = 0
  if (password.length > 0) strength += 1
  if (password.length > 5 && /[A-Z]/.test(password) && /[0-9]/.test(password)) strength += 1
  if (password.length > 8 && /[^A-Za-z0-9]/.test(password)) strength += 1

  let strengthColor = 'bg-surface-variant'
  let strengthWidth = '0%'
  let strengthText = 'Empty'
  let strengthTextColor = 'text-outline'
  let strengthShadow = ''

  if (strength === 1) {
    strengthWidth = '33%'; strengthColor = 'bg-error'; strengthTextColor = 'text-error'
    strengthShadow = 'shadow-[0_0_10px_rgba(255,180,171,0.5)]'; strengthText = 'Fading Ember'
  } else if (strength === 2) {
    strengthWidth = '66%'; strengthColor = 'bg-primary'; strengthTextColor = 'text-primary'
    strengthShadow = 'shadow-[0_0_10px_rgba(242,202,80,0.5)]'; strengthText = 'Ancient Flame'
  } else if (strength >= 3) {
    strengthWidth = '100%'; strengthColor = 'bg-secondary'; strengthTextColor = 'text-secondary'
    strengthShadow = 'shadow-[0_0_15px_rgba(74,225,131,0.6)]'; strengthText = 'Arcane Power'
  }

  return (
    <form onSubmit={handleSignup} className="space-y-5">
      {error && (
        <div className="bg-error-container text-on-error-container p-3 rounded-md text-sm border border-error">
          {error}
        </div>
      )}

      {/* Explorer Name */}
      <div className="space-y-1.5">
        <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2" htmlFor="explorer_name">
          <span className="material-symbols-outlined text-base">badge</span>
          Explorer Name
        </label>
        <input 
          className="w-full bg-surface-variant text-on-surface border border-outline-variant rounded p-3 font-body-md stone-inset focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none placeholder:text-outline/50 transition-colors" 
          id="explorer_name" 
          placeholder="e.g., Kaelen the Swift" 
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        {name && (
          <p className="text-[11px] text-primary/70 font-label-sm tracking-widest">
            Chronicle will be named: &quot;The {name} Ledger&quot;
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2" htmlFor="email">
          <span className="material-symbols-outlined text-base">mail</span>
          Arcane Address (Email)
        </label>
        <input 
          className="w-full bg-surface-variant text-on-surface border border-outline-variant rounded p-3 font-body-md stone-inset focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none placeholder:text-outline/50 transition-colors" 
          id="email" 
          placeholder="kaelen@guild.net" 
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2" htmlFor="password">
          <span className="material-symbols-outlined text-base">key</span>
          Secret Cipher (Password)
        </label>
        <input 
          className="w-full bg-surface-variant text-on-surface border border-outline-variant rounded p-3 font-body-md stone-inset focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none placeholder:text-outline/50 transition-colors" 
          id="password" 
          placeholder="••••••••" 
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        
        <div className="pt-1">
          <div className="flex justify-between items-center mb-1">
            <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">Cipher Strength</span>
            <span className={`font-label-sm text-[10px] uppercase tracking-wider transition-colors duration-300 ${strengthTextColor}`}>
              {strengthText}
            </span>
          </div>
          <div className="w-full h-2 rounded bg-surface-container-highest border border-outline-variant/50 mana-bar-vial overflow-hidden">
            <div className={`h-full transition-all duration-500 ease-out ${strengthColor} ${strengthShadow}`} style={{ width: strengthWidth }} />
          </div>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2" htmlFor="confirm_password">
          <span className="material-symbols-outlined text-base">lock_reset</span>
          Verify Cipher
        </label>
        <input 
          className="w-full bg-surface-variant text-on-surface border border-outline-variant rounded p-3 font-body-md stone-inset focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none placeholder:text-outline/50 transition-colors" 
          id="confirm_password" 
          placeholder="••••••••" 
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {/* Actions */}
      <div className="pt-4">
        <button 
          disabled={loading}
          className="w-full bg-surface-tint text-on-primary-fixed-variant font-headline-lg text-body-md py-4 rounded rune-button-glow flex items-center justify-center gap-2" 
          type="submit"
        >
          <span>{loading ? 'Inscribing Chronicle...' : 'Begin Your Journey'}</span>
          <span className="material-symbols-outlined">explore</span>
        </button>
        <p className="text-center font-body-md text-[13px] text-on-surface-variant mt-4">
          Already have a ledger? <Link className="text-primary hover:text-primary-fixed underline decoration-primary/30 underline-offset-4 transition-colors" href="/login">Open Archives</Link>
        </p>
      </div>
    </form>
  )
}
