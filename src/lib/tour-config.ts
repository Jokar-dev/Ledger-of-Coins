export type TourStep = {
  id: string
  targetId?: string
  title: string
  description: string | React.ReactNode
  alignment?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: '📜 Welcome to the Ledger of Lost Kingdoms',
    description: 'Track expenses, manage expeditions, settle debts, collect relics, and preserve your adventures.',
    alignment: 'center',
  },
  {
    id: 'dashboard',
    targetId: 'tour-dashboard',
    title: 'DASHBOARD OVERVIEW',
    description: '⚱ Total Gold Spent\n= Total money recorded.\n\n🏛 Active Expeditions\n= Trips and groups you belong to.\n\n📤 Gold Owed\n= Money you owe others.\n\n📥 Gold Collectible\n= Money others owe you.',
    alignment: 'right',
  },
  {
    id: 'expeditions',
    targetId: 'tour-groups',
    title: 'FORGE AN EXPEDITION',
    description: 'Create a new expedition to manage a trip, event, or adventure.\n\nYou can add:\n* Name\n* Destination\n* Party Size\n* Description',
    alignment: 'right',
  },
  {
    id: 'members',
    targetId: 'tour-groups',
    title: 'MUSTER NEW PARTY',
    description: 'Invite travelers and assign roles:\n\n* Leader\n* Treasurer\n* Scout\n* Member',
    alignment: 'right',
  },
  {
    id: 'expenses',
    targetId: 'tour-expenses',
    title: 'TREASURY LEDGER',
    description: 'Record expenses and track spending.\n\nExamples:\n* Food\n* Travel\n* Activities\n* Shopping\n\nExpenses automatically update statistics.',
    alignment: 'right',
  },
  {
    id: 'debts',
    targetId: 'tour-expenses', // Debts are tied to expenses in this app
    title: 'DEBT SCROLLS',
    description: 'The system automatically tracks:\n\nWho owes money\nWho should receive money\n\nSettlements update automatically.',
    alignment: 'right',
  },
  {
    id: 'relics',
    targetId: 'tour-relics',
    title: 'RELIC COLLECTION',
    description: 'Store discoveries from your expeditions.\n\nEach relic contains:\n* Name\n* Description\n* Value\n* Expedition',
    alignment: 'right',
  },
  {
    id: 'oracle',
    targetId: 'tour-oracle',
    title: 'ORACLE CHAMBER',
    description: 'View:\n* Spending analytics\n* Expedition statistics\n* Debt summaries\n* Financial insights',
    alignment: 'right',
  },
  {
    id: 'profile',
    targetId: 'tour-profile',
    title: 'PROFILE PAGE',
    description: 'Update:\n* Profile picture\n* Explorer name\n* Chronicle name\n* Bio\n* Location\n\nYou can also access:\n* Export Ledger\n* Help Guide\n* Logout',
    alignment: 'left',
  },
  {
    id: 'export',
    targetId: 'tour-profile', // We'll highlight the profile dropdown which contains Export Ledger
    title: 'PDF EXPORT',
    description: 'Generate PDF reports containing:\n* Expenses\n* Expeditions\n* Debt Scrolls\n* Relics',
    alignment: 'left',
  },
  {
    id: 'achievements',
    targetId: 'tour-relics', // Achievements are on the Relics page
    title: 'ACHIEVEMENTS',
    description: 'Achievements unlock automatically when:\n* Completing your profile\n* Creating expeditions\n* Recording expenses\n* Collecting relics\n* Generating reports',
    alignment: 'right',
  },
  {
    id: 'final',
    title: '🏺 Your Journey Begins',
    description: 'You now possess the knowledge required to maintain your Chronicle.\n\nMay your expeditions prosper.',
    alignment: 'center',
  }
]
