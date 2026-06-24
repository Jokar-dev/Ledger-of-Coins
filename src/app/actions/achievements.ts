'use server'

import { createClient } from '@/lib/supabase/server'
import { ACHIEVEMENTS, AchievementDef } from '@/lib/achievements'

export async function logPdfGeneration(): Promise<{ success: boolean, newAchievements?: AchievementDef[] }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  // We use user_metadata to track the number of PDFs generated
  const { data: userData } = await supabase.auth.getUser()
  const meta = userData.user?.user_metadata || {}
  const pdfCount = (meta.pdf_count || 0) + 1

  await supabase.auth.updateUser({
    data: { pdf_count: pdfCount }
  })

  // Check achievements
  const { data: existing } = await supabase
    .from('achievements')
    .select('achievement_key')
    .eq('user_id', user.id)

  const existingKeys = new Set(existing?.map(a => a.achievement_key) || [])
  const toUnlock = []

  if (pdfCount >= 1 && !existingKeys.has('archivist')) toUnlock.push('archivist')
  if (pdfCount >= 10 && !existingKeys.has('master_archivist')) toUnlock.push('master_archivist')

  if (toUnlock.length > 0) {
    const inserts = toUnlock.map(key => ({ user_id: user.id, achievement_key: key }))
    await supabase.from('achievements').insert(inserts)
    
    // Check Living Legend
    if (!existingKeys.has('living_legend')) {
      // 17 achievements total, 16 without living legend
      const totalUnlockedNow = existingKeys.size + toUnlock.length
      if (totalUnlockedNow >= 16) {
        await supabase.from('achievements').insert({ user_id: user.id, achievement_key: 'living_legend' })
        toUnlock.push('living_legend')
      }
    }

    return { 
      success: true, 
      newAchievements: toUnlock.map(k => ACHIEVEMENTS[k]) 
    }
  }

  return { success: true }
}
