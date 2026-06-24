import { createClient } from '@/lib/supabase/server'
import { ACHIEVEMENTS, AchievementDef, ACHIEVEMENT_LIST } from './achievements'

/**
 * Validates achievements and inserts any newly unlocked ones into the database.
 * Returns the list of newly unlocked achievement definitions so the UI can show a popup.
 */
async function unlockAchievementsIfMet(userId: string, checks: { key: string, isMet: boolean }[]): Promise<AchievementDef[]> {
  const supabase = createClient()
  
  // Get currently unlocked achievements to avoid duplicate inserts
  const { data: existing } = await supabase
    .from('achievements')
    .select('achievement_key')
    .eq('user_id', userId)

  const existingKeys = new Set(existing?.map(a => a.achievement_key) || [])
  
  const toUnlock = checks.filter(c => c.isMet && !existingKeys.has(c.key))
  if (toUnlock.length === 0) return []

  const inserts = toUnlock.map(c => ({
    user_id: userId,
    achievement_key: c.key
  }))

  const { error } = await supabase.from('achievements').insert(inserts)
  if (error) {
    console.error('Failed to unlock achievements:', error)
    return []
  }

  const newlyUnlocked = toUnlock.map(c => ACHIEVEMENTS[c.key]).filter(Boolean)

  // Check if "Living Legend" should be unlocked
  if (!existingKeys.has('living_legend')) {
    const totalPossible = ACHIEVEMENT_LIST.length - 1 // excluding living_legend itself
    const totalUnlockedNow = existingKeys.size + newlyUnlocked.length
    if (totalUnlockedNow >= totalPossible) {
      await supabase.from('achievements').insert({ user_id: userId, achievement_key: 'living_legend' })
      newlyUnlocked.push(ACHIEVEMENTS['living_legend'])
    }
  }

  return newlyUnlocked
}

export async function checkProfileAchievements(userId: string): Promise<AchievementDef[]> {
  const supabase = createClient()
  const { data: user } = await supabase.from('users').select('*').eq('id', userId).single()
  if (!user) return []

  const isMet = !!(user.avatar_url || localStorage?.getItem(`avatar_${userId}`)) && !!user.bio && !!user.chronicle_name
  return unlockAchievementsIfMet(userId, [{ key: 'chronicle_awakened', isMet }])
}

export async function checkExpeditionAchievements(userId: string): Promise<AchievementDef[]> {
  const supabase = createClient()
  const { count } = await supabase
    .from('shared_groups')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', userId)

  const total = count || 0
  return unlockAchievementsIfMet(userId, [
    { key: 'expedition_founder', isMet: total >= 1 },
    { key: 'realm_explorer', isMet: total >= 5 },
    { key: 'kingdom_builder', isMet: total >= 10 },
  ])
}

export async function checkExpenseAchievements(userId: string): Promise<AchievementDef[]> {
  const supabase = createClient()
  
  // Count total personal expenses
  const { count } = await supabase
    .from('personal_expenses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    
  // Check for Reckless Spender (>1000)
  const { data: recklessData } = await supabase
    .from('personal_expenses')
    .select('id')
    .eq('user_id', userId)
    .gt('amount', 1000)
    .limit(1)
    
  // Check total spent
  const { data: sums } = await supabase
    .from('personal_expenses')
    .select('amount')
    .eq('user_id', userId)
    
  const totalSpent = sums?.reduce((acc, row) => acc + Number(row.amount), 0) || 0
  const total = count || 0

  return unlockAchievementsIfMet(userId, [
    { key: 'first_coin_spent', isMet: total >= 1 },
    { key: 'wealth_tracker', isMet: total >= 25 },
    { key: 'master_treasurer', isMet: total >= 100 },
    { key: 'reckless_spender', isMet: !!(recklessData && recklessData.length > 0) },
    { key: 'gold_flood', isMet: totalSpent > 5000 },
  ])
}

export async function checkDebtAchievements(userId: string): Promise<AchievementDef[]> {
  const supabase = createClient()
  
  const { count: createdCount } = await supabase
    .from('debt_scrolls')
    .select('*', { count: 'exact', head: true })
    .eq('owed_to', userId)
    
  const { count: settledCount } = await supabase
    .from('debt_scrolls')
    .select('*', { count: 'exact', head: true })
    .eq('owed_by', userId)
    .eq('settled', true)

  return unlockAchievementsIfMet(userId, [
    { key: 'debt_creator', isMet: (createdCount || 0) >= 1 },
    { key: 'balance_keeper', isMet: (settledCount || 0) >= 1 },
    { key: 'lord_of_accounts', isMet: (settledCount || 0) >= 25 },
  ])
}

export async function checkRelicAchievements(userId: string): Promise<AchievementDef[]> {
  const supabase = createClient()
  const { count } = await supabase
    .from('relics')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const total = count || 0
  return unlockAchievementsIfMet(userId, [
    { key: 'relic_hunter', isMet: total >= 1 },
    { key: 'curator_of_wonders', isMet: total >= 10 },
  ])
}

export async function checkPdfAchievements(userId: string): Promise<AchievementDef[]> {
  // Since PDF tracking isn't in a database table directly, we'll store a counter in public.users metadata
  // To avoid complexity, we'll assume the client triggers a server action that updates a counter or checks directly.
  const supabase = createClient()
  const { data: user } = await supabase.from('users').select('name').eq('id', userId).single()
  if (!user) return []
  
  // For simplicity, we just trigger this based on an RPC/action call. 
  // We'll manage PDF count via a special table, or just metadata.
  // Actually, let's just create a quick table or use user metadata for PDF count.
  // We'll use user.name for now? No, we shouldn't hijack columns. 
  // Wait, there's no PDF tracking table. Let's create one or just use user metadata on auth.users!
  // Wait, auth.users metadata is available via supabase.auth.admin? No.
  
  // To fulfill PDF tracking without altering schema heavily: Let's assume the action passes the current count.
  // Or we just insert a dummy "pdf_generation" record? We don't have that table.
  // Let's just return true if called. The client action will pass `isFirst`, `isTenth`.
  return [] // We'll implement a custom check inside the PDF action
}
