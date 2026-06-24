import { createClient } from '@/lib/supabase/server'
import ProfileClient from './profile-client'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let profile = {}
  let achievements: any[] = []
  let expeditions: any[] = []
  let expenses: any[] = []

  try {
    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    if (profileData) profile = { ...profileData, ...user.user_metadata }
  } catch (e) {
    profile = { ...user.user_metadata }
    console.error('Profile fetch error:', e)
  }

  try {
    const { data: achievementsData } = await supabase
      .from('achievements')
      .select('achievement_key, unlocked_at')
      .eq('user_id', user.id)
    if (achievementsData) achievements = achievementsData
  } catch (e) {
    console.error('Achievements fetch error:', e)
  }

  try {
    const { data: expData } = await supabase
      .from('shared_groups')
      .select('id')
      .eq('created_by', user.id)
    if (expData) expeditions = expData
  } catch (e) {}

  try {
    const { data: expesData } = await supabase
      .from('personal_expenses')
      .select('amount')
      .eq('user_id', user.id)
    if (expesData) expenses = expesData
  } catch (e) {}
  
  const totalGold = expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0

  return (
    <ProfileClient 
      user={user}
      profile={profile || {}}
      achievements={achievements || []}
      stats={{
        expeditions: expeditions?.length || 0,
        totalGold
      }}
    />
  )
}
