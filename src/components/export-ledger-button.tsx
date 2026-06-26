'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import { createClient } from '@/lib/supabase/client'
import { formatShortDate, formatExpenseTime, formatExpenseDate } from '@/lib/timestamp-utils'

interface ExportProps {
  explorerName: string
  chronicleName: string
  totalGold: number
  activeExpeditions: number
  goldOwed: number
  goldCollectible: number
  recentExpenses: any[]
  recentExpeditions: any[]
}

export default function ExportLedgerButton({
  data, variant = 'primary'
}: { data?: ExportProps, variant?: 'primary' | 'secondary' | 'dropdown' }) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      let exportData = data

      if (!exportData) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
        const { data: expenses } = await supabase.from('personal_expenses').select('*').order('created_at', { ascending: false })
        const totalGold = expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0
        const { data: recentExpeditions } = await supabase.from('shared_groups').select('*').eq('created_by', user.id).order('created_at', { ascending: false }).limit(5)
        const { data: allExp } = await supabase.from('shared_groups').select('id').eq('created_by', user.id)
        
        const { data: owedByMe } = await supabase.from('debt_scrolls').select('amount').eq('owed_by', user.id).eq('settled', false)
        const goldOwed = owedByMe?.reduce((s, d) => s + Number(d.amount), 0) || 0

        const { data: owedToMe } = await supabase.from('debt_scrolls').select('amount').eq('owed_to', user.id).eq('settled', false)
        const goldCollectible = owedToMe?.reduce((s, d) => s + Number(d.amount), 0) || 0

        exportData = {
          explorerName: profile?.explorer_name || profile?.name || user.email?.split('@')[0] || 'Wanderer',
          chronicleName: profile?.chronicle_name || 'The Grand Ledger',
          totalGold,
          activeExpeditions: allExp?.length || 0,
          goldOwed,
          goldCollectible,
          recentExpenses: (expenses || []).slice(0, 15),
          recentExpeditions: recentExpeditions || []
        }
      }

      const doc = new jsPDF()
      
      // Theme colors
      const gold = '#d4af37'
      const dark = '#1d1009'
      const textCol = '#413129'

      // Background - Parchment style
      doc.setFillColor(247, 221, 208) // #f7ddd0
      doc.rect(0, 0, 210, 297, 'F')

      // Border
      doc.setDrawColor(212, 175, 55)
      doc.setLineWidth(1)
      doc.rect(10, 10, 190, 277)
      doc.rect(12, 12, 186, 273)

      // Header
      doc.setFont('times', 'bold')
      doc.setTextColor(dark)
      doc.setFontSize(28)
      doc.text('The Grand Ledger', 105, 30, { align: 'center' })
      
      doc.setFont('times', 'italic')
      doc.setFontSize(14)
      doc.setTextColor(textCol)
      doc.text(`Chronicle of ${exportData.explorerName}`, 105, 40, { align: 'center' })
      doc.text(`"${exportData.chronicleName}"`, 105, 47, { align: 'center' })

      doc.setFontSize(10)
      doc.text(`Decreed on this day: ${new Date().toLocaleDateString()}`, 105, 55, { align: 'center' })

      // Separator
      doc.setDrawColor(212, 175, 55)
      doc.line(40, 60, 170, 60)

      // Summary Section
      doc.setFont('times', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(dark)
      doc.text('Treasury Summary', 20, 75)

      doc.setFont('times', 'normal')
      doc.setFontSize(12)
      doc.text(`Total Gold Spent: ${exportData.totalGold.toFixed(0)} G`, 20, 85)
      doc.text(`Active Expeditions: ${exportData.activeExpeditions}`, 20, 93)
      doc.text(`Outstanding Debts Owed: ${exportData.goldOwed.toFixed(0)} G`, 20, 101)
      doc.text(`Debts Collectible: ${exportData.goldCollectible.toFixed(0)} G`, 20, 109)

      // Recent Expenses
      doc.setFont('times', 'bold')
      doc.setFontSize(16)
      doc.text('Recent Expenses Ledger', 20, 125)

      let yPos = 135
      doc.setFontSize(10)
      doc.setFont('times', 'bold')
      doc.text('Expense', 20, yPos)
      doc.text('Category', 65, yPos)
      doc.text('Amount', 105, yPos)
      doc.text('Paid By', 130, yPos)
      doc.text('Date', 160, yPos)
      doc.text('Time', 182, yPos)

      yPos += 3
      doc.setDrawColor(212, 175, 55)
      doc.line(20, yPos, 190, yPos)
      yPos += 6

      doc.setFont('times', 'normal')
      if (exportData.recentExpenses.length === 0) {
        doc.setFont('times', 'italic')
        doc.text('No expenses recorded.', 20, yPos)
        yPos += 10
      } else {
        exportData.recentExpenses.forEach(exp => {
          if (yPos > 235) {
            doc.addPage()
            doc.setFillColor(247, 221, 208)
            doc.rect(0, 0, 210, 297, 'F')
            doc.setDrawColor(212, 175, 55)
            doc.rect(10, 10, 190, 277)
            doc.rect(12, 12, 186, 273)
            yPos = 30
          }
          const desc = exp.description.length > 18 ? exp.description.slice(0, 16) + '...' : exp.description
          const cat = (exp.category || 'Other').length > 12 ? (exp.category || 'Other').slice(0, 10) + '..' : (exp.category || 'Other')
          const amt = `${Number(exp.amount).toFixed(0)} G`
          const paidBy = (exp.users?.explorer_name || exportData.explorerName || 'You').slice(0, 10)
          const shortDate = formatShortDate(exp.created_at)
          const timeStr = formatExpenseTime(exp.created_at)

          doc.text(desc, 20, yPos)
          doc.text(cat, 65, yPos)
          doc.setTextColor(147, 0, 10)
          doc.text(amt, 105, yPos)
          doc.setTextColor(dark)
          doc.text(paidBy, 130, yPos)
          doc.text(shortDate, 160, yPos)
          doc.text(timeStr, 182, yPos)

          yPos += 8
        })
      }

      // Active Expeditions
      yPos += 8
      if (yPos > 240) {
        doc.addPage()
        doc.setFillColor(247, 221, 208)
        doc.rect(0, 0, 210, 297, 'F')
        doc.setDrawColor(212, 175, 55)
        doc.rect(10, 10, 190, 277)
        doc.rect(12, 12, 186, 273)
        yPos = 30
      }
      doc.setFont('times', 'bold')
      doc.setFontSize(16)
      doc.text('Active Expeditions', 20, yPos)
      yPos += 8

      doc.setFontSize(10)
      if (exportData.recentExpeditions.length === 0) {
        doc.setFont('times', 'italic')
        doc.text('No expeditions forged.', 20, yPos)
      } else {
        exportData.recentExpeditions.forEach(exp => {
          if (yPos > 250) {
            doc.addPage()
            doc.setFillColor(247, 221, 208)
            doc.rect(0, 0, 210, 297, 'F')
            doc.setDrawColor(212, 175, 55)
            doc.rect(10, 10, 190, 277)
            doc.rect(12, 12, 186, 273)
            yPos = 30
          }
          doc.setFont('times', 'bold')
          doc.text(`${exp.group_name}`, 20, yPos)
          doc.setFont('times', 'normal')
          doc.text(`Destination: ${exp.destination || 'Unknown'} | Party Limit: ${exp.party_size || 6}`, 20, yPos + 5)
          yPos += 12
        })
      }

      // Footer
      const footerY = 268
      doc.setFont('times', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(textCol)
      doc.text('Generated By: Ledger of Coins', 105, footerY, { align: 'center' })
      doc.text(`Generated On: ${formatExpenseDate(new Date())}`, 105, footerY + 5, { align: 'center' })
      doc.text(`Generated At: ${formatExpenseTime(new Date())}`, 105, footerY + 10, { align: 'center' })

      doc.save(`Ledger_${exportData.explorerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)

      // Trigger PDF tracking
      const { logPdfGeneration } = await import('@/app/actions/achievements')
      const result = await logPdfGeneration()
      if (result?.newAchievements?.length) {
        // We will dispatch a custom DOM event so the AchievementProvider can pick it up
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('achievementsUnlocked', { 
            detail: result.newAchievements 
          }))
        }
      }
    } catch (error) {
      console.error('Error generating PDF', error)
      alert('Failed to scribe the ledger. The magic faltered.')
    } finally {
      setIsExporting(false)
    }
  }

  if (variant === 'dropdown') {
    return (
      <button onClick={handleExport} disabled={isExporting} className="w-full text-left px-4 py-3 hover:bg-surface-container flex items-center gap-3 transition-colors border-b border-outline-variant/30 text-on-surface">
        <span className="material-symbols-outlined text-[18px] text-secondary">download</span>
        {isExporting ? 'Scribing...' : 'Export Ledger'}
      </button>
    )
  }

  const btnClass = variant === 'primary' 
    ? "bg-primary/10 border border-primary/50 text-primary px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary/20 hover:shadow-glow transition-all"
    : "border border-secondary/50 text-secondary px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-secondary/10 transition-all"

  return (
    <button onClick={handleExport} disabled={isExporting} className={btnClass}>
      <span className="material-symbols-outlined text-[15px]">{isExporting ? 'hourglass_empty' : 'download'}</span> 
      {isExporting ? 'Scribing...' : 'Export Ledger'}
    </button>
  )
}
