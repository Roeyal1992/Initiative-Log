// Task progress indicator (e.g. "3/7 משימות הושלמו" / "3/7 tasks done").
// Rendered as muted text to keep collapsed cards and table rows compact.

import { COLORS, LAYOUT } from '../constants'
import { Strings, formatProgress } from '../i18n'
import { TaskProgress } from '../types'

const { Text } = figma.widget

export function ProgressBadge({
  progress,
  t,
  width,
  align,
}: {
  progress: TaskProgress
  t: Strings
  width?: number | 'fill-parent' | 'hug-contents'
  align?: 'left' | 'right'
}) {
  return (
    <Text width={width} horizontalAlignText={align} fontSize={LAYOUT.fontSizeSmall} fill={COLORS.textMuted}>
      {formatProgress(t, progress.done, progress.total)}
    </Text>
  )
}
