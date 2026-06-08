// Display formatting for dates, links, notes previews, and empty fields.
// Pure; no widget-API access. Progress text is localized in i18n (formatProgress).
// See 03_BUILD.md §6.11.

const EMPTY_PLACEHOLDER = '—'

export function formatEmpty(value: string | null | undefined, placeholder = EMPTY_PLACEHOLDER): string {
  const trimmed = (value ?? '').trim()
  return trimmed.length > 0 ? trimmed : placeholder
}

// Renders an ISO-ish date string as YYYY-MM-DD; falls back to the raw value if unparseable.
export function formatDueDate(due: string | null | undefined): string {
  if (!due) return EMPTY_PLACEHOLDER
  const trimmed = due.trim()
  if (trimmed.length === 0) return EMPTY_PLACEHOLDER
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return `${match[1]}-${match[2]}-${match[3]}`
  return trimmed
}

export function notesPreview(notes: string | null | undefined, max = 80): string {
  const trimmed = (notes ?? '').trim().replace(/\s+/g, ' ')
  if (trimmed.length === 0) return EMPTY_PLACEHOLDER
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

// Compact display for a Figma link (host + truncated path), or placeholder when blank.
export function formatLink(link: string | null | undefined): string {
  const trimmed = (link ?? '').trim()
  if (trimmed.length === 0) return EMPTY_PLACEHOLDER
  const stripped = trimmed.replace(/^https?:\/\//, '')
  return stripped.length > 48 ? `${stripped.slice(0, 47)}…` : stripped
}

// A navigable href for a stored link; prepends https:// when the scheme is missing.
// Returns null for blank links so callers can skip the clickable affordance.
export function linkHref(link: string | null | undefined): string | null {
  const trimmed = (link ?? '').trim()
  if (trimmed.length === 0) return null
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}
