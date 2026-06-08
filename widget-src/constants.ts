// Controlled value sets, storage keys, color tokens, layout, labels, and messages.
// Owns every literal that other modules reference. See 03_BUILD.md §6.3, §8.

import {
  GroupBy,
  InitiativeStatus,
  Priority,
  SortKey,
  TableMode,
  TaskStatus,
  ViewMode,
} from './types'

// --- Schema ---
// v2: priority moved from High/Medium/Low to P0–P3; tasks gained estimateHours.
// v3: initiative strategy + scope consolidated into a single description field.
// v4: task.archived removed; previously-archived tasks purged on migration.
export const SCHEMA_VERSION = 4

// --- Unassigned group ---

export const UNASSIGNED_ID = '__unassigned__'

// --- Controlled enums (order matters for menus/sorting) ---

export const INITIATIVE_STATUSES: InitiativeStatus[] = [
  'Backlog',
  'Planned',
  'In Progress',
  'Blocked',
  'In Review',
  'Done',
]

export const TASK_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Blocked', 'Done']

export const PRIORITIES: Priority[] = ['P0', 'P1', 'P2', 'P3']

export const VIEW_MODES: ViewMode[] = ['Cards', 'Table']

export const TABLE_MODES: TableMode[] = ['Initiatives', 'Tasks']

export const GROUP_BYS: GroupBy[] = ['campaign', 'priority', 'status', 'owner', 'none']

export const SORT_KEYS: SortKey[] = ['priority', 'estimate', 'dueDate', 'status', 'title', 'manual']

export const DONE_TASK_STATUS: TaskStatus = 'Done'

// --- Synced state / map storage keys (must stay unique and stable; 03_BUILD.md §5.5) ---

export const STORAGE_KEYS = {
  campaigns: 'il_campaigns',
  initiatives: 'il_initiatives',
  tasks: 'il_tasks',
  viewMode: 'il_viewMode',
  tableMode: 'il_tableMode',
  searchQuery: 'il_searchQuery',
  filters: 'il_filters',
  expandedIds: 'il_expandedIds',
  schemaVersion: 'il_schemaVersion',
  seeded: 'il_seeded',
  errors: 'il_errors',
  locked: 'il_locked',
  lang: 'il_lang',
  editingIds: 'il_editingIds',
  groupBy: 'il_groupBy',
  sortKey: 'il_sortKey',
  sortDir: 'il_sortDir',
  openPicker: 'il_openPicker',
} as const

// --- Validation limits (03_BUILD.md §11) ---

export const MAX_TITLE_LENGTH = 200

// --- Color tokens (03_BUILD.md §16) ---

export const COLORS = {
  surface: '#FFFFFF',
  surfaceAlt: '#F7F8FA',
  surfaceSunken: '#F0F2F5',
  canvas: '#ECEEF2', // grey page background that white cards/controls sit on
  border: '#E4E7EB',
  divider: '#EEF0F3',
  text: '#1F2430',
  textMuted: '#5B6472',
  textFaint: '#9AA2AF',
  accent: '#3B6FED',
  archivedTint: '#EEF0F3',
  danger: '#B3261E',
}

interface BadgeColor {
  bg: string
  fg: string
}

export const STATUS_COLORS: Record<InitiativeStatus, BadgeColor> = {
  Backlog: { bg: '#EEF0F3', fg: '#5B6472' },
  Planned: { bg: '#E7EEFC', fg: '#2F55B8' },
  'In Progress': { bg: '#E2F0FB', fg: '#1F6FA8' },
  Blocked: { bg: '#FCE8E6', fg: '#B3261E' },
  'In Review': { bg: '#F3E9FB', fg: '#7A3DB0' },
  Done: { bg: '#E6F4EA', fg: '#1E7E45' },
}

export const TASK_STATUS_COLORS: Record<TaskStatus, BadgeColor> = {
  'To Do': { bg: '#EEF0F3', fg: '#5B6472' },
  'In Progress': { bg: '#E2F0FB', fg: '#1F6FA8' },
  Blocked: { bg: '#FCE8E6', fg: '#B3261E' },
  Done: { bg: '#E6F4EA', fg: '#1E7E45' },
}

export const PRIORITY_COLORS: Record<Priority, BadgeColor> = {
  P0: { bg: '#FCE8E6', fg: '#B3261E' }, // critical — red
  P1: { bg: '#FDECDD', fg: '#B5500F' }, // high — deep orange
  P2: { bg: '#E7EEFC', fg: '#2F55B8' }, // medium — blue
  P3: { bg: '#EEF0F3', fg: '#5B6472' }, // low — grey
}

// --- Layout (03_BUILD.md §16.2) ---

// Shared metadata column widths so collapsed cards line up like the initiative table.
export const META_COLS = {
  owner: 60,
  status: 78,
  priority: 56,
  due: 70,
  progress: 66,
  estimate: 80,
}

// Soft elevation for white cards/controls sitting on the grey canvas.
export const CARD_SHADOW = {
  type: 'drop-shadow' as const,
  color: { r: 0.06, g: 0.09, b: 0.16, a: 0.08 },
  offset: { x: 0, y: 1 },
  blur: 4,
  spread: 0,
}

export const LAYOUT = {
  widgetWidth: 760,
  contentPadding: 16,
  sectionSpacing: 20,
  cardSpacing: 4,
  cornerRadius: 12,
  cardCornerRadius: 10,
  fontSizeTitle: 18,
  fontSizeHeading: 14,
  fontSizeBody: 13,
  fontSizeSmall: 11,
}

// Display strings, enum labels, and validation messages live in i18n.ts (bilingual).
