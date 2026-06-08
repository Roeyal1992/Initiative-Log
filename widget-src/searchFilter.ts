// Case-insensitive search and AND-combined filters. Pure; consumed by viewModel.
// See 03_BUILD.md §6.9, §13.

import { UNASSIGNED_ID } from './constants'
import { FilterState, Initiative, Task } from './types'

// --- Normalization (03_BUILD.md §13.1) ---

export function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ')
}

function haystack(parts: (string | null | undefined)[]): string {
  return normalize(parts.filter((p): p is string => !!p).join(' '))
}

// --- Search (03_BUILD.md §13.2) ---

// Initiative matches if its own fields, its campaign title, or any of its tasks match.
export function initiativeMatchesSearch(
  initiative: Initiative,
  campaignTitle: string,
  initiativeTasks: Task[],
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) return true
  const own = haystack([
    initiative.title,
    initiative.owner,
    initiative.status,
    initiative.priority,
    initiative.description,
    initiative.notes,
    campaignTitle,
  ])
  if (own.includes(normalizedQuery)) return true
  return initiativeTasks.some((t) => taskFieldsMatch(t, normalizedQuery))
}

function taskFieldsMatch(task: Task, normalizedQuery: string): boolean {
  return haystack([task.title, task.assignee, task.status, task.notes]).includes(normalizedQuery)
}

// Task matches if its own fields, parent initiative fields, or campaign title match.
export function taskMatchesSearch(
  task: Task,
  parent: Initiative,
  campaignTitle: string,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) return true
  if (taskFieldsMatch(task, normalizedQuery)) return true
  return haystack([
    parent.title,
    parent.owner,
    parent.status,
    parent.priority,
    parent.description,
    parent.notes,
    campaignTitle,
  ]).includes(normalizedQuery)
}

// --- Filters (03_BUILD.md §13.6, AND logic) ---

export function initiativePassesFilters(
  initiative: Initiative,
  effectiveCampaignId: string,
  filters: FilterState,
): boolean {
  if (filters.campaignId !== 'all' && effectiveCampaignId !== filters.campaignId) return false
  if (filters.initiativeStatus !== 'all' && initiative.status !== filters.initiativeStatus) {
    return false
  }
  if (filters.priority !== 'all' && initiative.priority !== filters.priority) return false
  if (filters.owner !== 'all' && initiative.owner !== filters.owner) return false
  return true
}

export function taskPassesFilters(
  task: Task,
  parent: Initiative,
  parentEffectiveCampaignId: string,
  filters: FilterState,
): boolean {
  // Initiative-level filters apply to the task's parent.
  if (filters.campaignId !== 'all' && parentEffectiveCampaignId !== filters.campaignId) return false
  if (filters.initiativeStatus !== 'all' && parent.status !== filters.initiativeStatus) return false
  if (filters.priority !== 'all' && parent.priority !== filters.priority) return false
  if (filters.owner !== 'all' && parent.owner !== filters.owner) return false
  // Task-level filters.
  if (filters.taskStatus !== 'all' && task.status !== filters.taskStatus) return false
  if (filters.assignee !== 'all' && task.assignee !== filters.assignee) return false
  return true
}

// True when any filter (other than archive visibility) is narrowing results.
export function hasActiveNarrowing(filters: FilterState, normalizedQuery: string): boolean {
  return (
    normalizedQuery !== '' ||
    filters.campaignId !== 'all' ||
    filters.initiativeStatus !== 'all' ||
    filters.taskStatus !== 'all' ||
    filters.owner !== 'all' ||
    filters.assignee !== 'all' ||
    filters.priority !== 'all'
  )
}

// Effective campaign for grouping/filtering: null or unresolved references fall back to Unassigned.
export function effectiveCampaignId(
  initiative: Initiative,
  campaignExists: (id: string) => boolean,
): string {
  if (initiative.campaignId && campaignExists(initiative.campaignId)) {
    return initiative.campaignId
  }
  return UNASSIGNED_ID
}
