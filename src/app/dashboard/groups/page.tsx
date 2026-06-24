import { createClient } from '@/lib/supabase/server'
import GroupsClient from './groups-client'

export const dynamic = 'force-dynamic'

export default async function GroupsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: expeditions } = await supabase
    .from('shared_groups')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  // Enrich each expedition with member count, gold spent, debt scroll count
  const enriched = await Promise.all((expeditions || []).map(async (exp) => {
    const { count: memberCount } = await supabase
      .from('group_members').select('*', { count: 'exact', head: true }).eq('group_id', exp.id)

    const { data: expData } = await supabase
      .from('group_expenses').select('amount').eq('group_id', exp.id)
    const totalSpent = expData?.reduce((s, e) => s + Number(e.amount), 0) || 0

    const { count: debtCount } = await supabase
      .from('debt_scrolls').select('*', { count: 'exact', head: true })
      .eq('group_id', exp.id).eq('settled', false)

    return { ...exp, memberCount: memberCount || 1, totalSpent, debtCount: debtCount || 0 }
  }))

  return <GroupsClient expeditions={enriched} currentUserId={user.id} />
}
