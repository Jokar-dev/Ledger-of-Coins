'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Map our UI category values to the DB-allowed values
const CATEGORY_MAP: Record<string, string> = {
  tavern: 'Food',
  potions: 'Health',
  expeditions: 'Transport',
  relics: 'Shopping',
  food: 'Food',
  health: 'Health',
  transport: 'Transport',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  utilities: 'Utilities',
  other: 'Other',
}

import { checkExpenseAchievements } from '@/lib/achievement-engine'

export async function addExpense(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const description = formData.get('description') as string
  const amountStr = formData.get('amount') as string
  const categoryRaw = (formData.get('category') as string || 'other').toLowerCase()

  if (!description || !amountStr) {
    return { success: false, error: 'Missing required fields' }
  }

  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Invalid amount' }
  }

  // Map to valid DB category
  const category = CATEGORY_MAP[categoryRaw] || 'Other'

  const { data, error } = await supabase.from('personal_expenses').insert({
    user_id: user.id,
    description,
    amount,
    category,
  }).select().single()

  if (error) {
    return { success: false, error: error.message }
  }

  const newAchievements = await checkExpenseAchievements(user.id)

  revalidatePath('/dashboard/expenses')
  revalidatePath('/dashboard')
  return { success: true, expense: data, newAchievements }
}

export async function deleteExpense(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('personal_expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/expenses')
  return { success: true }
}
