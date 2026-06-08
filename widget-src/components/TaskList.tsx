// Task list within an expanded initiative card. Read-only rows, or editable rows
// + add-task action when the parent card is in edit mode.

import { COLORS, LAYOUT } from '../constants'
import { Ui } from '../i18n'
import { EditApi, TaskVM } from '../types'
import { ActionButton } from './FieldControls'
import { TaskRow } from './TaskRow'

const { AutoLayout, Text } = figma.widget

export interface TaskListProps {
  initiativeId: string
  tasks: TaskVM[]
  ui: Ui
  edit: EditApi
  editing: boolean
}

export function TaskList({ initiativeId, tasks, ui, edit, editing }: TaskListProps) {
  const { t, dir } = ui
  const align = dir === 'rtl' ? 'right' : 'left'
  const kids = [
    <Text key="th" width="fill-parent" horizontalAlignText={align} fontSize={LAYOUT.fontSizeSmall} fontWeight={700} fill={COLORS.textMuted}>
      {t.tasksHeading}
    </Text>,
  ]
  if (tasks.length === 0) {
    kids.push(
      <Text key="nt" width="fill-parent" horizontalAlignText={align} fontSize={LAYOUT.fontSizeBody} fill={COLORS.textFaint}>
        {t.emptyNoTasks}
      </Text>,
    )
  } else {
    tasks.forEach((tvm) => kids.push(<TaskRow key={tvm.task.id} task={tvm} ui={ui} edit={edit} editing={editing} />))
  }
  if (editing) {
    kids.push(
      <AutoLayout key="add">
        <ActionButton label={t.addTask} variant="neutral" onClick={() => edit.createTask(initiativeId)} />
      </AutoLayout>,
    )
  }
  return (
    <AutoLayout direction="vertical" width="fill-parent" spacing={6} padding={{ top: 4 }}>
      {kids}
    </AutoLayout>
  )
}
