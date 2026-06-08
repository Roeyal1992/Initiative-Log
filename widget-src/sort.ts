// Deterministic ordering for campaigns, initiatives, and tasks. No widget-API access.
// Order: stored sortOrder, then createdAt, then title. See 03_BUILD.md §6.10, §14.

import { INITIATIVE_STATUSES, PRIORITIES } from './constants'
import { Campaign, Initiative, InitiativeStatus, Priority, Task } from './types'

// Map legacy (High/Medium/Low) or unknown priority values onto the current P0–P3 scale.
export function normalizePriority(raw: string): Priority {
  switch (raw) {
    case 'P0':
    case 'P1':
    case 'P2':
    case 'P3':
      return raw
    case 'High':
      return 'P1'
    case 'Medium':
      return 'P2'
    case 'Low':
      return 'P3'
    default:
      return 'P2'
  }
}

// Ordering index for priority (P0 = 0 … P3 = 3); lower = more urgent.
export function priorityIndex(p: string): number {
  return PRIORITIES.indexOf(normalizePriority(p))
}

// Ordering index following the controlled initiative-status order.
export function statusIndex(s: InitiativeStatus): number {
  const i = INITIATIVE_STATUSES.indexOf(s)
  return i === -1 ? INITIATIVE_STATUSES.length : i
}

function compareOrder(
  aSort: number,
  bSort: number,
  aCreated: string,
  bCreated: string,
  aTitle: string,
  bTitle: string,
): number {
  if (aSort !== bSort) return aSort - bSort
  if (aCreated !== bCreated) return aCreated < bCreated ? -1 : 1
  return aTitle.localeCompare(bTitle)
}

export function sortCampaigns(campaigns: Campaign[]): Campaign[] {
  return campaigns
    .slice()
    .sort((a, b) =>
      compareOrder(a.sortOrder, b.sortOrder, a.createdAt, b.createdAt, a.title, b.title),
    )
}

export function sortInitiatives(initiatives: Initiative[]): Initiative[] {
  return initiatives
    .slice()
    .sort((a, b) =>
      compareOrder(a.sortOrder, b.sortOrder, a.createdAt, b.createdAt, a.title, b.title),
    )
}

export function sortTasks(tasks: Task[]): Task[] {
  return tasks
    .slice()
    .sort((a, b) =>
      compareOrder(a.sortOrder, b.sortOrder, a.createdAt, b.createdAt, a.title, b.title),
    )
}

// Next sortOrder value for a new record appended to an existing list.
export function nextSortOrder(existing: { sortOrder: number }[]): number {
  if (existing.length === 0) return 0
  return Math.max(...existing.map((r) => r.sortOrder)) + 1
}
