// Expanded initiative card. Read-only by default; becomes an inline editor when
// the card is in edit mode (unlocked + pencil). RTL-aware, localized.
//
// Read mode shows only what the collapsed header does NOT already display
// (description, campaign, figma link, notes, tasks) to avoid duplication.
//
// Edit mode field order (from design):
//   description → [status | campaign] → [due | priority | owner] → figmaLink → notes → archive

import { COLORS, INITIATIVE_STATUSES, LAYOUT, PRIORITIES, UNASSIGNED_ID } from '../constants'
import { linkHref } from '../formatters'
import { Ui, order } from '../i18n'
import {
  EditApi,
  FilterOption,
  InitiativeCardVM,
  InitiativeStatus,
  Priority,
  errorKey,
} from '../types'
import { ActionButton, Chips, LabeledField, LinkChip, TextField } from './FieldControls'
import { TaskList } from './TaskList'

const { AutoLayout, Text } = figma.widget

export interface InitiativeExpandedContentProps {
  card: InitiativeCardVM
  ui: Ui
  campaigns: FilterOption[]
  edit: EditApi
  editing: boolean
}

function Divider() {
  return <AutoLayout width="fill-parent" height={1} fill={COLORS.divider} />
}

// Read-only "label above value" field, aligned to the reading-start side.
function ReadField({ ui, label, value }: { ui: Ui; label: string; value: string }) {
  const align = ui.dir === 'rtl' ? 'right' : 'left'
  return (
    <AutoLayout direction="vertical" width="fill-parent" spacing={1}>
      <Text width="fill-parent" horizontalAlignText={align} fontSize={LAYOUT.fontSizeSmall} fontWeight={600} fill={COLORS.textFaint}>
        {label}
      </Text>
      <Text width="fill-parent" horizontalAlignText={align} fontSize={LAYOUT.fontSizeBody} fill={COLORS.textMuted}>
        {value}
      </Text>
    </AutoLayout>
  )
}

// Like ReadField but the value is an arbitrary node (e.g. the link chip).
function ReadFieldNode({ ui, label, node }: { ui: Ui; label: string; node: FigmaDeclarativeNode }) {
  const align = ui.dir === 'rtl' ? 'right' : 'left'
  return (
    <AutoLayout direction="vertical" width="fill-parent" spacing={2}>
      <Text width="fill-parent" horizontalAlignText={align} fontSize={LAYOUT.fontSizeSmall} fontWeight={600} fill={COLORS.textFaint}>
        {label}
      </Text>
      <AutoLayout width="fill-parent" verticalAlignItems="center" horizontalAlignItems={ui.dir === 'rtl' ? 'end' : 'start'}>
        {node}
      </AutoLayout>
    </AutoLayout>
  )
}

function ReadOnlyView({ card, ui }: { card: InitiativeCardVM; ui: Ui }) {
  const { t } = ui
  const i = card.initiative
  const hasDesc = i.description.trim().length > 0
  const hasLink = linkHref(i.figmaLink) !== null
  const hasNotes = i.notes.trim().length > 0
  return (
    <AutoLayout direction="vertical" width="fill-parent" spacing={8}>
      {hasDesc && <ReadField ui={ui} label={t.fDescription} value={i.description.trim()} />}
      <ReadField ui={ui} label={t.fCampaign} value={card.campaignTitle} />
      {hasLink && <ReadFieldNode ui={ui} label={t.fFigmaLink} node={<LinkChip url={i.figmaLink} />} />}
      {hasNotes && <ReadField ui={ui} label={t.fNotes} value={i.notes.trim()} />}
    </AutoLayout>
  )
}

function EditView({ card, ui, campaigns, edit }: { card: InitiativeCardVM; ui: Ui; campaigns: FilterOption[]; edit: EditApi }) {
  const { t, dir } = ui
  const i = card.initiative
  const errFor = (field: string) => {
    const code = edit.errors[errorKey(i.id, field)]
    return code ? t.errors[code] || code : undefined
  }

  // Status chips — all initiative statuses
  const statusOptions = INITIATIVE_STATUSES.map((s) => ({ value: s, label: t.status[s] }))

  // Campaign chips — unassigned sentinel first, then all campaigns
  const campaignOptions = [
    { value: UNASSIGNED_ID, label: t.unassigned },
    ...campaigns.map((c) => ({ value: c.id, label: c.title })),
  ]
  const campaignValue = i.campaignId ?? UNASSIGNED_ID

  // Priority chips
  const priorityOptions = PRIORITIES.map((p) => ({ value: p, label: t.priority[p] }))

  return (
    <AutoLayout direction="vertical" width="fill-parent" spacing={10}>

      {/* Description */}
      <LabeledField ui={ui} label={t.fDescription}>
        <TextField ui={ui} value={i.description} placeholder={t.phDescription} multiline={true} onCommit={(v) => edit.setInitiativeField(i.id, 'description', v)} />
      </LabeledField>

      {/* Status + Campaign — each takes equal share of the row */}
      {/* order([campaign, status]) → RTL physical: status(left) | campaign(right=reading-start) */}
      <AutoLayout width="fill-parent" spacing={10}>
        {order(
          [
            <LabeledField key="campaign" ui={ui} label={t.fCampaign}>
              <Chips<string>
                ui={ui}
                options={campaignOptions}
                value={campaignValue}
                onSelect={(v) => edit.setInitiativeCampaign(i.id, v === UNASSIGNED_ID ? null : v)}
              />
            </LabeledField>,
            <LabeledField key="status" ui={ui} label={t.fStatus}>
              <Chips<InitiativeStatus>
                ui={ui}
                options={statusOptions}
                value={i.status}
                onSelect={(v) => edit.setInitiativeStatus(i.id, v)}
              />
            </LabeledField>,
          ],
          dir,
        )}
      </AutoLayout>

      {/* Due date + Priority + Owner — three equal columns */}
      {/* order([owner, priority, due]) → RTL physical: due(left) | priority(center) | owner(right=reading-start) */}
      <AutoLayout width="fill-parent" spacing={10}>
        {order(
          [
            <LabeledField key="owner" ui={ui} label={t.fOwner}>
              <TextField ui={ui} value={i.owner} placeholder={t.phOwner} onCommit={(v) => edit.setInitiativeField(i.id, 'owner', v)} />
            </LabeledField>,
            <LabeledField key="priority" ui={ui} label={t.fPriority}>
              <Chips<Priority> ui={ui} options={priorityOptions} value={i.priority} onSelect={(v) => edit.setInitiativePriority(i.id, v)} />
            </LabeledField>,
            <LabeledField key="due" ui={ui} label={t.fDueDate} error={errFor('dueDate')}>
              <TextField ui={ui} value={i.dueDate ?? ''} placeholder={t.phDueDate} onCommit={(v) => edit.setInitiativeField(i.id, 'dueDate', v)} />
            </LabeledField>,
          ],
          dir,
        )}
      </AutoLayout>

      {/* Figma link */}
      <LabeledField ui={ui} label={t.fFigmaLink}>
        <TextField ui={ui} value={i.figmaLink} placeholder={t.phFigmaLink} onCommit={(v) => edit.setInitiativeField(i.id, 'figmaLink', v)} />
      </LabeledField>

      {/* Notes */}
      <LabeledField ui={ui} label={t.fNotes}>
        <TextField ui={ui} value={i.notes} placeholder={t.phNotes} multiline={true} onCommit={(v) => edit.setInitiativeField(i.id, 'notes', v)} />
      </LabeledField>

      {/* Archive / restore */}
      <AutoLayout width="fill-parent" spacing={8} verticalAlignItems="center">
        {i.archived ? (
          <ActionButton label={t.restore} variant="neutral" onClick={() => edit.unarchiveInitiative(i.id)} />
        ) : (
          <ActionButton label={t.archive} variant="danger" onClick={() => edit.archiveInitiative(i.id)} />
        )}
      </AutoLayout>

    </AutoLayout>
  )
}

export function InitiativeExpandedContent({ card, ui, campaigns, edit, editing }: InitiativeExpandedContentProps) {
  return (
    <AutoLayout direction="vertical" width="fill-parent" spacing={8}>
      <Divider />
      {editing ? (
        <EditView card={card} ui={ui} campaigns={campaigns} edit={edit} />
      ) : (
        <ReadOnlyView card={card} ui={ui} />
      )}
      <Divider />
      <TaskList initiativeId={card.initiative.id} tasks={card.tasks} ui={ui} edit={edit} editing={editing} />
    </AutoLayout>
  )
}
