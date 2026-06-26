import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Parallelize all 7 independent dashboard queries
  const [
    { data: profile },
    { data: recentExpenses },
    { data: allExpenses },
    { count: allExpeditionsCount },
    { data: recentExpeditions },
    { data: owedByMe },
    { data: owedToMe }
  ] = await Promise.all([
    supabase.from('users').select('explorer_name, chronicle_name, name').eq('id', user.id).single(),
    supabase.from('personal_expenses').select('amount, description, category, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('personal_expenses').select('amount'),
    supabase.from('shared_groups').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
    supabase.from('shared_groups').select('id, group_name, destination, created_at').eq('created_by', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('debt_scrolls').select('amount').eq('owed_by', user.id).eq('settled', false),
    supabase.from('debt_scrolls').select('amount').eq('owed_to', user.id).eq('settled', false)
  ])

  const totalGold = allExpenses?.reduce((s, e) => s + Number(e.amount), 0) || 0
  const goldOwed = owedByMe?.reduce((s, d) => s + Number(d.amount), 0) || 0
  const goldCollectible = owedToMe?.reduce((s, d) => s + Number(d.amount), 0) || 0

  return (
    <DashboardClient
      explorerName={profile?.explorer_name || profile?.name || user.email?.split('@')[0] || 'Wanderer'}
      chronicleName={profile?.chronicle_name || 'The Grand Ledger'}
      totalGold={totalGold}
      activeExpeditions={allExpeditionsCount || 0}
      goldOwed={goldOwed}
      goldCollectible={goldCollectible}
      recentExpenses={recentExpenses || []}
      recentExpeditions={recentExpeditions || []}
    />
  )
}
