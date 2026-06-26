import { createClient } from '@/lib/supabase/server'
import ProfileClient from './profile-client'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Parallelize all 4 queries cleanly (Supabase query builders return { data, error })
  const [profileRes, achievementsRes, expRes, expensesRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('achievements').select('achievement_key, unlocked_at').eq('user_id', user.id),
    supabase.from('shared_groups').select('id').eq('created_by', user.id),
    supabase.from('personal_expenses').select('amount, description, created_at').eq('user_id', user.id).order('created_at', { ascending: false })
  ])

  const profileData = profileRes.data
  const achievements = achievementsRes.data || []
  const expeditions = expRes.data || []
  const expenses = expensesRes.data || []

  const profile = profileData ? { ...profileData, ...user.user_metadata } : { ...user.user_metadata }
  const totalGold = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0) || 0

  return (
    <ProfileClient 
      user={user}
      profile={profile || {}}
      achievements={achievements}
      stats={{
        expeditions: expeditions.length || 0,
        totalGold
      }}
      recentActivity={expenses.slice(0, 5)}
    />
  )
}
