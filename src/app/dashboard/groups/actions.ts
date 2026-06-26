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

  // 2. Check if member email matches an existing registered user
  const { data: existingUser } = await supabase
    .from('users').select('id').eq('email', emailClean).maybeSingle()

  if (!existingUser?.id) {
    return { 
      success: false, 
      error: 'That adventurer has not awakened their Chronicle yet! Ask them to register an account on Ledger of Lost Kingdoms before inviting them.' 
    }
  }

  // 3. Check if this user UUID is already in the party (e.g. Leader)
  const { data: existingById } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', group_id)
    .eq('user_id', existingUser.id)
    .maybeSingle()

  if (existingById) {
    return { success: false, error: 'This adventurer is already mustered in this expedition!' }
  }

  const { data: member, error } = await supabase.from('group_members').insert({
    group_id,
    user_id: existingUser.id,
    role: role || 'Member',
    member_name: member_name.trim(),
    member_email: emailClean,
  }).select().single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/groups')
  revalidatePath('/dashboard')
  return { success: true, member }
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
