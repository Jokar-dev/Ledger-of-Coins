export type AchievementCategory = 'profile' | 'expeditions' | 'expenses' | 'debts' | 'relics' | 'pdf' | 'special'

export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
}

export const ACHIEVEMENTS: Record<string, AchievementDef> = {
  // PROFILE
  chronicle_awakened: {
    id: 'chronicle_awakened',
    name: 'Chronicle Awakened',
    description: 'Your story has been written into the archives.',
    icon: '🏺',
    category: 'profile',
  },
  // EXPEDITIONS
  expedition_founder: {
    id: 'expedition_founder',
    name: 'Expedition Founder',
    description: 'Created your first expedition.',
    icon: '⚔️',
    category: 'expeditions',
  },
  realm_explorer: {
    id: 'realm_explorer',
    name: 'Realm Explorer',
    description: 'Created 5 expeditions.',
    icon: '🗺️',
    category: 'expeditions',
  },
  kingdom_builder: {
    id: 'kingdom_builder',
    name: 'Kingdom Builder',
    description: 'Created 10 expeditions.',
    icon: '👑',
    category: 'expeditions',
  },
  // EXPENSES
  first_coin_spent: {
    id: 'first_coin_spent',
    name: 'First Coin Spent',
    description: 'Recorded your first expense.',
    icon: '💰',
    category: 'expenses',
  },
  wealth_tracker: {
    id: 'wealth_tracker',
    name: 'Wealth Tracker',
    description: 'Tracked 25 expenses.',
    icon: '💎',
    category: 'expenses',
  },
  master_treasurer: {
    id: 'master_treasurer',
    name: 'Master Treasurer',
    description: 'Tracked 100 expenses.',
    icon: '🏛️',
    category: 'expenses',
  },
  // DEBTS
  debt_creator: {
    id: 'debt_creator',
    name: 'Debt Creator',
    description: 'Generated your first Debt Scroll.',
    icon: '📜',
    category: 'debts',
  },
  balance_keeper: {
    id: 'balance_keeper',
    name: 'Balance Keeper',
    description: 'Settled your first Debt Scroll.',
    icon: '⚖️',
    category: 'debts',
  },
  lord_of_accounts: {
    id: 'lord_of_accounts',
    name: 'Lord of Accounts',
    description: 'Settled 25 Debt Scrolls.',
    icon: '👑',
    category: 'debts',
  },
  // RELICS
  relic_hunter: {
    id: 'relic_hunter',
    name: 'Relic Hunter',
    description: 'Added your first relic.',
    icon: '🏺',
    category: 'relics',
  },
  curator_of_wonders: {
    id: 'curator_of_wonders',
    name: 'Curator of Wonders',
    description: 'Collected 10 relics.',
    icon: '🔮',
    category: 'relics',
  },
  // PDF
  archivist: {
    id: 'archivist',
    name: 'Archivist',
    description: 'Generated your first PDF report.',
    icon: '📚',
    category: 'pdf',
  },
  master_archivist: {
    id: 'master_archivist',
    name: 'Master Archivist',
    description: 'Generated 10 reports.',
    icon: '📖',
    category: 'pdf',
  },
  // SPECIAL
  reckless_spender: {
    id: 'reckless_spender',
    name: 'Reckless Spender',
    description: 'Recorded an expense greater than 1000 Gold.',
    icon: '🔥',
    category: 'special',
  },
  gold_flood: {
    id: 'gold_flood',
    name: 'Gold Flood',
    description: 'Spent more than 5000 Gold total.',
    icon: '💸',
    category: 'special',
  },
  living_legend: {
    id: 'living_legend',
    name: 'Living Legend',
    description: 'Unlocked every other achievement.',
    icon: '🌟',
    category: 'special',
  },
}

export const ACHIEVEMENT_LIST = Object.values(ACHIEVEMENTS)
