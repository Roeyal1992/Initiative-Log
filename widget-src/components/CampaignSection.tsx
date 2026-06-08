// A section in the card view. Under campaign grouping it shows an editable title
// and a per-campaign add action; under other lenses (priority/status/owner/none)
// it's a read-only group header with a capacity total. RTL-aware.

import { COLORS, LAYOUT } from '../constants'
import { Ui, order } from '../i18n'
import { CampaignSectionVM, EditApi, FilterOption, errorKey } from '../types'
import { EmptyState } from './EmptyState'
import { ActionButton, IconButton, TextField } from './FieldControls'
import { InitiativeCard } from './InitiativeCard'

const { AutoLayout, Text } = figma.widget

export interface CampaignSectionProps {
  section: CampaignSectionVM
  ui: Ui
  locked: boolean
  campaigns: FilterOption[]
  edit: EditApi
  onToggleExpanded: (id: string) => void
}

export function CampaignSection({ section, ui, locked, campaigns, edit, onToggleExpanded }: CampaignSectionProps) {
  const { t, dir } = ui
  const align = dir === 'rtl' ? 'right' : 'left'
  const isCampaign = section.kind === 'campaign'
  const canAddHere = !locked && (section.kind === 'campaign' || section.kind === 'unassigned')
  const editing = !locked && isCampaign && edit.editingIds.includes(section.id)
  // Only surface a campaign-title error while actually editing this campaign.
  const errCode = editing ? edit.errors[errorKey(section.id, 'title')] : undefined
  const totalLabel = section.totalHours > 0 ? `${section.totalHours} ${t.hoursUnit}` : ''

  const cards = section.cards.map((card) => (
    <InitiativeCard
      key={card.initiative.id}
      card={card}
      ui={ui}
      locked={locked}
      campaigns={campaigns}
      edit={edit}
      onToggleExpanded={onToggleExpanded}
    />
  ))

  // No header for the flat ("group by: none") lens.
  if (section.kind === 'flat') {
    const flatKids = cards.length > 0 ? cards : [<EmptyState key="empty" message={t.emptyNoInitiatives} />]
    return (
      <AutoLayout direction="vertical" width="fill-parent" spacing={LAYOUT.cardSpacing}>
        {flatKids}
      </AutoLayout>
    )
  }

  const titleNode = editing ? (
    <AutoLayout width={280}>
      <TextField ui={ui} value={section.title} placeholder={t.phCampaignTitle} fontWeight={700} onCommit={(v) => edit.updateCampaignTitle(section.id, v)} />
    </AutoLayout>
  ) : (
    <Text fontSize={12} fontWeight={400} fill={COLORS.textMuted} horizontalAlignText={align}>
      {section.title}
    </Text>
  )

  const countNode = (
    <Text key="count" fontSize={LAYOUT.fontSizeSmall} fill={COLORS.textFaint}>
      {`${section.initiativeCount}`}
    </Text>
  )

  const hoursNode = totalLabel ? (
    <Text key="hours" fontSize={LAYOUT.fontSizeSmall} fill={COLORS.textMuted}>
      {totalLabel}
    </Text>
  ) : null

  // Name + count grouped together on the reading-start side.
  const startAlign = dir === 'rtl' ? 'end' : 'start'
  const nameGroup = (
    <AutoLayout key="nameGroup" spacing={8} verticalAlignItems="center" horizontalAlignItems={startAlign}>
      {order(
        [
          <AutoLayout key="title" verticalAlignItems="center">
            {titleNode}
          </AutoLayout>,
          countNode,
        ],
        dir,
      )}
    </AutoLayout>
  )

  const actionItems = []
  if (isCampaign && !locked) {
    actionItems.push(<IconButton key="pencil" glyph={editing ? '✓' : '✎'} active={editing} onClick={() => edit.toggleEditing(section.id)} />)
  }
  if (canAddHere) {
    actionItems.push(
      <ActionButton
        key="add"
        label={t.addInitiative}
        variant="neutral"
        onClick={() => edit.createInitiative(section.kind === 'unassigned' ? null : section.id)}
      />,
    )
  }

  const header =
    actionItems.length > 0 ? (
      // Unlocked: actions on reading-end, name+count+hours on reading-start.
      <AutoLayout key="head" width="fill-parent" verticalAlignItems="center" spacing={8}>
        {order(
          [
            <AutoLayout key="left" width="fill-parent" spacing={8} verticalAlignItems="center" horizontalAlignItems={startAlign}>
              {order([nameGroup, ...(hoursNode ? [hoursNode] : [])], dir)}
            </AutoLayout>,
            <AutoLayout key="actions" spacing={8} verticalAlignItems="center">
              {order(actionItems, dir)}
            </AutoLayout>,
          ],
          dir,
        )}
      </AutoLayout>
    ) : hoursNode ? (
      // Locked with hours: name+count on reading-start, hours pushed to reading-end.
      <AutoLayout key="head" width="fill-parent" verticalAlignItems="center" spacing="auto">
        {order([nameGroup, hoursNode], dir)}
      </AutoLayout>
    ) : (
      // Locked without hours (empty group): name+count on reading-start only.
      <AutoLayout key="head" width="fill-parent" verticalAlignItems="center" spacing={8} horizontalAlignItems={startAlign}>
        {nameGroup}
      </AutoLayout>
    )
  const kids = [header]

  if (errCode) {
    kids.push(
      <Text key="terr" fontSize={LAYOUT.fontSizeSmall} fill={COLORS.danger} horizontalAlignText={align}>
        {t.errors[errCode] || errCode}
      </Text>,
    )
  }

  if (section.isEmpty) {
    kids.push(<EmptyState key="empty" message={t.emptyNoCampaignInitiatives} />)
  } else {
    cards.forEach((c) => kids.push(c))
  }

  // Populated groups get more breathing room between header and cards.
  const innerSpacing = section.isEmpty ? LAYOUT.cardSpacing : 8
  return (
    <AutoLayout direction="vertical" width="fill-parent" spacing={innerSpacing}>
      {kids}
    </AutoLayout>
  )
}
