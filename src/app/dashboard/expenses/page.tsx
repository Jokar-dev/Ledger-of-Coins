import { createClient } from '@/lib/supabase/server'
import ExpensesClient from './expenses-client'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: expenses } = await supabase
    .from('personal_expenses')
    .select('*')
    .order('created_at', { ascending: false })

  // User profile
  const { data: profile } = await supabase
    .from('users').select('explorer_name, chronicle_name, name').eq('id', user.id).single()

  // Total gold (all expenses)
  const totalGold = expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0

  // Expeditions created by user
  const { data: recentExpeditions } = await supabase
    .from('shared_groups')
    .select('id, group_name, destination, created_at, party_size')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false }).limit(5)

  const { data: allExpeditions } = await supabase
    .from('shared_groups').select('id').eq('created_by', user.id)

  // Debt owed BY user (unsettled)
  const { data: owedByMe } = await supabase
    .from('debt_scrolls').select('amount').eq('owed_by', user.id).eq('settled', false)
  const goldOwed = owedByMe?.reduce((s, d) => s + Number(d.amount), 0) || 0

  // Debt owed TO user (unsettled)
  const { data: owedToMe } = await supabase
    .from('debt_scrolls').select('amount').eq('owed_to', user.id).eq('settled', false)
  const goldCollectible = owedToMe?.reduce((s, d) => s + Number(d.amount), 0) || 0

  const exportData = {
    explorerName: profile?.explorer_name || profile?.name || user.email?.split('@')[0] || 'Wanderer',
    chronicleName: profile?.chronicle_name || 'The Grand Ledger',
    totalGold,
    activeExpeditions: allExpeditions?.length || 0,
    goldOwed,
    goldCollectible,
    recentExpenses: (expenses || []).slice(0, 15), // top 15 for PDF
    recentExpeditions: recentExpeditions || []
  }

  return <ExpensesClient initialExpenses={expenses || []} currentUserId={user.id} exportData={exportData} />
}
