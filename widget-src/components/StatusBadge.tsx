// Initiative status badge (localized label).

import { STATUS_COLORS } from '../constants'
import { Strings } from '../i18n'
import { InitiativeStatus } from '../types'
import { Badge } from './Badge'

export function StatusBadge({ status, t }: { status: InitiativeStatus; t: Strings }) {
  const c = STATUS_COLORS[status]
  return <Badge text={t.status[status]} bg={c.bg} fg={c.fg} />
}
