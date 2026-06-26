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

  const expList = expeditions || []
  if (expList.length === 0) {
    return <GroupsClient expeditions={[]} currentUserId={user.id} />
  }

  const expIds = expList.map(e => e.id)

  // Batch fetch all members, expenses, and debts in 3 parallel queries (O(1) network trips instead of O(3N))
  const [membersRes, expDataRes, debtRes] = await Promise.all([
    supabase.from('group_members').select('*').in('group_id', expIds),
    supabase.from('group_expenses').select('*, users:paid_by(explorer_name, name, email)').in('group_id', expIds).order('created_at', { ascending: false }),
    supabase.from('debt_scrolls').select('group_id').in('group_id', expIds).eq('settled', false)
  ])

  const allMembers = membersRes.data || []
  const allExpenses = expDataRes.data || []
  const allDebts = debtRes.data || []

  // Map data in memory in O(N)
  const enriched = expList.map((exp) => {
    const members = allMembers.filter(m => m.group_id === exp.id)
    const recentExpenses = allExpenses.filter(e => e.group_id === exp.id)
    const totalSpent = recentExpenses.reduce((s, e) => s + Number(e.amount), 0)
    const debtCount = allDebts.filter(d => d.group_id === exp.id).length

    return {
      ...exp,
      members,
      memberCount: members.length || 1,
      totalSpent,
      debtCount,
      recentExpenses
    }
  })

  return <GroupsClient expeditions={enriched} currentUserId={user.id} />
}
