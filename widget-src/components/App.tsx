// Top-level presentational app: header, toolbar, card/table body, diagnostics.
// Receives the derived view model, the UI (language/direction) bundle, lock state,
// and callbacks from the registered widget.

import { COLORS, LAYOUT } from '../constants'
import { Ui, order } from '../i18n'
import { EditApi, GroupBy, SortDir, SortKey, TableMode, ViewMode, ViewModel } from '../types'
import { CardView } from './CardView'
import { ActionButton } from './FieldControls'
import { Header } from './Header'
import { LensBar } from './LensBar'
import { TableView } from './TableView'
import { GlobalControls, ViewToggle } from './Toolbar'

const { AutoLayout, Text } = figma.widget

export interface AppProps {
  vm: ViewModel
  ui: Ui
  locked: boolean
  viewMode: ViewMode
  tableMode: TableMode
  showArchived: boolean
  edit: EditApi
  groupBy: GroupBy
  sortKey: SortKey
  sortDir: SortDir
  onSetViewMode: (v: ViewMode) => void
  onSetTableMode: (m: TableMode) => void
  onToggleArchived: () => void
  onToggleExpanded: (id: string) => void
  onToggleLock: () => void
  onToggleLang: () => void
  onSetGroupBy: (g: GroupBy) => void
  onSetSortKey: (s: SortKey) => void
  onToggleSortDir: () => void
}

export function App(props: AppProps) {
  const { vm, ui } = props

  // Band 1 — identity + global controls: title/counts at the reading-start edge,
  // archived/language/lock grouped at the reading-end edge.
  const headerBand = (
    <AutoLayout key="topband" width="fill-parent" spacing={12} verticalAlignItems="start">
      {order(
        [
          <Header
            key="header"
            ui={ui}
            initiativeCount={vm.visibleInitiativeCount}
            taskCount={vm.visibleTaskCount}
            archivedHiddenCount={vm.archivedHiddenCount}
            showArchived={props.showArchived}
          />,
          <GlobalControls
            key="global"
            ui={ui}
            locked={props.locked}
            showArchived={props.showArchived}
            onToggleArchived={props.onToggleArchived}
            onToggleLock={props.onToggleLock}
            onToggleLang={props.onToggleLang}
          />,
        ],
        ui.dir,
      )}
    </AutoLayout>
  )

  // Hairline divider separating identity from the working controls (#8).
  const divider = <AutoLayout key="div" width="fill-parent" height={1} fill={COLORS.border} />

  // Band 2 — working controls: view-toggle (reading-start), lens (centre),
  // create actions (reading-end). spacing="auto" pushes the groups apart.
  const viewToggle = (
    <ViewToggle
      key="view"
      ui={ui}
      viewMode={props.viewMode}
      tableMode={props.tableMode}
      onSetViewMode={props.onSetViewMode}
      onSetTableMode={props.onSetTableMode}
    />
  )
  const lens = (
    <LensBar
      key="lens"
      ui={ui}
      groupBy={props.groupBy}
      sortKey={props.sortKey}
      sortDir={props.sortDir}
      onSetGroupBy={props.onSetGroupBy}
      onSetSortKey={props.onSetSortKey}
      onToggleSortDir={props.onToggleSortDir}
    />
  )
  const createGroup = (
    <AutoLayout key="create" spacing={8} verticalAlignItems="center">
      {order(
        [
          <ActionButton key="addCamp" label={ui.t.addCampaign} variant="neutral" onClick={props.edit.createCampaign} />,
          <ActionButton key="addInit" label={ui.t.addInitiative} variant="primary" onClick={() => props.edit.createInitiative(null)} />,
        ],
        ui.dir,
      )}
    </AutoLayout>
  )
  const controlsLogical = props.locked ? [viewToggle, lens] : [viewToggle, lens, createGroup]
  const controlsBand = (
    <AutoLayout key="controls" width="fill-parent" spacing="auto" verticalAlignItems="center">
      {order(controlsLogical, ui.dir)}
    </AutoLayout>
  )

  const body =
    props.viewMode === 'Cards' ? (
      <CardView
        key="body"
        vm={vm}
        ui={ui}
        locked={props.locked}
        campaigns={vm.filterOptions.campaigns}
        edit={props.edit}
        onToggleExpanded={props.onToggleExpanded}
      />
    ) : (
      <TableView key="body" vm={vm} ui={ui} tableMode={props.tableMode} />
    )

  const children = [headerBand, divider, controlsBand, body]

  if (vm.diagnostics.length > 0) {
    children.push(
      <AutoLayout key="diagnostics" direction="vertical" width="fill-parent" spacing={2} padding={10} cornerRadius={8} fill="#FEF6E7">
        {vm.diagnostics.map((d, idx) => (
          <Text key={`d_${idx}`} fontSize={LAYOUT.fontSizeSmall} fill="#9A6212">
            {`⚠ ${d.message}`}
          </Text>
        ))}
      </AutoLayout>,
    )
  }

  return (
    <AutoLayout
      direction="vertical"
      width={LAYOUT.widgetWidth}
      spacing={LAYOUT.sectionSpacing}
      padding={LAYOUT.contentPadding}
      cornerRadius={LAYOUT.cornerRadius}
      fill={COLORS.canvas}
      stroke={COLORS.border}
      strokeWidth={1}
    >
      {children}
    </AutoLayout>
  )
}
