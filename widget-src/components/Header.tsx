// Widget header: product name and visible counts (with archived-hidden hint).

import { COLORS, LAYOUT } from '../constants'
import { Ui } from '../i18n'

const { AutoLayout, Text } = figma.widget

export interface HeaderProps {
  ui: Ui
  initiativeCount: number
  taskCount: number
  archivedHiddenCount: number
  showArchived: boolean
}

export function Header({ ui, initiativeCount, taskCount, archivedHiddenCount, showArchived }: HeaderProps) {
  const { t, dir } = ui
  const align = dir === 'rtl' ? 'right' : 'left'
  const countLine =
    `${initiativeCount} ${t.countInitiatives} · ${taskCount} ${t.countTasks}` +
    (!showArchived && archivedHiddenCount > 0
      ? ` · ${archivedHiddenCount} ${t.archivedHiddenSuffix}`
      : '')
  return (
    <AutoLayout direction="vertical" width="fill-parent" spacing={2}>
      <Text width="fill-parent" horizontalAlignText={align} fontSize={LAYOUT.fontSizeTitle} fontWeight={700} fill={COLORS.text}>
        {t.appName}
      </Text>
      <Text width="fill-parent" horizontalAlignText={align} fontSize={LAYOUT.fontSizeSmall} fill={COLORS.textFaint}>
        {countLine}
      </Text>
    </AutoLayout>
  )
}
