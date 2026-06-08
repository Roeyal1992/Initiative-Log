// Collapsible initiative card: a compact scan row plus expanded detail/editor.
// In edit mode the header collapses to [✓ save | hours] ... [title TextField | ▾].

import { CARD_SHADOW, COLORS, LAYOUT, META_COLS } from '../constants'
import { formatDueDate, formatEmpty } from '../formatters'
import { Ui, order } from '../i18n'
import { EditApi, FilterOption, InitiativeCardVM } from '../types'
import { Hours, IconButton, TextField } from './FieldControls'
import { InitiativeExpandedContent } from './InitiativeExpandedContent'
import { PriorityBadge } from './PriorityBadge'
import { StatusBadge } from './StatusBadge'

const { AutoLayout, Text } = figma.widget

export interface InitiativeCardProps {
  card: InitiativeCardVM
  ui: Ui
  locked: boolean
  campaigns: FilterOption[]
  edit: EditApi
  onToggleExpanded: (id: string) => void
}

export function InitiativeCard({ card, ui, locked, campaigns, edit, onToggleExpanded }: InitiativeCardProps) {
  const { t, dir } = ui
  const i = card.initiative
  const editing = !locked && edit.editingIds.includes(i.id)
  const caret = card.expanded ? '▾' : dir === 'rtl' ? '◂' : '▸'

  // ── Edit-mode header ──────────────────────────────────────────────────────
  // Reading-start side: title (editable TextField) + collapse caret.
  // Reading-end side:   ✓ save button + estimated hours slot.
  // order() places the reading-start group on the right in RTL, left in LTR.
  const editHeader = (
    <AutoLayout key="head" width="fill-parent" verticalAlignItems="center" spacing={8}>
      {order(
        [
          // Reading-start: title field + caret
          <AutoLayout key="titlegroup" width="fill-parent" spacing={8} verticalAlignItems="center">
            {order(
              [
                // caret first in order() = reading-start convention;
                // RTL reversal → physical: title(left) | caret(right) — matching design
                <AutoLayout key="caret" width={14} verticalAlignItems="center" onClick={() => onToggleExpanded(i.id)}>
                  <Text fontSize={LAYOUT.fontSizeBody} fill={COLORS.textFaint}>{caret}</Text>
                </AutoLayout>,
                <AutoLayout key="titlefield" width="fill-parent">
                  <TextField
                    ui={ui}
                    value={i.title}
                    placeholder={t.phInitiativeTitle}
                    fontWeight={600}
                    onCommit={(v) => edit.setInitiativeField(i.id, 'title', v)}
                  />
                </AutoLayout>,
              ],
              dir,
            )}
          </AutoLayout>,
          // Reading-end: save button + hours slot (physical order same in both directions)
          <AutoLayout key="controls" spacing={10} verticalAlignItems="center">
            <IconButton key="save" glyph="✓" active={true} onClick={() => edit.toggleEditing(i.id)} />
            <AutoLayout key="hours-slot" width={80} verticalAlignItems="center">
              {card.estimateHours > 0 ? <Hours ui={ui} hours={card.estimateHours} /> : null}
            </AutoLayout>
          </AutoLayout>,
        ],
        dir,
      )}
    </AutoLayout>
  )

  // ── Normal (read-only or locked) header ──────────────────────────────────
  // Each metadata element sits in a fixed-width slot so columns line up
  // vertically across cards. Content hugs the reading-start edge of its slot.
  const startAlign = dir === 'rtl' ? 'end' : 'start'
  const metaText = (s: string) => (
    <Text fontSize={LAYOUT.fontSizeSmall} fill={COLORS.textMuted}>
      {s}
    </Text>
  )
  const metaCol = (key: string, width: number, node: FigmaDeclarativeNode) => (
    <AutoLayout key={key} width={width} verticalAlignItems="center" horizontalAlignItems={startAlign}>
      {node}
    </AutoLayout>
  )

  const progressLabel = card.progress.total > 0 ? `${card.progress.done}/${card.progress.total}` : '—'

  const titleArea = (
    <AutoLayout key="titlecol" width="fill-parent" verticalAlignItems="center" spacing={8} onClick={() => onToggleExpanded(i.id)}>
      {order(
        [
          <Text key="caret" width={14} fontSize={LAYOUT.fontSizeBody} fill={COLORS.textFaint}>
            {caret}
          </Text>,
          <Text
            key="title"
            width="fill-parent"
            horizontalAlignText={dir === 'rtl' ? 'right' : 'left'}
            fontSize={LAYOUT.fontSizeHeading}
            fontWeight={600}
            fill={COLORS.text}
          >
            {i.title}
          </Text>,
        ],
        dir,
      )}
    </AutoLayout>
  )

  const logicalRow = [
    titleArea,
    metaCol('owner', META_COLS.owner, metaText(formatEmpty(i.owner))),
    metaCol('status', META_COLS.status, <StatusBadge status={i.status} t={t} />),
    metaCol('prio', META_COLS.priority, <PriorityBadge priority={i.priority} t={t} />),
    metaCol('due', META_COLS.due, metaText(formatDueDate(i.dueDate))),
    metaCol('prog', META_COLS.progress, metaText(progressLabel)),
    metaCol('hours', META_COLS.estimate, card.estimateHours > 0 ? <Hours ui={ui} hours={card.estimateHours} /> : metaText('—')),
  ]
  if (!locked) {
    logicalRow.push(
      <AutoLayout key="pencil" width={28} verticalAlignItems="center" horizontalAlignItems={startAlign}>
        <IconButton glyph="✎" active={false} onClick={() => edit.toggleEditing(i.id)} />
      </AutoLayout>,
    )
  }

  const normalHeader = (
    <AutoLayout key="head" width="fill-parent" verticalAlignItems="center" spacing={10}>
      {order(logicalRow, dir)}
    </AutoLayout>
  )

  // ── Assemble ─────────────────────────────────────────────────────────────
  const kids = [editing ? editHeader : normalHeader]
  if (card.expanded) {
    kids.push(
      <InitiativeExpandedContent key="exp" card={card} ui={ui} campaigns={campaigns} edit={edit} editing={editing} />,
    )
  }

  return (
    <AutoLayout
      direction="vertical"
      width="fill-parent"
      spacing={8}
      padding={12}
      cornerRadius={LAYOUT.cardCornerRadius}
      fill={i.archived ? COLORS.archivedTint : COLORS.surface}
      stroke={COLORS.divider}
      strokeWidth={1}
      effect={i.archived ? [] : CARD_SHADOW}
    >
      {kids}
    </AutoLayout>
  )
}
