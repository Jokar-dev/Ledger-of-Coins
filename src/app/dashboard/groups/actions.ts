'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkExpeditionAchievements } from '@/lib/achievement-engine'

export async function createExpedition(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const group_name = formData.get('name') as string
  const destination = formData.get('destination') as string
  const description = formData.get('description') as string
  const party_size = parseInt(formData.get('party_size') as string || '6')
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string

  if (!group_name?.trim()) return { success: false, error: 'Expedition name is required' }

  const { data: group, error } = await supabase
    .from('shared_groups')
    .insert({ group_name: group_name.trim(), destination, description, party_size, start_date: start_date || null, end_date: end_date || null, created_by: user.id })
    .select().single()

  if (error) return { success: false, error: error.message }

  // Add creator as Leader in group_members
  await supabase.from('group_members').insert({
    group_id: group.id, user_id: user.id, role: 'Leader',
    member_name: user.email?.split('@')[0], member_email: user.email
  })

  const newAchievements = await checkExpeditionAchievements(user.id)

  revalidatePath('/dashboard/groups')
  revalidatePath('/dashboard')
  return { success: true, group, newAchievements }
}

export async function musterMember(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const group_id = formData.get('group_id') as string
  const member_name = formData.get('member_name') as string
  const member_email = formData.get('member_email') as string
  const role = formData.get('role') as string

  if (!group_id || !member_name || !member_email) return { success: false, error: 'All fields required' }

  const emailClean = member_email.trim()

  // 1. Check if an adventurer with this exact email is already mustered in this party
  const { data: existingByEmail } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', group_id)
    .ilike('member_email', emailClean)
    .maybeSingle()

  if (existingByEmail) {
    return { success: false, error: 'An adventurer with this raven email address is already mustered in this party!' }
  }

  // 2. Check if member email matches an existing registered user (bypassing RLS via RPC)
  let userId: string | null = null
  if (emailClean.toLowerCase() === user.email?.toLowerCase()) {
    userId = user.id
  } else {
    const { data: rpcId } = await supabase.rpc('lookup_user_by_email', { lookup_email: emailClean })
    if (rpcId) {
      userId = rpcId
    } else {
      const { data: existingUser } = await supabase.from('users').select('id').ilike('email', emailClean).maybeSingle()
      userId = existingUser?.id || null
    }
  }

  // 3. Check if this user UUID is already in the party (e.g. Leader)
  if (userId) {
    const { data: existingById } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (existingById) {
      return { success: false, error: 'This adventurer is already mustered in this expedition!' }
    }
  }

  const { data: member, error } = await supabase.from('group_members').insert({
    group_id,
    user_id: userId,
    role: role || 'Member',
    member_name: member_name.trim(),
    member_email: emailClean,
  }).select().single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/groups')
  revalidatePath('/dashboard')
  return { success: true, member }
}

export async function removeMember(member_id: string, group_id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('id', member_id)
    .eq('group_id', group_id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/groups')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateMemberRole(member_id: string, role: string, member_name?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const updatePayload: any = { role }
  if (member_name?.trim()) updatePayload.member_name = member_name.trim()

  const { error } = await supabase
    .from('group_members')
    .update(updatePayload)
    .eq('id', member_id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/groups')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteExpedition(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase.from('shared_groups').delete().eq('id', id).eq('created_by', user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/groups')
  return { success: true }
}

// Keep legacy alias
export { createExpedition as createGroup, deleteExpedition as deleteGroup }

export async function recordGroupExpense(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const group_id = formData.get('group_id') as string
  const description = formData.get('description') as string
  const amountStr = formData.get('amount') as string

  if (!group_id || !description || !amountStr) {
    return { success: false, error: 'All fields required' }
  }

  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) return { success: false, error: 'Invalid gold amount' }

  const { data: expense, error } = await supabase.from('group_expenses').insert({
    group_id,
    paid_by: user.id,
    description: description.trim(),
    amount,
  }).select().single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/groups')
  return { success: true, expense }
}

export async function getGroupExpenses(group_id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('group_expenses')
    .select('*, users:paid_by(explorer_name, name, email)')
    .eq('group_id', group_id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}
