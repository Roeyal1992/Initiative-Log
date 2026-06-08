// Upper-section controls, split into two hugging groups so App can place them in
// the right band:
//   - GlobalControls: archived / language / lock (global "decisions", top band)
//   - ViewToggle: card/table view mode (+ table sub-mode), working-controls band
// RTL-aware ordering. The lock is icon-only by design.

import { COLORS, LAYOUT, TABLE_MODES } from '../constants'
import { Ui, order } from '../i18n'
import { TableMode, ViewMode } from '../types'
import { ActionButton } from './FieldControls'

const { AutoLayout, Text } = figma.widget

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <AutoLayout
      onClick={onClick}
      padding={{ vertical: 6, horizontal: 12 }}
      cornerRadius={8}
      fill={active ? COLORS.accent : COLORS.surface}
      stroke={active ? COLORS.accent : COLORS.border}
      strokeWidth={1}
      verticalAlignItems="center"
    >
      <Text fontSize={LAYOUT.fontSizeBody} fill={active ? '#FFFFFF' : COLORS.textMuted} fontWeight={active ? 600 : 500}>
        {label}
      </Text>
    </AutoLayout>
  )
}

export interface GlobalControlsProps {
  ui: Ui
  locked: boolean
  showArchived: boolean
  onToggleArchived: () => void
  onToggleLock: () => void
  onToggleLang: () => void
}

// Global, always-available decisions: archived visibility, language, and the lock.
export function GlobalControls(props: GlobalControlsProps) {
  const { t, dir } = props.ui
  const items = [
    <Tab key="arch" label={props.showArchived ? t.hideArchived : t.showArchived} active={props.showArchived} onClick={props.onToggleArchived} />,
    <Tab key="lang" label={t.switchLang} active={false} onClick={props.onToggleLang} />,
    // Lock is icon-only by design; primary fill when locked to read as the active safety state.
    <ActionButton key="lock" label={props.locked ? '🔒' : '🔓'} variant={props.locked ? 'primary' : 'neutral'} onClick={props.onToggleLock} />,
  ]
  return (
    <AutoLayout spacing={8} verticalAlignItems="center">
      {order(items, dir)}
    </AutoLayout>
  )
}

export interface ViewToggleProps {
  ui: Ui
  viewMode: ViewMode
  tableMode: TableMode
  onSetViewMode: (v: ViewMode) => void
  onSetTableMode: (m: TableMode) => void
}

// Card/Table view switch, with the table sub-mode tabs appended in table view.
export function ViewToggle(props: ViewToggleProps) {
  const { t, dir } = props.ui
  const tabs = [
    <Tab key="cards" label={t.cards} active={props.viewMode === 'Cards'} onClick={() => props.onSetViewMode('Cards')} />,
    <Tab key="table" label={t.table} active={props.viewMode === 'Table'} onClick={() => props.onSetViewMode('Table')} />,
  ]
  if (props.viewMode === 'Table') {
    tabs.push(<AutoLayout key="sep" width={1} height={20} fill={COLORS.divider} />)
    const labelFor = (m: TableMode) => (m === 'Initiatives' ? t.initiatives : t.tasks)
    TABLE_MODES.forEach((m) =>
      tabs.push(<Tab key={`tm_${m}`} label={labelFor(m)} active={props.tableMode === m} onClick={() => props.onSetTableMode(m)} />),
    )
  }
  return (
    <AutoLayout spacing={8} verticalAlignItems="center">
      {order(tabs, dir)}
    </AutoLayout>
  )
}
