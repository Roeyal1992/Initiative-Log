// Task status badge (localized label).

import { TASK_STATUS_COLORS } from '../constants'
import { Strings } from '../i18n'
import { TaskStatus } from '../types'
import { Badge } from './Badge'

export function TaskStatusBadge({ status, t }: { status: TaskStatus; t: Strings }) {
  const c = TASK_STATUS_COLORS[status]
  return <Badge text={t.taskStatus[status]} bg={c.bg} fg={c.fg} />
}
