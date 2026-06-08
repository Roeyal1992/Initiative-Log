// Entity, enum, filter, validation, and derived view-model types for the Initiative Log widget.
// Owns the data contracts referenced by every other module. See 03_BUILD.md §6.2, §7.

// --- Controlled enums (03_BUILD.md §8) ---

export type InitiativeStatus =
  | 'Backlog'
  | 'Planned'
  | 'In Progress'
  | 'Blocked'
  | 'In Review'
  | 'Done'

export type TaskStatus = 'To Do' | 'In Progress' | 'Blocked' | 'Done'

export type Priority = 'P0' | 'P1' | 'P2' | 'P3'

export type ViewMode = 'Cards' | 'Table'

export type TableMode = 'Initiatives' | 'Tasks'

// How the card view groups initiatives into sections.
export type GroupBy = 'campaign' | 'priority' | 'status' | 'owner' | 'none'

// How initiatives are ordered within a section / in the table.
export type SortKey = 'priority' | 'estimate' | 'dueDate' | 'status' | 'title' | 'manual'

export type SortDir = 'asc' | 'desc'

// --- Records (03_BUILD.md §7) ---

export interface Campaign {
  id: string
  title: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Initiative {
  id: string
  campaignId: string | null // null means Unassigned
  title: string
  owner: string
  status: InitiativeStatus
  priority: Priority
  dueDate: string | null
  figmaLink: string
  description: string // consolidated from the former strategy + scope fields
  notes: string
  sortOrder: number
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  initiativeId: string
  title: string
  assignee: string
  status: TaskStatus
  notes: string
  estimateHours: number // effort estimate in hours (0 if unset)
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// --- Filters (03_BUILD.md §9.3) ---

export interface FilterState {
  campaignId: string | 'all' // UNASSIGNED_ID targets the Unassigned group
  initiativeStatus: InitiativeStatus | 'all'
  taskStatus: TaskStatus | 'all'
  owner: string | 'all'
  assignee: string | 'all'
  priority: Priority | 'all'
  showArchived: boolean
}

// --- Validation (03_BUILD.md §11) ---

export interface FieldError {
  field: string
  code: string // maps to a localized message via i18n Strings.errors
}

export interface ValidationResult {
  valid: boolean
  errors: FieldError[]
}

// --- Diagnostics (03_BUILD.md §17.5) ---

export interface Diagnostic {
  level: 'warning' | 'error'
  message: string
  recordId?: string
}

// --- Derived view model (03_BUILD.md §10) ---

export interface TaskProgress {
  total: number // non-archived tasks
  done: number // tasks with status Done
}

export interface TaskVM {
  task: Task
}

export interface InitiativeCardVM {
  initiative: Initiative
  campaignTitle: string
  progress: TaskProgress
  estimateHours: number // sum of non-archived task hours
  tasks: TaskVM[] // visible tasks, sorted (for expanded content)
  expanded: boolean
}

// A section header in the card view. 'kind' controls campaign-only affordances.
export type SectionKind = 'campaign' | 'unassigned' | 'group' | 'flat'

export interface CampaignSectionVM {
  id: string // campaign id, UNASSIGNED_ID, or a group key
  title: string
  kind: SectionKind
  isUnassigned: boolean
  cards: InitiativeCardVM[]
  initiativeCount: number
  totalHours: number // summed estimate across the section's initiatives
  isEmpty: boolean
}

export interface InitiativeTableRowVM {
  initiative: Initiative
  campaignTitle: string
  progress: TaskProgress
  estimateHours: number
}

export interface TaskTableRowVM {
  task: Task
  initiativeTitle: string
  campaignTitle: string
  initiativeStatus: InitiativeStatus
  initiativeDueDate: string | null
  notesPreview: string
}

export interface FilterOption {
  id: string
  title: string
}

export interface FilterOptions {
  campaigns: FilterOption[] // includes Unassigned
  owners: string[]
  assignees: string[]
}

export interface ViewModel {
  sections: CampaignSectionVM[]
  initiativeRows: InitiativeTableRowVM[]
  taskRows: TaskTableRowVM[]
  filterOptions: FilterOptions
  visibleInitiativeCount: number
  visibleTaskCount: number
  archivedHiddenCount: number
  isEmpty: boolean // no initiatives exist at all (respecting archive visibility)
  noResults: boolean // data exists but the active search/filters hide everything
  diagnostics: Diagnostic[]
}

// --- Action payloads (03_BUILD.md §12) ---

export interface CreateCampaignInput {
  title: string
}

export interface UpdateCampaignInput {
  id: string
  title?: string
  sortOrder?: number
}

export interface CreateInitiativeInput {
  title: string
  campaignId?: string | null
  owner?: string
  status?: InitiativeStatus
  priority?: Priority
  dueDate?: string | null
  figmaLink?: string
  description?: string
  notes?: string
}

export type UpdateInitiativeInput = { id: string } & Partial<
  Omit<Initiative, 'id' | 'createdAt' | 'updatedAt'>
>

export interface CreateTaskInput {
  initiativeId: string
  title: string
  assignee?: string
  status?: TaskStatus
  notes?: string
  estimateHours?: number
}

export type UpdateTaskInput = { id: string } & Partial<
  Omit<Task, 'id' | 'initiativeId' | 'createdAt' | 'updatedAt'>
>

// --- Edit controller surface passed to editing components (Phase 4) ---

// Free-text initiative fields editable via an Input control.
export type EditableInitiativeField =
  | 'title'
  | 'owner'
  | 'dueDate'
  | 'figmaLink'
  | 'description'
  | 'notes'

// Free-text task fields editable via an Input control.
export type EditableTaskField = 'title' | 'assignee' | 'notes'

export interface EditApi {
  errors: Record<string, string> // keyed `${recordId}:${field}` → error code
  editingIds: string[] // records currently open for editing (this user)
  toggleEditing: (id: string) => void
  openPicker: string | null // key of the currently-open inline picker (campaign/status)
  setOpenPicker: (key: string | null) => void
  createCampaign: () => void
  updateCampaignTitle: (id: string, title: string) => void
  createInitiative: (campaignId: string | null) => void
  setInitiativeField: (id: string, field: EditableInitiativeField, value: string) => void
  setInitiativeCampaign: (id: string, campaignId: string | null) => void
  setInitiativeStatus: (id: string, status: InitiativeStatus) => void
  setInitiativePriority: (id: string, priority: Priority) => void
  archiveInitiative: (id: string) => void
  unarchiveInitiative: (id: string) => void
  createTask: (initiativeId: string) => void
  setTaskField: (id: string, field: EditableTaskField, value: string) => void
  setTaskEstimate: (id: string, hoursText: string) => void
  setTaskStatus: (id: string, status: TaskStatus) => void
  deleteTask: (id: string) => void
}

// Key helper for the errors map.
export function errorKey(recordId: string, field: string): string {
  return `${recordId}:${field}`
}
