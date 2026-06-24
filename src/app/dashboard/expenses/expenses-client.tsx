'use client'

import { useState, useEffect } from 'react'
import { addExpense, deleteExpense } from './actions'
import { Trash2 } from 'lucide-react'
import ExportLedgerButton from '@/components/export-ledger-button'

const CATEGORIES = [
  { name: 'Tavern & Inn', value: 'tavern', icon: 'restaurant', emoji: '🍖' },
  { name: 'Potions & Health', value: 'potions', icon: 'science', emoji: '🧪' },
  { name: 'Expeditions', value: 'expeditions', icon: 'explore', emoji: '🗺' },
  { name: 'Relics & Artifacts', value: 'relics', icon: 'diamond', emoji: '💎' },
  { name: 'Entertainment', value: 'entertainment', icon: 'theater_comedy', emoji: '🎭' },
  { name: 'Utilities', value: 'utilities', icon: 'bolt', emoji: '⚡' },
  { name: 'Other', value: 'other', icon: 'category', emoji: '📜' },
]

type SpendingEvent = null | 'wise' | 'spirits' | 'merchant' | 'legendary'

export default function ExpensesClient({
  initialExpenses, currentUserId, exportData
}: {
  initialExpenses: any[], currentUserId: string, exportData?: any
}) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0].value)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [spendingEvent, setSpendingEvent] = useState<SpendingEvent>(null)
  const [shaking, setShaking] = useState(false)

  const triggerEvent = (amt: number) => {
    if (amt >= 1000) {
      setSpendingEvent('legendary')
      setShaking(true)
      setTimeout(() => setShaking(false), 800)
    } else if (amt >= 500) setSpendingEvent('merchant')
    else if (amt >= 250) setSpendingEvent('spirits')
    else if (amt >= 100) setSpendingEvent('wise')
    setTimeout(() => setSpendingEvent(null), 5000)
  }

  const handleSubmit = async () => {
    if (!description || !amount) { setErrorMsg('Please fill in description and amount.'); return }
    setIsSubmitting(true); setErrorMsg('')
    const fd = new FormData()
    fd.append('description', description); fd.append('amount', amount); fd.append('category', category)
    try {
      const result = await addExpense(fd)
      if (result.success && result.expense) {
        setExpenses([result.expense, ...expenses])
        triggerEvent(parseFloat(amount))
        setDescription(''); setAmount('')
      } else setErrorMsg(result.error || 'Failed to add expense.')
    } catch (e: any) { setErrorMsg(e?.message || 'An error occurred.') }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this entry from the ledger?')) return
    const result = await deleteExpense(id)
    if (result.success) setExpenses(expenses.filter(e => e.id !== id))
    else alert(result.error)
  }

  const getCat = (val: string) => CATEGORIES.find(c => c.value === val?.toLowerCase() || c.name.toLowerCase() === val?.toLowerCase()) || CATEGORIES[CATEGORIES.length - 1]

  return (
    <div className={`flex-1 p-6 md:p-8 w-full pb-32 transition-all ${shaking ? 'screen-shake' : ''}`}>

      {/* ─── SPENDING EVENT OVERLAYS ─── */}
      {spendingEvent === 'wise' && (
        <div className="fixed top-20 right-6 z-[80] max-w-xs animate-slide-in-right">
          <div className="bg-surface-container-high border border-primary/50 rounded-xl p-5 shadow-[0_0_30px_rgba(242,202,80,0.2)]">
            <p className="text-[11px] font-label-sm text-primary uppercase tracking-widest mb-1">📜 Ancient Wisdom</p>
            <p className="text-on-surface italic font-body-md text-sm">&ldquo;Wise Traveler, thy spending rivals that of nobles.&rdquo;</p>
          </div>
        </div>
      )}
      {spendingEvent === 'spirits' && (
        <div className="fixed top-20 right-6 z-[80] max-w-xs animate-slide-in-right">
          <div className="bg-surface-container-high border border-tertiary/50 rounded-xl p-5 shadow-[0_0_30px_rgba(163,211,255,0.2)]">
            <p className="text-[11px] font-label-sm text-tertiary uppercase tracking-widest mb-1">👻 Treasury Spirits</p>
            <p className="text-on-surface italic font-body-md text-sm">&ldquo;The Treasury Spirits are observing thy every coin.&rdquo;</p>
          </div>
        </div>
      )}
      {spendingEvent === 'merchant' && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none">
          <div className="bg-surface-container-lowest/90 border border-error/40 rounded-2xl p-8 max-w-sm text-center animate-fade-up shadow-[0_0_60px_rgba(255,180,171,0.2)]">
            <p className="text-[48px] mb-2">👻</p>
            <p className="text-[11px] font-label-sm text-error uppercase tracking-widest mb-2">Ghostly Merchant Appears</p>
            <p className="text-on-surface italic font-body-md">&ldquo;Gold flows from your hands like water through ancient stone.&rdquo;</p>
          </div>
        </div>
      )}
      {spendingEvent === 'legendary' && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSpendingEvent(null)}>
          <div className="relative bg-surface-container-lowest border-2 border-primary rounded-2xl p-10 max-w-md w-full text-center rune-eruption shadow-[0_0_80px_rgba(242,202,80,0.4)]">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary m-3" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary m-3" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary m-3" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary m-3" />
            <p className="text-[56px] mb-2">⚡</p>
            <p className="font-label-sm text-[11px] text-primary uppercase tracking-[0.3em] mb-3">The Ancient Accountant Awakens</p>
            <h2 className="font-display-lg text-[28px] text-primary-fixed gold-glow leading-tight mb-4">
              YOU HAVE AWAKENED<br />THE ANCIENT ACCOUNTANT
            </h2>
            <p className="text-on-surface-variant italic mb-4">&ldquo;A legendary expense of titanic proportions hath been recorded in the eternal scrolls.&rdquo;</p>
            <div className="inline-block bg-primary/20 border border-primary/50 rounded-full px-4 py-1 font-label-sm text-[11px] text-primary uppercase tracking-widest">
              🔥 Reckless Spender Achievement Unlocked
            </div>
            <p className="text-[10px] text-outline mt-4">Click anywhere to dismiss</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-outline-variant pb-4 mb-8">
        <div>
          <h2 className="font-display-lg text-[40px] text-primary-fixed gold-glow">Treasury Ledger</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 tracking-widest uppercase">Record Thy Journey&apos;s Toll</p>
        </div>
        {exportData && <ExportLedgerButton data={exportData} variant="primary" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* New Entry Form */}
        <div className="lg:col-span-1 bg-surface-container-high border border-outline-variant rounded-xl p-6 h-fit relative overflow-hidden">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-container m-2 opacity-50" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary-container m-2 opacity-50" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary-container m-2 opacity-50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-container m-2 opacity-50" />

          <h3 className="font-headline-lg text-[22px] text-primary text-center border-b border-outline-variant/50 pb-3 mb-5">New Entry</h3>

          {errorMsg && <div className="mb-4 p-3 rounded bg-error/20 border border-error/40 text-on-error-container text-sm">{errorMsg}</div>}

          <div className="space-y-4">
            <div>
              <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1.5">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant rounded p-3 text-on-surface focus:outline-none focus:border-primary transition-all text-sm font-body-md"
                placeholder="e.g., Mystic Elixir" type="text" />
            </div>
            <div>
              <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1.5">Amount (Gold)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary-fixed-dim text-[16px]">toll</span>
                <input value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant rounded p-3 pl-9 text-on-surface focus:outline-none focus:border-primary transition-all text-sm font-body-md"
                  placeholder="0.00" type="number" step="0.01" min="0.01" />
              </div>
              {amount && parseFloat(amount) >= 100 && (
                <p className={`text-[10px] mt-1 font-label-sm ${parseFloat(amount) >= 1000 ? 'text-error animate-pulse' : parseFloat(amount) >= 500 ? 'text-error/70' : 'text-primary/70'}`}>
                  {parseFloat(amount) >= 1000 ? '⚠ LEGENDARY spending detected' : parseFloat(amount) >= 500 ? '👻 High spending warning' : parseFloat(amount) >= 250 ? '👁 Treasury Spirits watching...' : '📜 Noble-level spending'}
                </p>
              )}
            </div>
            <div>
              <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1.5">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant rounded p-3 text-on-surface focus:outline-none focus:border-primary transition-all text-sm font-body-md"
                style={{ colorScheme: 'dark' }}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value} style={{ background: '#2a1d15' }}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="w-full mt-4 py-3 rounded bg-primary/10 border border-primary/50 text-primary font-label-sm text-[11px] uppercase tracking-widest hover:bg-primary/20 hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[16px]">{isSubmitting ? 'hourglass_empty' : 'edit_document'}</span>
              {isSubmitting ? 'Recording...' : 'Record Expense'}
            </button>
          </div>
        </div>

        {/* Ledger List */}
        <div className="lg:col-span-2 space-y-3">
          {expenses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-surface-container border border-outline-variant/30 rounded-xl">
              <p className="text-[56px] mb-4">📜</p>
              <h3 className="font-headline-lg text-[22px] text-on-surface-variant mb-2">The Treasury Is Empty</h3>
              <p className="text-on-surface-variant/60 text-sm mb-6">No gold hath been recorded in the ledger.</p>
              <p className="font-label-sm text-[10px] text-outline uppercase tracking-widest">Use the form to record your first expense →</p>
            </div>
          )}
          {expenses.map(expense => {
            const isLegendary = Number(expense.amount) >= 1000
            const cat = getCat(expense.category)
            return (
              <div key={expense.id}
                className={`border rounded-xl p-4 flex items-center justify-between group transition-all ${
                  isLegendary
                    ? 'border-primary bg-surface-container-lowest shadow-[0_0_20px_rgba(242,202,80,0.15)]'
                    : 'border-outline-variant/50 bg-surface-container-low/60 hover:border-primary/20'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border text-[18px] shrink-0 ${isLegendary ? 'border-primary/50 bg-surface shadow-[0_0_8px_rgba(242,202,80,0.2)]' : 'border-outline-variant bg-surface-container'}`}>
                    {cat.emoji}
                  </div>
                  <div>
                    <p className={`font-headline-lg text-[17px] ${isLegendary ? 'text-primary-fixed gold-glow' : 'text-on-surface group-hover:text-primary-fixed transition-colors'}`}>
                      {expense.description}
                    </p>
                    <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">
                      {cat.name} · {new Date(expense.created_at).toLocaleDateString()}
                      {isLegendary && <span className="text-primary ml-2">⚠ Legendary</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-display-lg text-[20px] ${isLegendary ? 'text-primary-fixed gold-glow' : 'text-error'}`}>
                    -{Number(expense.amount).toFixed(2)}G
                  </span>
                  <button onClick={() => handleDelete(expense.id)} className="text-error/40 hover:text-error transition-colors p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
