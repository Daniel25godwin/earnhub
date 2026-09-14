// Suggested location: src/data/tasks.ts
//
// Single source of truth for the demo task list — used by both Dashboard's
// "Recommended for you" and the Earn page's full list, so they stay in
// sync. Swap this for a real API call whenever the backend is ready;
// nothing else needs to change since both pages just read TASKS.

export type CategoryKey =
  | 'VIDEO'
  | 'SURVEY'
  | 'WEBSITE_VISIT'
  | 'SOCIAL'
  | 'APP_TESTING'
  | 'OFFER'
  | 'CUSTOM'

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface AppTask {
  id: string
  title: string
  categoryKey: CategoryKey
  difficulty: Difficulty
  rewardAmount: number // cents
  estimatedMinutes: number
}

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  VIDEO: 'Watch a video',
  SURVEY: 'Survey',
  WEBSITE_VISIT: 'Visit a website',
  SOCIAL: 'Social action',
  APP_TESTING: 'App testing',
  OFFER: 'Offer',
  CUSTOM: 'Task',
}

export const DIFFICULTY_TONE: Record<Difficulty, 'success' | 'warning' | 'danger'> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'danger',
}

// Reward amounts are in kobo (1 naira = 100 kobo).
export const TASKS: AppTask[] = [
  { id: 'ad-1', title: 'Watch 5 ads', categoryKey: 'VIDEO', difficulty: 'EASY', rewardAmount: 40000, estimatedMinutes: 3 },
  { id: 'ad-2', title: 'Watch 8 ads', categoryKey: 'VIDEO', difficulty: 'EASY', rewardAmount: 42500, estimatedMinutes: 4 },
  { id: 'ad-3', title: 'Watch 10 ads', categoryKey: 'VIDEO', difficulty: 'EASY', rewardAmount: 45000, estimatedMinutes: 5 },
  { id: 'ad-4', title: 'Watch 12 ads', categoryKey: 'VIDEO', difficulty: 'MEDIUM', rewardAmount: 47500, estimatedMinutes: 6 },
  { id: 'ad-5', title: 'Watch 15 ads', categoryKey: 'VIDEO', difficulty: 'MEDIUM', rewardAmount: 50000, estimatedMinutes: 7 },
  { id: 'ad-6', title: 'Watch 18 ads', categoryKey: 'VIDEO', difficulty: 'MEDIUM', rewardAmount: 55000, estimatedMinutes: 9 },
  { id: 'ad-7', title: 'Watch 20 ads', categoryKey: 'VIDEO', difficulty: 'MEDIUM', rewardAmount: 60000, estimatedMinutes: 10 },
  { id: 'ad-8', title: 'Watch 25 ads', categoryKey: 'VIDEO', difficulty: 'HARD', rewardAmount: 62500, estimatedMinutes: 12 },
  { id: 'ad-9', title: 'Watch 30 ads', categoryKey: 'VIDEO', difficulty: 'HARD', rewardAmount: 65000, estimatedMinutes: 15 },
  { id: 'ad-10', title: 'Watch 35 ads', categoryKey: 'VIDEO', difficulty: 'HARD', rewardAmount: 70000, estimatedMinutes: 18 },
]
