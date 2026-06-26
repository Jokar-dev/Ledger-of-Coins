import { createClient } from '@/lib/supabase/server'
import RelicsClient from './relics-client'

export const dynamic = 'force-dynamic'

export default async function RelicsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Parallelize all 3 queries
  const [{ data: relics }, { data: expeditions }, { data: unlockedAchievements }] = await Promise.all([
    supabase.from('relics').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('shared_groups').select('id, group_name').eq('created_by', user.id).order('group_name', { ascending: true }),
    supabase.from('achievements').select('achievement_key, unlocked_at').eq('user_id', user.id)
  ])

  return (
    <RelicsClient
      relics={relics || []}
      expeditions={expeditions || []}
      userId={user.id}
      unlockedAchievements={unlockedAchievements || []}
    />
  )
}
