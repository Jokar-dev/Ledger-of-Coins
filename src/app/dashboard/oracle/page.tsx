import { createClient } from '@/lib/supabase/server'
import OracleClient from './oracle-client'

export const dynamic = 'force-dynamic'

export default async function OraclePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Parallelize independent queries
  const [{ data: expenses }, { data: expeditions }] = await Promise.all([
    supabase.from('personal_expenses').select('amount, category, created_at, description').order('created_at', { ascending: false }),
    supabase.from('shared_groups').select('id, group_name, destination').eq('created_by', user.id)
  ])

  // Monthly aggregation
  const monthlyMap: Record<string, number> = {}
  const categoryMap: Record<string, number> = {}
  let totalSpent = 0

  for (const e of expenses || []) {
    const amt = Number(e.amount)
    totalSpent += amt
    const month = e.created_at.slice(0, 7)
    monthlyMap[month] = (monthlyMap[month] || 0) + amt
    categoryMap[e.category || 'Other'] = (categoryMap[e.category || 'Other'] || 0) + amt
  }

  const monthly = Object.entries(monthlyMap).sort().slice(-6).map(([month, amount]) => ({ month, amount }))
  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])
  const topCategory = categories[0]

  return (
    <OracleClient
      expenses={expenses || []}
      totalSpent={totalSpent}
      monthly={monthly}
      categories={categories}
      topCategory={topCategory || ['—', 0]}
      expeditions={expeditions || []}
    />
  )
}
