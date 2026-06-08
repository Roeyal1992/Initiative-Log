// Initiative priority badge (P0–P3, localized). Normalizes legacy values defensively.

import { PRIORITY_COLORS } from '../constants'
import { Strings } from '../i18n'
import { normalizePriority } from '../sort'
import { Priority } from '../types'
import { Badge } from './Badge'

export function PriorityBadge({ priority, t }: { priority: Priority; t: Strings }) {
  const p = normalizePriority(priority)
  const c = PRIORITY_COLORS[p]
  return <Badge text={t.priority[p]} bg={c.bg} fg={c.fg} />
}
