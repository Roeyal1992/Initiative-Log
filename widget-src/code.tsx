// Initiative Log widget entry point. Wiring only: state, first-run seeding,
// per-user prefs (lock / language / open editors), view-model derivation,
// the edit controller, and delegation to <App />.
// Rendering lives in widget-src/components/*; mutations in actions.ts. See 03_BUILD.md §6.1.

const { widget } = figma
const { useEffect } = widget

import { createActions } from './actions'
import { App } from './components/App'
import { SCHEMA_VERSION } from './constants'
import { SEED_ON_EMPTY, buildSeedData } from './defaults'
import { Ui, dirForLang, getStrings } from './i18n'
import { normalizePriority } from './sort'
import { nowIso, useInitiativeLogState } from './state'
import {
  EditApi,
  UpdateInitiativeInput,
  UpdateTaskInput,
  ValidationResult,
  errorKey,
} from './types'
import { buildViewModel } from './viewModel'

function Widget() {
  const state = useInitiativeLogState()
  const actions = createActions(state)

  const t = getStrings(state.lang)
  const ui: Ui = { t, dir: dirForLang(state.lang), lang: state.lang }

  // First-run development seeding (gated by SEED_ON_EMPTY).
  useEffect(() => {
    if (
      SEED_ON_EMPTY &&
      !state.seeded &&
      state.campaigns.size === 0 &&
      state.initiatives.size === 0 &&
      state.tasks.size === 0
    ) {
      const now = nowIso()
      const seed = buildSeedData(now)
      seed.campaigns.forEach((c) => state.campaigns.set(c.id, c))
      seed.initiatives.forEach((i) => state.initiatives.set(i.id, i))
      seed.tasks.forEach((tk) => state.tasks.set(tk.id, tk))
      state.setSeeded(true)
    }
  })

  // Schema migrations (run once; render paths are defensive meanwhile):
  //  v2: legacy priorities High/Medium/Low -> P0–P3, backfill task estimateHours.
  //  v3: consolidate initiative strategy + scope into a single description.
  //  v4: task.archived removed; purge any previously-archived tasks.
  useEffect(() => {
    if (state.schemaVersion >= SCHEMA_VERSION) return
    state.initiatives.values().forEach((i) => {
      const legacy = i as unknown as { strategy?: string; scope?: string; description?: string }
      const patch: Record<string, unknown> = {}
      const np = normalizePriority(i.priority)
      if (np !== i.priority) patch.priority = np
      if (legacy.description === undefined) {
        patch.description = [legacy.strategy, legacy.scope].filter((s) => s && s.trim()).join('\n\n')
      }
      if (Object.keys(patch).length > 0) state.initiatives.set(i.id, { ...i, ...patch })
    })
    state.tasks.values().forEach((tk) => {
      if (typeof tk.estimateHours !== 'number') state.tasks.set(tk.id, { ...tk, estimateHours: 0 })
      // v4: delete tasks that were previously archived.
      if ((tk as unknown as { archived?: boolean }).archived === true) state.tasks.delete(tk.id)
    })
    state.setSchemaVersion(SCHEMA_VERSION)
  })

  const vm = buildViewModel({
    campaigns: state.campaigns.values(),
    initiatives: state.initiatives.values(),
    tasks: state.tasks.values(),
    filters: state.filters,
    searchQuery: state.searchQuery,
    expandedIds: state.expandedIds,
    groupBy: state.groupBy,
    sortKey: state.sortKey,
    sortDir: state.sortDir,
    unassignedTitle: t.unassigned,
    priorityLabels: t.priority,
    statusLabels: t.status,
    noOwnerLabel: t.noOwner,
  })

  // --- Validation-error bookkeeping (keyed `${recordId}:${field}` → error code) ---
  const setError = (key: string, code: string) => {
    state.setErrors({ ...state.errors, [key]: code })
  }
  const clearError = (key: string) => {
    if (state.errors[key] !== undefined) {
      const next = { ...state.errors }
      delete next[key]
      state.setErrors(next)
    }
  }
  const apply = (key: string, result: ValidationResult) => {
    if (!result.valid) setError(key, result.errors[0] ? result.errors[0].code : 'invalid')
    else clearError(key)
  }

  const ensureExpanded = (id: string) => {
    if (!state.expandedIds.includes(id)) state.setExpandedIds([...state.expandedIds, id])
  }

  // --- Edit controller passed down to editing components ---
  const edit: EditApi = {
    errors: state.errors,
    editingIds: state.editingIds,
    openPicker: state.openPicker,
    setOpenPicker: state.setOpenPicker,
    toggleEditing: (id) => {
      if (state.editingIds.includes(id)) {
        state.setEditingIds(state.editingIds.filter((x) => x !== id))
      } else {
        ensureExpanded(id)
        state.setEditingIds([...state.editingIds, id])
      }
    },
    createCampaign: () => {
      actions.createCampaign()
    },
    updateCampaignTitle: (id, title) =>
      apply(errorKey(id, 'title'), actions.updateCampaign({ id, title })),
    createInitiative: (campaignId) => {
      actions.createInitiative({ title: 'New initiative', campaignId })
    },
    setInitiativeField: (id, field, value) => {
      const input = { id } as UpdateInitiativeInput
      const next: Record<string, unknown> = input
      next[field] = field === 'dueDate' ? (value.trim() ? value.trim() : null) : value
      apply(errorKey(id, field), actions.updateInitiative(input))
    },
    setInitiativeCampaign: (id, campaignId) =>
      apply(errorKey(id, 'campaignId'), actions.updateInitiative({ id, campaignId })),
    setInitiativeStatus: (id, status) =>
      apply(errorKey(id, 'status'), actions.updateInitiative({ id, status })),
    setInitiativePriority: (id, priority) =>
      apply(errorKey(id, 'priority'), actions.updateInitiative({ id, priority })),
    archiveInitiative: (id) => {
      actions.archiveInitiative(id)
    },
    unarchiveInitiative: (id) => {
      actions.unarchiveInitiative(id)
    },
    createTask: (initiativeId) => {
      actions.createTask({ initiativeId, title: 'New task' })
    },
    setTaskField: (id, field, value) => {
      const input = { id } as UpdateTaskInput
      const next: Record<string, unknown> = input
      next[field] = value
      apply(errorKey(id, field), actions.updateTask(input))
    },
    setTaskEstimate: (id, hoursText) => {
      const n = Number(hoursText)
      const hours = Number.isFinite(n) && n >= 0 ? n : 0
      apply(errorKey(id, 'estimateHours'), actions.updateTask({ id, estimateHours: hours }))
    },
    setTaskStatus: (id, status) =>
      apply(errorKey(id, 'status'), actions.updateTask({ id, status })),
    deleteTask: (id) => {
      // Clean up any stale validation errors for the deleted task.
      const next = { ...state.errors }
      let changed = false
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`${id}:`)) { delete next[k]; changed = true }
      })
      if (changed) state.setErrors(next)
      actions.deleteTask(id)
    },
  }

  const onToggleExpanded = (id: string) => {
    if (state.expandedIds.includes(id)) {
      state.setExpandedIds(state.expandedIds.filter((x) => x !== id))
    } else {
      state.setExpandedIds([...state.expandedIds, id])
    }
  }

  const onToggleLock = () => {
    const next = !state.locked
    state.setLocked(next)
    if (next) {
      if (state.editingIds.length > 0) state.setEditingIds([]) // locking closes open editors
      if (Object.keys(state.errors).length > 0) state.setErrors({}) // and clears stale errors
      if (state.openPicker !== null) state.setOpenPicker(null) // and closes any open picker
    }
  }

  return (
    <App
      vm={vm}
      ui={ui}
      locked={state.locked}
      viewMode={state.viewMode}
      tableMode={state.tableMode}
      showArchived={state.filters.showArchived}
      edit={edit}
      onSetViewMode={state.setViewMode}
      onSetTableMode={state.setTableMode}
      onToggleArchived={() =>
        state.setFilters({ ...state.filters, showArchived: !state.filters.showArchived })
      }
      onToggleExpanded={onToggleExpanded}
      onToggleLock={onToggleLock}
      onToggleLang={() => state.setLang(state.lang === 'he' ? 'en' : 'he')}
      groupBy={state.groupBy}
      sortKey={state.sortKey}
      sortDir={state.sortDir}
      onSetGroupBy={state.setGroupBy}
      onSetSortKey={state.setSortKey}
      onToggleSortDir={() => state.setSortDir(state.sortDir === 'asc' ? 'desc' : 'asc')}
    />
  )
}

widget.register(Widget)
