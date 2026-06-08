// Mutation layer: validate, then write records to the synced maps.
// Every action validates before mutating and returns a ValidationResult.
// See 03_BUILD.md sections 6.7 and 12.

import { INITIATIVE_DEFAULTS, TASK_DEFAULTS } from './defaults'
import { nextSortOrder } from './sort'
import { InitiativeLogState, genId, nowIso } from './state'
import {
  Campaign,
  CreateInitiativeInput,
  CreateTaskInput,
  Initiative,
  Task,
  UpdateCampaignInput,
  UpdateInitiativeInput,
  UpdateTaskInput,
  ValidationResult,
} from './types'
import {
  validateCreateCampaign,
  validateCreateInitiative,
  validateCreateTask,
  validateUpdateCampaign,
  validateUpdateInitiative,
  validateUpdateTask,
} from './validation'

const OK: ValidationResult = { valid: true, errors: [] }

function notFound(field: string): ValidationResult {
  return { valid: false, errors: [{ field, code: 'recordMissing' }] }
}

export interface Actions {
  createCampaign(title?: string): ValidationResult
  updateCampaign(input: UpdateCampaignInput): ValidationResult
  createInitiative(input: CreateInitiativeInput): ValidationResult
  updateInitiative(input: UpdateInitiativeInput): ValidationResult
  archiveInitiative(id: string): ValidationResult
  unarchiveInitiative(id: string): ValidationResult
  createTask(input: CreateTaskInput): ValidationResult
  updateTask(input: UpdateTaskInput): ValidationResult
  deleteTask(id: string): ValidationResult
}

export function createActions(state: InitiativeLogState): Actions {
  const campaignExists = (id: string) => state.campaigns.has(id)
  const initiativeExists = (id: string) => state.initiatives.has(id)

  return {
    createCampaign(title = 'New campaign') {
      const result = validateCreateCampaign({ title })
      if (!result.valid) return result
      const now = nowIso()
      const campaign: Campaign = {
        id: genId('camp'),
        title: title.trim(),
        sortOrder: nextSortOrder(state.campaigns.values()),
        createdAt: now,
        updatedAt: now,
      }
      state.campaigns.set(campaign.id, campaign)
      return OK
    },

    updateCampaign(input) {
      const result = validateUpdateCampaign(input)
      if (!result.valid) return result
      const existing = state.campaigns.get(input.id)
      if (!existing) return notFound('id')
      const updated: Campaign = {
        ...existing,
        title: input.title !== undefined ? input.title.trim() : existing.title,
        sortOrder: input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder,
        updatedAt: nowIso(),
      }
      state.campaigns.set(updated.id, updated)
      return OK
    },

    createInitiative(input) {
      const result = validateCreateInitiative(input, campaignExists)
      if (!result.valid) return result
      const now = nowIso()
      const campaignId = input.campaignId ?? null
      const siblings = state.initiatives.values().filter((i) => i.campaignId === campaignId)
      const initiative: Initiative = {
        id: genId('init'),
        campaignId,
        title: input.title.trim(),
        owner: input.owner ?? INITIATIVE_DEFAULTS.owner,
        status: input.status ?? INITIATIVE_DEFAULTS.status,
        priority: input.priority ?? INITIATIVE_DEFAULTS.priority,
        dueDate: input.dueDate ?? INITIATIVE_DEFAULTS.dueDate,
        figmaLink: input.figmaLink ?? INITIATIVE_DEFAULTS.figmaLink,
        description: input.description ?? INITIATIVE_DEFAULTS.description,
        notes: input.notes ?? INITIATIVE_DEFAULTS.notes,
        sortOrder: nextSortOrder(siblings),
        archived: INITIATIVE_DEFAULTS.archived,
        createdAt: now,
        updatedAt: now,
      }
      state.initiatives.set(initiative.id, initiative)
      return OK
    },

    updateInitiative(input) {
      const result = validateUpdateInitiative(input, campaignExists)
      if (!result.valid) return result
      const existing = state.initiatives.get(input.id)
      if (!existing) return notFound('id')
      const { id: _id, ...changes } = input
      const updated: Initiative = {
        ...existing,
        ...changes,
        title: input.title !== undefined ? input.title.trim() : existing.title,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: nowIso(),
      }
      state.initiatives.set(updated.id, updated)
      return OK
    },

    archiveInitiative(id) {
      const existing = state.initiatives.get(id)
      if (!existing) return notFound('id')
      state.initiatives.set(id, { ...existing, archived: true, updatedAt: nowIso() })
      return OK
    },

    unarchiveInitiative(id) {
      const existing = state.initiatives.get(id)
      if (!existing) return notFound('id')
      state.initiatives.set(id, { ...existing, archived: false, updatedAt: nowIso() })
      return OK
    },

    createTask(input) {
      const result = validateCreateTask(input, initiativeExists)
      if (!result.valid) return result
      const now = nowIso()
      const siblings = state.tasks.values().filter((t) => t.initiativeId === input.initiativeId)
      const task: Task = {
        id: genId('task'),
        initiativeId: input.initiativeId,
        title: input.title.trim(),
        assignee: input.assignee ?? TASK_DEFAULTS.assignee,
        status: input.status ?? TASK_DEFAULTS.status,
        notes: input.notes ?? TASK_DEFAULTS.notes,
        estimateHours: input.estimateHours ?? TASK_DEFAULTS.estimateHours,
        sortOrder: nextSortOrder(siblings),
        createdAt: now,
        updatedAt: now,
      }
      state.tasks.set(task.id, task)
      return OK
    },

    updateTask(input) {
      const result = validateUpdateTask(input)
      if (!result.valid) return result
      const existing = state.tasks.get(input.id)
      if (!existing) return notFound('id')
      const { id: _id, ...changes } = input
      const updated: Task = {
        ...existing,
        ...changes,
        title: input.title !== undefined ? input.title.trim() : existing.title,
        id: existing.id,
        initiativeId: existing.initiativeId,
        createdAt: existing.createdAt,
        updatedAt: nowIso(),
      }
      state.tasks.set(updated.id, updated)
      return OK
    },

    deleteTask(id) {
      if (!state.tasks.has(id)) return notFound('id')
      state.tasks.delete(id)
      return OK
    },
  }
}
