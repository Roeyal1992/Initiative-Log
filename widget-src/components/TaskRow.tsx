// A task inside an expanded initiative card. Read-only line, or editable block
// when the parent card is in edit mode. RTL-aware, localized. Includes hour estimate.

import { COLORS, LAYOUT, TASK_STATUSES } from '../constants'
import { formatEmpty, notesPreview } from '../formatters'
import { Ui, order } from '../i18n'
import { EditApi, TaskStatus, TaskVM, errorKey } from '../types'
import { Chips, Hours, IconButton, TextField } from './FieldControls'
import { TaskStatusBadge } from './TaskStatusBadge'

const { AutoLayout, Text } = figma.widget

export interface TaskRowProps {
  task: TaskVM
  ui: Ui
  edit: EditApi
  editing: boolean
}

function ReadOnly({ task: tvm, ui }: { task: TaskVM; ui: Ui }) {
  const { dir } = ui
  const tk = tvm.task
  const startAlign = dir === 'rtl' ? 'end' : 'start'
  const textAlign = dir === 'rtl' ? 'right' : 'left'
  // Fixed-width slots so assignee / status / hours line up across task rows.
  const slot = (key: string, width: number, node: FigmaDeclarativeNode) => (
    <AutoLayout key={key} width={width} verticalAlignItems="center" horizontalAlignItems={startAlign}>
      {node}
    </AutoLayout>
  )
  const muted = (s: string) => (
    <Text fontSize={LAYOUT.fontSizeSmall} fill={COLORS.textMuted}>
      {s}
    </Text>
  )
  const hasNotes = (tk.notes ?? '').trim().length > 0
  const items = [
    <Text key="title" width="fill-parent" horizontalAlignText={textAlign} fontSize={LAYOUT.fontSizeBody} fill={COLORS.text}>
      {tk.title}
    </Text>,
    slot('assignee', 70, muted(formatEmpty(tk.assignee))),
    slot('status', 72, <TaskStatusBadge status={tk.status} t={ui.t} />),
    slot('hours', 56, tk.estimateHours > 0 ? <Hours ui={ui} hours={tk.estimateHours} /> : muted('—')),
    ...(hasNotes
      ? [
          <Text key="notes" width="fill-parent" horizontalAlignText={textAlign} fontSize={LAYOUT.fontSizeSmall} fill={COLORS.textFaint}>
            {notesPreview(tk.notes)}
          </Text>,
        ]
      : []),
  ]
  return (
    <AutoLayout width="fill-parent" verticalAlignItems="center" spacing={8}>
      {order(items, dir)}
    </AutoLayout>
  )
}

function Editable({ task: tvm, ui, edit }: { task: TaskVM; ui: Ui; edit: EditApi }) {
  const { t, dir } = ui
  const tk = tvm.task
  const statusOptions = TASK_STATUSES.map((s) => ({ value: s, label: t.taskStatus[s] }))
  const titleErrCode = edit.errors[errorKey(tk.id, 'title')]

  const titleRow = (
    <AutoLayout key="titleRow" width="fill-parent" spacing={8} verticalAlignItems="center">
      {order(
        [
          <AutoLayout key="title" width="fill-parent">
            <TextField ui={ui} value={tk.title} placeholder={t.phTaskTitle} fontWeight={600} onCommit={(v) => edit.setTaskField(tk.id, 'title', v)} />
          </AutoLayout>,
          <IconButton key="act" glyph="🗑️" active={false} onClick={() => edit.deleteTask(tk.id)} />,
        ],
        dir,
      )}
    </AutoLayout>
  )

  const kids = [titleRow]
  if (titleErrCode) {
    kids.push(
      <Text key="err" fontSize={LAYOUT.fontSizeSmall} fill={COLORS.danger}>
        {t.errors[titleErrCode] || titleErrCode}
      </Text>,
    )
  }
  kids.push(
    <AutoLayout key="meta" width="fill-parent" spacing={8} verticalAlignItems="center" wrap={true}>
      {order(
        [
          <TextField key="assignee" ui={ui} value={tk.assignee} placeholder={t.phAssignee} width={150} onCommit={(v) => edit.setTaskField(tk.id, 'assignee', v)} />,
          <TextField key="hours" ui={ui} value={`${tk.estimateHours || 0}`} placeholder={t.phEstimate} width={90} onCommit={(v) => edit.setTaskEstimate(tk.id, v)} />,
          <Chips<TaskStatus> key="status" ui={ui} options={statusOptions} value={tk.status} onSelect={(v) => edit.setTaskStatus(tk.id, v)} />,
        ],
        dir,
      )}
    </AutoLayout>,
    <AutoLayout key="notes" width="fill-parent">
      <TextField ui={ui} value={tk.notes} placeholder={t.phNotes} multiline={true} onCommit={(v) => edit.setTaskField(tk.id, 'notes', v)} />
    </AutoLayout>,
  )

  return (
    <AutoLayout direction="vertical" width="fill-parent" spacing={6}>
      {kids}
    </AutoLayout>
  )
}

export function TaskRow({ task, ui, edit, editing }: TaskRowProps) {
  return (
    <AutoLayout
      direction="vertical"
      width="fill-parent"
      spacing={6}
      padding={8}
      cornerRadius={8}
      fill={COLORS.surfaceAlt}
    >
      {editing ? <Editable task={task} ui={ui} edit={edit} /> : <ReadOnly task={task} ui={ui} />}
    </AutoLayout>
  )
}
