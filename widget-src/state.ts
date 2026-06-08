// Figma Widget API state access: synced maps for records, synced state for shared UI.
// Isolates widget-API state details from business logic. See 03_BUILD.md §6.5, §9.

import {
  DEFAULT_FILTER_STATE,
  DEFAULT_GROUP_BY,
  DEFAULT_SORT_DIR,
  DEFAULT_SORT_KEY,
  DEFAULT_TABLE_MODE,
  DEFAULT_VIEW_MODE,
} from './defaults'
import { SCHEMA_VERSION, STORAGE_KEYS } from './constants'
import { Lang } from './i18n'
import {
  Campaign,
  FilterState,
  GroupBy,
  Initiative,
  SortDir,
  SortKey,
  TableMode,
  Task,
  ViewMode,
} from './types'

// --- ID generation (03_BUILD.md §7.1) ---

type IdPrefix = 'camp' | 'init' | 'task'

export function genId(prefix: IdPrefix): string {
  const time = Date.now().toString(36)
  const rand = Math.floor(Math.random() * 1e9).toString(36)
  return `${prefix}_${time}_${rand}`
}

export function nowIso(): string {
  return new Date().toISOString()
}

// NOTE: lock / language / open-editors are SHARED synced state, not per-user.
// A Figma widget renders to a shared scene-graph node and `figma.currentUser` is
// forbidden during render, so per-viewer rendering is not possible. All collaborators
// see the same lock and language. Default is locked + Hebrew.

// --- Bundled state handle returned to the widget component ---

export interface InitiativeLogState {
  campaigns: SyncedMap<Campaign>
  initiatives: SyncedMap<Initiative>
  tasks: SyncedMap<Task>

  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  tableMode: TableMode
  setTableMode: (v: TableMode) => void
  searchQuery: string
  setSearchQuery: (v: string) => void
  filters: FilterState
  setFilters: (v: FilterState) => void
  expandedIds: string[]
  setExpandedIds: (v: string[]) => void
  schemaVersion: number
  setSchemaVersion: (v: number) => void
  seeded: boolean
  setSeeded: (v: boolean) => void
  errors: Record<string, string>
  setErrors: (v: Record<string, string>) => void

  // Per-user (current viewer)
  locked: boolean
  setLocked: (v: boolean) => void
  lang: Lang
  setLang: (v: Lang) => void
  editingIds: string[]
  setEditingIds: (v: string[]) => void
  openPicker: string | null
  setOpenPicker: (v: string | null) => void
  groupBy: GroupBy
  setGroupBy: (v: GroupBy) => void
  sortKey: SortKey
  setSortKey: (v: SortKey) => void
  sortDir: SortDir
  setSortDir: (v: SortDir) => void
}

// Must be called once at the top of the widget component (widget hook rules).
export function useInitiativeLogState(): InitiativeLogState {
  const { useSyncedState, useSyncedMap } = figma.widget

  const campaigns = useSyncedMap<Campaign>(STORAGE_KEYS.campaigns)
  const initiatives = useSyncedMap<Initiative>(STORAGE_KEYS.initiatives)
  const tasks = useSyncedMap<Task>(STORAGE_KEYS.tasks)

  const [viewMode, setViewMode] = useSyncedState<ViewMode>(
    STORAGE_KEYS.viewMode,
    DEFAULT_VIEW_MODE,
  )
  const [tableMode, setTableMode] = useSyncedState<TableMode>(
    STORAGE_KEYS.tableMode,
    DEFAULT_TABLE_MODE,
  )
  const [searchQuery, setSearchQuery] = useSyncedState<string>(STORAGE_KEYS.searchQuery, '')
  const [filters, setFilters] = useSyncedState<FilterState>(
    STORAGE_KEYS.filters,
    DEFAULT_FILTER_STATE,
  )
  const [expandedIds, setExpandedIds] = useSyncedState<string[]>(STORAGE_KEYS.expandedIds, [])
  const [schemaVersion, setSchemaVersion] = useSyncedState<number>(
    STORAGE_KEYS.schemaVersion,
    SCHEMA_VERSION,
  )
  const [seeded, setSeeded] = useSyncedState<boolean>(STORAGE_KEYS.seeded, false)
  const [errors, setErrors] = useSyncedState<Record<string, string>>(STORAGE_KEYS.errors, {})

  // Shared (whole-widget) lock / language / open-editors state.
  const [locked, setLocked] = useSyncedState<boolean>(STORAGE_KEYS.locked, true)
  const [lang, setLang] = useSyncedState<Lang>(STORAGE_KEYS.lang, 'he')
  const [editingIds, setEditingIds] = useSyncedState<string[]>(STORAGE_KEYS.editingIds, [])
  const [openPicker, setOpenPicker] = useSyncedState<string | null>(STORAGE_KEYS.openPicker, null)
  const [groupBy, setGroupBy] = useSyncedState<GroupBy>(STORAGE_KEYS.groupBy, DEFAULT_GROUP_BY)
  const [sortKey, setSortKey] = useSyncedState<SortKey>(STORAGE_KEYS.sortKey, DEFAULT_SORT_KEY)
  const [sortDir, setSortDir] = useSyncedState<SortDir>(STORAGE_KEYS.sortDir, DEFAULT_SORT_DIR)

  return {
    campaigns,
    initiatives,
    tasks,
    viewMode,
    setViewMode,
    tableMode,
    setTableMode,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    expandedIds,
    setExpandedIds,
    schemaVersion,
    setSchemaVersion,
    seeded,
    setSeeded,
    errors,
    setErrors,
    locked,
    setLocked,
    lang,
    setLang,
    editingIds,
    setEditingIds,
    openPicker,
    setOpenPicker,
    groupBy,
    setGroupBy,
    sortKey,
    setSortKey,
    sortDir,
    setSortDir,
  }
}

// --- Read helpers (snapshot synced maps as plain arrays for business logic) ---

export function readCampaigns(state: InitiativeLogState): Campaign[] {
  return state.campaigns.values()
}

export function readInitiatives(state: InitiativeLogState): Initiative[] {
  return state.initiatives.values()
}

export function readTasks(state: InitiativeLogState): Task[] {
  return state.tasks.values()
}
