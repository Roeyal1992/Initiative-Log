// Concentrated table view; switches between initiative and task tables.

import { Ui } from '../i18n'
import { TableMode, ViewModel } from '../types'
import { EmptyState } from './EmptyState'
import { InitiativeTable } from './InitiativeTable'
import { TaskTable } from './TaskTable'

export interface TableViewProps {
  vm: ViewModel
  ui: Ui
  tableMode: TableMode
}

export function TableView({ vm, ui, tableMode }: TableViewProps) {
  if (vm.isEmpty) return <EmptyState message={ui.t.emptyNoInitiatives} />
  return tableMode === 'Initiatives' ? (
    <InitiativeTable rows={vm.initiativeRows} ui={ui} />
  ) : (
    <TaskTable rows={vm.taskRows} ui={ui} />
  )
}
