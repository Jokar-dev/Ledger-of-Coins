'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { checkProfileAchievements } from '@/lib/achievement-engine'

export async function updateProfile(formData: FormData) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const name = formData.get('name') as string
    const explorer_name = formData.get('explorer_name') as string
    const chronicle_name = formData.get('chronicle_name') as string
    const bio = formData.get('bio') as string
    const location = formData.get('location') as string
    const avatar_url = formData.get('avatar_url') as string

    // Save profile extensions to auth metadata to bypass missing DB columns
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        explorer_name,
        chronicle_name,
        bio,
        location,
        avatar_url
      }
    })

    if (authError) return { success: false, error: authError.message }

    // Only update name in public.users since other columns might be missing
    const { error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', user.id)

    if (error) {
      console.error('Supabase update error:', error)
      return { success: false, error: error.message }
    }

    const newAchievements = await checkProfileAchievements(user.id)

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')
    return { success: true, newAchievements }
  } catch (e: any) {
    console.error('Unhandled Server Action Error:', e)
    return { success: false, error: e.message || String(e) }
  }
}
