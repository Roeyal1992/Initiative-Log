// Derives the render-ready view model from raw records + UI state.
// The UI renders from this, never from raw maps. Supports group-by lenses,
// sort-by, and task-hour estimate rollups. See 03_BUILD.md §6.8, §10.

import { INITIATIVE_STATUSES, PRIORITIES, UNASSIGNED_ID } from './constants'
import { notesPreview } from './formatters'
import {
  effectiveCampaignId,
  hasActiveNarrowing,
  initiativeMatchesSearch,
  initiativePassesFilters,
  normalize,
  taskMatchesSearch,
  taskPassesFilters,
} from './searchFilter'
import { normalizePriority, priorityIndex, sortCampaigns, sortTasks, statusIndex } from './sort'
import {
  Campaign,
  CampaignSectionVM,
  Diagnostic,
  FilterOptions,
  FilterState,
  GroupBy,
  Initiative,
  InitiativeCardVM,
  InitiativeStatus,
  InitiativeTableRowVM,
  Priority,
  SectionKind,
  SortDir,
  SortKey,
  Task,
  TaskProgress,
  TaskTableRowVM,
  TaskVM,
  ViewModel,
} from './types'

const NO_OWNER_KEY = '__noowner__'
const ALL_KEY = '__all__'
const MAX_DIAGNOSTICS = 25

export interface ViewModelInput {
  campaigns: Campaign[]
  initiatives: Initiative[]
  tasks: Task[]
  filters: FilterState
  searchQuery: string
  expandedIds: string[]
  groupBy: GroupBy
  sortKey: SortKey
  sortDir: SortDir
  // Localized labels needed for section titles.
  unassignedTitle: string
  priorityLabels: Record<Priority, string>
  statusLabels: Record<InitiativeStatus, string>
  noOwnerLabel: string
}

export function buildViewModel(input: ViewModelInput): ViewModel {
  const { campaigns, initiatives, tasks, filters, expandedIds } = input
  const { groupBy, sortKey, sortDir, unassignedTitle, priorityLabels, statusLabels, noOwnerLabel } = input
  const query = normalize(input.searchQuery)
  const narrowing = hasActiveNarrowing(filters, query)
  const showArchived = filters.showArchived
  const expanded = new Set(expandedIds)
  const diagnostics: Diagnostic[] = []

  const pushDiagnostic = (d: Diagnostic) => {
    if (diagnostics.length < MAX_DIAGNOSTICS) diagnostics.push(d)
  }

  // --- Indexes ---
  const campaignById = new Map<string, Campaign>()
  campaigns.forEach((c) => campaignById.set(c.id, c))
  const campaignExists = (id: string) => campaignById.has(id)

  const initiativeById = new Map<string, Initiative>()
  initiatives.forEach((i) => initiativeById.set(i.id, i))

  const tasksByInitiative = new Map<string, Task[]>()
  tasks.forEach((t) => {
    if (!initiativeById.has(t.initiativeId)) {
      pushDiagnostic({
        level: 'warning',
        message: `Task "${t.title}" references a missing initiative and is hidden.`,
        recordId: t.id,
      })
      return
    }
    const list = tasksByInitiative.get(t.initiativeId)
    if (list) list.push(t)
    else tasksByInitiative.set(t.initiativeId, [t])
  })

  const activeTasksFor = (initiativeId: string): Task[] =>
    tasksByInitiative.get(initiativeId) ?? []

  const progressFor = (initiativeId: string): TaskProgress => {
    const active = activeTasksFor(initiativeId)
    const done = active.filter((t) => t.status === 'Done').length
    return { done, total: active.length }
  }

  // Estimate rollup: sum of non-archived task hours for the initiative.
  const estimateFor = (initiativeId: string): number =>
    activeTasksFor(initiativeId).reduce((sum, t) => sum + (t.estimateHours || 0), 0)

  const visibleTasksFor = (initiativeId: string): TaskVM[] => {
    const list = tasksByInitiative.get(initiativeId) ?? []
    return sortTasks(list).map((task) => ({ task }))
  }

  // Effective (resolved) campaign per initiative, with diagnostics for broken refs.
  const effCampaign = new Map<string, string>()
  initiatives.forEach((i) => {
    if (i.campaignId && !campaignExists(i.campaignId)) {
      pushDiagnostic({
        level: 'warning',
        message: `Initiative "${i.title}" references a missing campaign; shown under Unassigned.`,
        recordId: i.id,
      })
    }
    effCampaign.set(i.id, effectiveCampaignId(i, campaignExists))
  })

  const campaignTitleFor = (initiativeId: string): string => {
    const eff = effCampaign.get(initiativeId) ?? UNASSIGNED_ID
    if (eff === UNASSIGNED_ID) return unassignedTitle
    return campaignById.get(eff)?.title ?? unassignedTitle
  }

  // --- Sorting ---
  const dirMul = sortDir === 'asc' ? 1 : -1
  const dueKey = (i: Initiative) => (i.dueDate && i.dueDate.trim() ? i.dueDate.trim() : '9999-99-99')
  const primaryCmp = (a: Initiative, b: Initiative): number => {
    switch (sortKey) {
      case 'priority':
        return priorityIndex(a.priority) - priorityIndex(b.priority)
      case 'estimate':
        return estimateFor(a.id) - estimateFor(b.id)
      case 'dueDate':
        return dueKey(a) < dueKey(b) ? -1 : dueKey(a) > dueKey(b) ? 1 : 0
      case 'status':
        return statusIndex(a.status) - statusIndex(b.status)
      case 'title':
        return a.title.localeCompare(b.title)
      case 'manual':
      default:
        return a.sortOrder - b.sortOrder
    }
  }
  const tiebreak = (a: Initiative, b: Initiative): number => {
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1
    return a.title.localeCompare(b.title)
  }
  const compareInitiatives = (a: Initiative, b: Initiative): number => {
    const p = primaryCmp(a, b)
    return p !== 0 ? dirMul * p : tiebreak(a, b)
  }
  const sortBy = (list: Initiative[]): Initiative[] => list.slice().sort(compareInitiatives)

  // --- Counts independent of search/filters (drive "isEmpty") ---
  const archivedHiddenCount = showArchived ? 0 : initiatives.filter((i) => i.archived).length
  const totalActiveInitiatives = initiatives.filter((i) => showArchived || !i.archived).length

  // --- Visible initiatives (archive + filters + search) ---
  const visibleInitiatives = initiatives.filter((i) => {
    if (!showArchived && i.archived) return false
    const eff = effCampaign.get(i.id) ?? UNASSIGNED_ID
    if (!initiativePassesFilters(i, eff, filters)) return false
    return initiativeMatchesSearch(i, campaignTitleFor(i.id), visibleTasksRaw(i.id), query)
  })

  function visibleTasksRaw(initiativeId: string): Task[] {
    return tasksByInitiative.get(initiativeId) ?? []
  }

  // --- Grouping (lens) ---
  const groupKeyOf = (i: Initiative): string => {
    switch (groupBy) {
      case 'priority':
        return normalizePriority(i.priority)
      case 'status':
        return i.status
      case 'owner':
        return i.owner.trim() || NO_OWNER_KEY
      case 'none':
        return ALL_KEY
      case 'campaign':
      default:
        return effCampaign.get(i.id) ?? UNASSIGNED_ID
    }
  }

  const byGroup = new Map<string, Initiative[]>()
  visibleInitiatives.forEach((i) => {
    const k = groupKeyOf(i)
    const list = byGroup.get(k)
    if (list) list.push(i)
    else byGroup.set(k, [i])
  })

  interface SectionDef {
    id: string
    title: string
    kind: SectionKind
  }
  const sectionDefs: SectionDef[] = (() => {
    if (groupBy === 'campaign') {
      return [
        { id: UNASSIGNED_ID, title: unassignedTitle, kind: 'unassigned' as SectionKind },
        ...sortCampaigns(campaigns).map((c) => ({ id: c.id, title: c.title, kind: 'campaign' as SectionKind })),
      ]
    }
    if (groupBy === 'none') {
      return [{ id: ALL_KEY, title: '', kind: 'flat' as SectionKind }]
    }
    const keys = new Set(visibleInitiatives.map(groupKeyOf))
    if (groupBy === 'priority') {
      return PRIORITIES.filter((p) => keys.has(p)).map((p) => ({ id: p, title: priorityLabels[p], kind: 'group' as SectionKind }))
    }
    if (groupBy === 'status') {
      return INITIATIVE_STATUSES.filter((s) => keys.has(s)).map((s) => ({ id: s, title: statusLabels[s], kind: 'group' as SectionKind }))
    }
    // owner
    const owners = Array.from(keys).filter((k) => k !== NO_OWNER_KEY).sort((a, b) => a.localeCompare(b))
    const defs: SectionDef[] = owners.map((o) => ({ id: o, title: o, kind: 'group' }))
    if (keys.has(NO_OWNER_KEY)) defs.push({ id: NO_OWNER_KEY, title: noOwnerLabel, kind: 'group' })
    return defs
  })()

  const sections: CampaignSectionVM[] = []
  for (const def of sectionDefs) {
    const list = sortBy(byGroup.get(def.id) ?? [])
    const isEmpty = list.length === 0
    // Campaign grouping shows empty campaigns (unless narrowing); other lenses are data-driven.
    if (isEmpty && (groupBy !== 'campaign' || narrowing)) continue
    const cards: InitiativeCardVM[] = list.map((initiative) => ({
      initiative,
      campaignTitle: campaignTitleFor(initiative.id),
      progress: progressFor(initiative.id),
      estimateHours: estimateFor(initiative.id),
      tasks: visibleTasksFor(initiative.id),
      expanded: expanded.has(initiative.id),
    }))
    sections.push({
      id: def.id,
      title: def.title,
      kind: def.kind,
      isUnassigned: def.kind === 'unassigned',
      cards,
      initiativeCount: cards.length,
      totalHours: cards.reduce((s, c) => s + c.estimateHours, 0),
      isEmpty,
    })
  }

  // --- Initiative table rows (flat, sorted by the active sort key) ---
  const sortedVisible = sortBy(visibleInitiatives)
  const initPos = new Map<string, number>()
  sortedVisible.forEach((i, idx) => initPos.set(i.id, idx))
  const initiativeRows: InitiativeTableRowVM[] = sortedVisible.map((initiative) => ({
    initiative,
    campaignTitle: campaignTitleFor(initiative.id),
    progress: progressFor(initiative.id),
    estimateHours: estimateFor(initiative.id),
  }))

  // --- Task table rows ---
  const taskRows: TaskTableRowVM[] = []
  tasks.forEach((task) => {
    const parent = initiativeById.get(task.initiativeId)
    if (!parent) return
    if (!showArchived && parent.archived) return
    const eff = effCampaign.get(parent.id) ?? UNASSIGNED_ID
    if (!taskPassesFilters(task, parent, eff, filters)) return
    const campaignTitle = campaignTitleFor(parent.id)
    if (!taskMatchesSearch(task, parent, campaignTitle, query)) return
    taskRows.push({
      task,
      initiativeTitle: parent.title,
      campaignTitle,
      initiativeStatus: parent.status,
      initiativeDueDate: parent.dueDate,
      notesPreview: notesPreview(task.notes),
    })
  })
  taskRows.sort((a, b) => {
    const ap = initPos.get(a.task.initiativeId) ?? Number.MAX_SAFE_INTEGER
    const bp = initPos.get(b.task.initiativeId) ?? Number.MAX_SAFE_INTEGER
    if (ap !== bp) return ap - bp
    if (a.task.sortOrder !== b.task.sortOrder) return a.task.sortOrder - b.task.sortOrder
    return a.task.title.localeCompare(b.task.title)
  })

  // --- Filter options ---
  const ownerSet = new Set<string>()
  initiatives.forEach((i) => {
    if (i.owner.trim()) ownerSet.add(i.owner.trim())
  })
  const assigneeSet = new Set<string>()
  tasks.forEach((t) => {
    if (t.assignee.trim()) assigneeSet.add(t.assignee.trim())
  })
  const filterOptions: FilterOptions = {
    campaigns: [
      { id: UNASSIGNED_ID, title: unassignedTitle },
      ...sortCampaigns(campaigns).map((c) => ({ id: c.id, title: c.title })),
    ],
    owners: Array.from(ownerSet).sort((a, b) => a.localeCompare(b)),
    assignees: Array.from(assigneeSet).sort((a, b) => a.localeCompare(b)),
  }

  const visibleInitiativeCount = visibleInitiatives.length
  const visibleTaskCount = taskRows.length
  const isEmpty = totalActiveInitiatives === 0
  const noResults = !isEmpty && narrowing && visibleInitiativeCount === 0 && visibleTaskCount === 0

  return {
    sections,
    initiativeRows,
    taskRows,
    filterOptions,
    visibleInitiativeCount,
    visibleTaskCount,
    archivedHiddenCount,
    isEmpty,
    noResults,
    diagnostics,
  }
}
