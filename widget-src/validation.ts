// Pure validation for campaign, initiative, and task payloads. No widget-API access.
// Returns error CODES (localized at the render layer). See 03_BUILD.md §6.6, §11.

import { INITIATIVE_STATUSES, MAX_TITLE_LENGTH, PRIORITIES, TASK_STATUSES } from './constants'
import {
  CreateCampaignInput,
  CreateInitiativeInput,
  CreateTaskInput,
  FieldError,
  InitiativeStatus,
  Priority,
  TaskStatus,
  UpdateCampaignInput,
  UpdateInitiativeInput,
  UpdateTaskInput,
  ValidationResult,
} from './types'

// --- Enum guards ---

export function isInitiativeStatus(v: unknown): v is InitiativeStatus {
  return typeof v === 'string' && (INITIATIVE_STATUSES as string[]).includes(v)
}

export function isTaskStatus(v: unknown): v is TaskStatus {
  return typeof v === 'string' && (TASK_STATUSES as string[]).includes(v)
}

export function isPriority(v: unknown): v is Priority {
  return typeof v === 'string' && (PRIORITIES as string[]).includes(v)
}

function ok(errors: FieldError[]): ValidationResult {
  return { valid: errors.length === 0, errors }
}

function validTitle(title: string | undefined, errors: FieldError[], requiredCode: string): void {
  const trimmed = (title ?? '').trim()
  if (trimmed.length === 0) {
    errors.push({ field: 'title', code: requiredCode })
  } else if (trimmed.length > MAX_TITLE_LENGTH) {
    errors.push({ field: 'title', code: 'titleTooLong' })
  }
}

function validSortOrder(sortOrder: number | undefined, errors: FieldError[]): void {
  if (sortOrder !== undefined && (typeof sortOrder !== 'number' || Number.isNaN(sortOrder))) {
    errors.push({ field: 'sortOrder', code: 'invalidSortOrder' })
  }
}

// --- Campaign ---

export function validateCreateCampaign(input: CreateCampaignInput): ValidationResult {
  const errors: FieldError[] = []
  validTitle(input.title, errors, 'campaignTitleRequired')
  return ok(errors)
}

export function validateUpdateCampaign(input: UpdateCampaignInput): ValidationResult {
  const errors: FieldError[] = []
  if (!input.id) errors.push({ field: 'id', code: 'missingId' })
  if (input.title !== undefined) validTitle(input.title, errors, 'campaignTitleRequired')
  validSortOrder(input.sortOrder, errors)
  return ok(errors)
}

// --- Initiative ---

export function validateCreateInitiative(
  input: CreateInitiativeInput,
  campaignExists: (id: string) => boolean,
): ValidationResult {
  const errors: FieldError[] = []
  validTitle(input.title, errors, 'initiativeTitleRequired')
  if (input.status !== undefined && !isInitiativeStatus(input.status)) {
    errors.push({ field: 'status', code: 'invalidInitiativeStatus' })
  }
  if (input.priority !== undefined && !isPriority(input.priority)) {
    errors.push({ field: 'priority', code: 'invalidPriority' })
  }
  if (input.campaignId != null && !campaignExists(input.campaignId)) {
    errors.push({ field: 'campaignId', code: 'invalidCampaignRef' })
  }
  return ok(errors)
}

export function validateUpdateInitiative(
  input: UpdateInitiativeInput,
  campaignExists: (id: string) => boolean,
): ValidationResult {
  const errors: FieldError[] = []
  if (!input.id) errors.push({ field: 'id', code: 'missingId' })
  if (input.title !== undefined) validTitle(input.title, errors, 'initiativeTitleRequired')
  if (input.status !== undefined && !isInitiativeStatus(input.status)) {
    errors.push({ field: 'status', code: 'invalidInitiativeStatus' })
  }
  if (input.priority !== undefined && !isPriority(input.priority)) {
    errors.push({ field: 'priority', code: 'invalidPriority' })
  }
  if (input.campaignId != null && !campaignExists(input.campaignId)) {
    errors.push({ field: 'campaignId', code: 'invalidCampaignRef' })
  }
  validSortOrder(input.sortOrder, errors)
  return ok(errors)
}

// --- Task ---

export function validateCreateTask(
  input: CreateTaskInput,
  initiativeExists: (id: string) => boolean,
): ValidationResult {
  const errors: FieldError[] = []
  validTitle(input.title, errors, 'taskTitleRequired')
  if (!initiativeExists(input.initiativeId)) {
    errors.push({ field: 'initiativeId', code: 'invalidInitiativeRef' })
  }
  if (input.status !== undefined && !isTaskStatus(input.status)) {
    errors.push({ field: 'status', code: 'invalidTaskStatus' })
  }
  return ok(errors)
}

export function validateUpdateTask(input: UpdateTaskInput): ValidationResult {
  const errors: FieldError[] = []
  if (!input.id) errors.push({ field: 'id', code: 'missingId' })
  if (input.title !== undefined) validTitle(input.title, errors, 'taskTitleRequired')
  if (input.status !== undefined && !isTaskStatus(input.status)) {
    errors.push({ field: 'status', code: 'invalidTaskStatus' })
  }
  validSortOrder(input.sortOrder, errors)
  if (Object.prototype.hasOwnProperty.call(input, 'dueDate')) {
    errors.push({ field: 'dueDate', code: 'taskNoDueDate' })
  }
  return ok(errors)
}
