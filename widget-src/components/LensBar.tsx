// Lens controls: group-by and sort-by cyclers + sort-direction toggle.
// Always visible (view configuration, not gated by the lock). RTL-aware.

import { COLORS, GROUP_BYS, LAYOUT, SORT_KEYS } from '../constants'
import { Ui, order } from '../i18n'
import { GroupBy, SortDir, SortKey } from '../types'

const { AutoLayout, Text } = figma.widget

function cycle<T>(arr: T[], cur: T): T {
  const i = arr.indexOf(cur)
  return arr[(i + 1) % arr.length]
}

function Pill({ ui, label, value, onClick }: { ui: Ui; label: string; value: string; onClick: () => void }) {
  return (
    <AutoLayout onClick={onClick} padding={{ vertical: 6, horizontal: 10 }} cornerRadius={8} fill={COLORS.surface} stroke={COLORS.border} strokeWidth={1} spacing={6} verticalAlignItems="center">
      {order(
        [
          <Text key="l" fontSize={LAYOUT.fontSizeSmall} fill={COLORS.textFaint} fontWeight={600}>
            {label}
          </Text>,
          <Text key="v" fontSize={LAYOUT.fontSizeBody} fill={COLORS.text} fontWeight={600}>
            {value}
          </Text>,
        ],
        ui.dir,
      )}
    </AutoLayout>
  )
}

export interface LensBarProps {
  ui: Ui
  groupBy: GroupBy
  sortKey: SortKey
  sortDir: SortDir
  onSetGroupBy: (g: GroupBy) => void
  onSetSortKey: (s: SortKey) => void
  onToggleSortDir: () => void
}

export function LensBar(props: LensBarProps) {
  const { t, dir } = props.ui
  const items = [
    <Pill key="group" ui={props.ui} label={t.groupByLabel} value={t.groupByOptions[props.groupBy]} onClick={() => props.onSetGroupBy(cycle(GROUP_BYS, props.groupBy))} />,
    <Pill key="sort" ui={props.ui} label={t.sortByLabel} value={t.sortKeyOptions[props.sortKey]} onClick={() => props.onSetSortKey(cycle(SORT_KEYS, props.sortKey))} />,
    <AutoLayout key="dir" onClick={props.onToggleSortDir} width={32} height={32} cornerRadius={8} fill={COLORS.surface} stroke={COLORS.border} strokeWidth={1} horizontalAlignItems="center" verticalAlignItems="center">
      <Text fontSize={LAYOUT.fontSizeBody} fill={COLORS.textMuted}>
        {props.sortDir === 'asc' ? '↑' : '↓'}
      </Text>
    </AutoLayout>,
  ]
  return (
    <AutoLayout spacing={8} verticalAlignItems="center">
      {order(items, dir)}
    </AutoLayout>
  )
}
