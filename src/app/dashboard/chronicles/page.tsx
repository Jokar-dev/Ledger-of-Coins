import { createClient } from '@/lib/supabase/server'
import ChroniclesClient from './chronicles-client'

export const dynamic = 'force-dynamic'

export default async function ChroniclesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: chronicles } = await supabase
    .from('chronicles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <ChroniclesClient initialChronicles={chronicles || []} />
}
