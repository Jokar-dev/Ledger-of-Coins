'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Fantasy display name suffixes
const SUFFIXES = [
  'of Forgotten Tides', 'of the Lost Kingdom', 'of Ancient Aurelia',
  'of the Wanderers', 'of Eternal Night', 'of the First Age',
  'of the Sunken Desert', 'of Undying Flame', 'of the Oracle',
]

function generateDisplayName(name: string, expeditionName?: string | null): string {
  if (expeditionName) {
    const stripped = expeditionName.replace(/^(The |Lost |Ancient |Fallen )/i, '').trim()
    return `The ${name} of ${stripped}`
  }
  const idx = Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % SUFFIXES.length
  return `The ${name} ${SUFFIXES[idx]}`
}

import { checkRelicAchievements } from '@/lib/achievement-engine'

export async function addRelic(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const expedition_id = formData.get('expedition_id') as string || null
  const expedition_name = formData.get('expedition_name') as string || null
  const estimated_value = parseFloat(formData.get('estimated_value') as string || '0')

  if (!name) return { success: false, error: 'Relic name is required' }

  const display_name = generateDisplayName(name, expedition_name)

  const { data: relic, error } = await supabase
    .from('relics')
    .insert({
      user_id: user.id,
      name,
      display_name,
      description,
      expedition_id: expedition_id || null,
      expedition_name: expedition_name || null,
      estimated_value,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  const newAchievements = await checkRelicAchievements(user.id)

  revalidatePath('/dashboard/relics')
  revalidatePath('/dashboard')
  return { success: true, relic, newAchievements }
}

export async function deleteRelic(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase.from('relics').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/relics')
  return { success: true }
}
