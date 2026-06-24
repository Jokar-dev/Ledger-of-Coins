import { createClient } from '@/lib/supabase/server'
import RelicsClient from './relics-client'

export const dynamic = 'force-dynamic'

export default async function RelicsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch user's own relics
  const { data: relics } = await supabase
    .from('relics')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch expeditions for the "found in" dropdown
  const { data: expeditions } = await supabase
    .from('shared_groups')
    .select('id, group_name')
    .eq('created_by', user.id)
    .order('group_name', { ascending: true })

  const { data: unlockedAchievements } = await supabase
    .from('achievements')
    .select('achievement_key, unlocked_at')
    .eq('user_id', user.id)

  return (
    <RelicsClient
      relics={relics || []}
      expeditions={expeditions || []}
      userId={user.id}
      unlockedAchievements={unlockedAchievements || []}
    />
  )
}
