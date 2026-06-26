import { createClient } from '@/lib/supabase/server'
import ExpensesClient from './expenses-client'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Parallelize all 6 queries
  const [
    { data: expenses },
    { data: profile },
    { data: recentExpeditions },
    { count: allExpeditionsCount },
    { data: owedByMe },
    { data: owedToMe }
  ] = await Promise.all([
    supabase.from('personal_expenses').select('*').order('created_at', { ascending: false }),
    supabase.from('users').select('explorer_name, chronicle_name, name').eq('id', user.id).single(),
    supabase.from('shared_groups').select('id, group_name, destination, created_at, party_size').eq('created_by', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('shared_groups').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
    supabase.from('debt_scrolls').select('amount').eq('owed_by', user.id).eq('settled', false),
    supabase.from('debt_scrolls').select('amount').eq('owed_to', user.id).eq('settled', false)
  ])

  const totalGold = expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0
  const goldOwed = owedByMe?.reduce((s, d) => s + Number(d.amount), 0) || 0
  const goldCollectible = owedToMe?.reduce((s, d) => s + Number(d.amount), 0) || 0

  const exportData = {
    explorerName: profile?.explorer_name || profile?.name || user.email?.split('@')[0] || 'Wanderer',
    chronicleName: profile?.chronicle_name || 'The Grand Ledger',
    totalGold,
    activeExpeditions: allExpeditionsCount || 0,
    goldOwed,
    goldCollectible,
    recentExpenses: (expenses || []).slice(0, 15), // top 15 for PDF
    recentExpeditions: recentExpeditions || []
  }

  return <ExpensesClient initialExpenses={expenses || []} currentUserId={user.id} exportData={exportData} explorerName={exportData.explorerName} />
}
