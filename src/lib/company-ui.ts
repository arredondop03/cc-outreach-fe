import type { Company } from '@/lib/types'

export const label = (text: string) => text.replaceAll('_', ' ')
export const pillClasses = 'whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium'
export const badge: Record<Company['status'], string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  ready_for_sequence: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  archived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
}
