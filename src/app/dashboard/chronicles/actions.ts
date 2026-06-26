'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ChronicleEntry {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  created_at: string
}

export async function createChronicle(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const category = (formData.get('category') as string) || 'Adventure'

  if (!title?.trim() || !content?.trim()) {
    return { success: false, error: 'Title and chronicle content are required' }
  }

  const { data: chronicle, error } = await supabase
    .from('chronicles')
    .insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/chronicles')
  revalidatePath('/dashboard')
  return { success: true, chronicle }
}

export async function getChronicles(): Promise<ChronicleEntry[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('chronicles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}

export async function deleteChronicle(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('chronicles')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/chronicles')
  revalidatePath('/dashboard')
  return { success: true }
}
