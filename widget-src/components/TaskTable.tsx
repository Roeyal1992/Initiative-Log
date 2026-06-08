// Dense task table (one row per task). Shows initiative due date, not task due date.
// Localized + RTL-aware.

import { COLORS, LAYOUT, STATUS_COLORS, TASK_STATUS_COLORS } from '../constants'
import { formatDueDate, formatEmpty } from '../formatters'
import { Ui, order } from '../i18n'
import { TaskTableRowVM } from '../types'
import { EmptyState } from './EmptyState'

const { AutoLayout, Text } = figma.widget

interface Cell {
  key: string
  text: string
  w: number
  color: string
  weight: 400 | 600 | 700
}

export function TaskTable({ rows, ui }: { rows: TaskTableRowVM[]; ui: Ui }) {
  const { t, dir } = ui
  const align = dir === 'rtl' ? 'right' : 'left'
  if (rows.length === 0) return <EmptyState message={ui.t.noResults} />

  const headerCols: { key: string; label: string; w: number }[] = [
    { key: 'campaign', label: t.thCampaign, w: 64 },
    { key: 'initiative', label: t.thInitiative, w: 100 },
    { key: 'task', label: t.thTask, w: 116 },
    { key: 'assignee', label: t.thAssignee, w: 56 },
    { key: 'tstatus', label: t.thTaskStatus, w: 74 },
    { key: 'estimate', label: t.thEstimate, w: 78 },
    { key: 'istatus', label: t.thInitStatus, w: 74 },
    { key: 'idue', label: t.thInitDue, w: 60 },
    { key: 'notes', label: t.thNotes, w: 56 },
  ]

  const renderCell = (c: Cell) => (
    <Text key={c.key} width={c.w} horizontalAlignText={align} fontSize={LAYOUT.fontSizeSmall} fill={c.color} fontWeight={c.weight}>
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
    const tk = row.task
    const cells: Cell[] = [
      { key: 'campaign', text: row.campaignTitle, w: 64, color: COLORS.textMuted, weight: 400 },
      { key: 'initiative', text: row.initiativeTitle, w: 100, color: COLORS.text, weight: 400 },
      { key: 'task', text: tk.title, w: 116, color: COLORS.text, weight: 600 },
      { key: 'assignee', text: formatEmpty(tk.assignee), w: 56, color: COLORS.textMuted, weight: 400 },
      { key: 'tstatus', text: t.taskStatus[tk.status], w: 74, color: TASK_STATUS_COLORS[tk.status].fg, weight: 600 },
      { key: 'estimate', text: tk.estimateHours > 0 ? `${tk.estimateHours} ${t.hoursUnit}` : '—', w: 78, color: COLORS.textMuted, weight: 400 },
      { key: 'istatus', text: t.status[row.initiativeStatus], w: 74, color: STATUS_COLORS[row.initiativeStatus].fg, weight: 600 },
      { key: 'idue', text: formatDueDate(row.initiativeDueDate), w: 60, color: COLORS.textMuted, weight: 400 },
      { key: 'notes', text: row.notesPreview, w: 56, color: COLORS.textFaint, weight: 400 },
    ]
    out.push(
      <AutoLayout
        key={tk.id}
        width="fill-parent"
        spacing={6}
        padding={{ vertical: 6, horizontal: 6 }}
        fill={COLORS.surface}
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
