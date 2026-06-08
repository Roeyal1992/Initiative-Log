// Dense initiative table (one row per initiative). Localized + RTL-aware.

import { COLORS, LAYOUT, META_COLS, PRIORITY_COLORS, STATUS_COLORS } from '../constants'
import { formatDueDate, formatEmpty, linkHref } from '../formatters'
import { Ui, order } from '../i18n'
import { normalizePriority } from '../sort'
import { InitiativeTableRowVM } from '../types'
import { EmptyState } from './EmptyState'
import { Hours } from './FieldControls'

const { AutoLayout, Text } = figma.widget

interface Cell {
  key: string
  text: string
  w: number
  color: string
  weight: 400 | 600 | 700
  onClick?: () => void // when set, the cell becomes clickable (opens a link)
  node?: FigmaDeclarativeNode // when set, renders this instead of the text
}

export function InitiativeTable({ rows, ui }: { rows: InitiativeTableRowVM[]; ui: Ui }) {
  const { t, dir } = ui
  const align = dir === 'rtl' ? 'right' : 'left'
  if (rows.length === 0) return <EmptyState message={ui.t.noResults} />

  const headerCols: { key: string; label: string; w: number }[] = [
    { key: 'campaign', label: t.thCampaign, w: 84 },
    { key: 'title', label: t.thInitiative, w: 128 },
    { key: 'owner', label: t.thOwner, w: META_COLS.owner },
    { key: 'status', label: t.thStatus, w: META_COLS.status },
    { key: 'priority', label: t.thPriority, w: META_COLS.priority },
    { key: 'due', label: t.thDue, w: META_COLS.due },
    { key: 'progress', label: t.thProgress, w: META_COLS.progress },
    { key: 'estimate', label: t.thEstimate, w: META_COLS.estimate },
    { key: 'link', label: t.thLink, w: 40 },
  ]

  const renderCell = (c: Cell) =>
    c.node ? (
      <AutoLayout key={c.key} width={c.w} verticalAlignItems="center" horizontalAlignItems={dir === 'rtl' ? 'end' : 'start'}>
        {c.node}
      </AutoLayout>
    ) : (
      <Text key={c.key} width={c.w} horizontalAlignText={align} fontSize={LAYOUT.fontSizeSmall} fill={c.color} fontWeight={c.weight} onClick={c.onClick}>
        {c.text}
      </Text>
    )

  const out = [
    <AutoLayout key="thead" width="fill-parent" spacing={6} padding={{ vertical: 6, horizontal: 6 }} fill={COLORS.surfaceSunken}>
      {order(
        headerCols.map((c) => (
          <Text key={c.key} width={c.w} horizontalAlignText={align} fontSize={LAYOUT.fontSizeSmall} fontWeight={700} fill={COLORS.textMuted}>
            {c.label}
          </Text>
        )),
        dir,
      )}
    </AutoLayout>,
  ]

  rows.forEach((row) => {
    const i = row.initiative
    const prio = normalizePriority(i.priority)
    const lh = linkHref(i.figmaLink)
    const cells: Cell[] = [
      { key: 'campaign', text: row.campaignTitle, w: 84, color: COLORS.textMuted, weight: 400 },
      { key: 'title', text: i.title, w: 128, color: COLORS.text, weight: 600 },
      { key: 'owner', text: formatEmpty(i.owner), w: META_COLS.owner, color: COLORS.textMuted, weight: 400 },
      { key: 'status', text: t.status[i.status], w: META_COLS.status, color: STATUS_COLORS[i.status].fg, weight: 600 },
      { key: 'priority', text: t.priority[prio], w: META_COLS.priority, color: PRIORITY_COLORS[prio].fg, weight: 600 },
      { key: 'due', text: formatDueDate(i.dueDate), w: META_COLS.due, color: COLORS.textMuted, weight: 400 },
      { key: 'progress', text: row.progress.total > 0 ? `${row.progress.done}/${row.progress.total}` : '—', w: META_COLS.progress, color: COLORS.textMuted, weight: 400 },
      { key: 'estimate', text: '—', w: META_COLS.estimate, color: COLORS.textMuted, weight: 400, node: row.estimateHours > 0 ? <Hours ui={ui} hours={row.estimateHours} /> : undefined },
      { key: 'link', text: lh ? '↗' : '—', w: 40, color: COLORS.accent, weight: 600, onClick: lh ? () => figma.openExternal(lh) : undefined },
    ]
    out.push(
      <AutoLayout
        key={i.id}
        width="fill-parent"
        spacing={6}
        padding={{ vertical: 6, horizontal: 6 }}
        fill={i.archived ? COLORS.archivedTint : COLORS.surface}
        verticalAlignItems="center"
      >
        {order(cells.map(renderCell), dir)}
      </AutoLayout>,
    )
  })

  return (
    <AutoLayout direction="vertical" width="fill-parent" spacing={1} fill={COLORS.divider} cornerRadius={6}>
      {out}
    </AutoLayout>
  )
}
