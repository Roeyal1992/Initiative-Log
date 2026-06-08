// Campaign-grouped card view (default experience). Unassigned section is first.

import { LAYOUT } from '../constants'
import { Ui } from '../i18n'
import { EditApi, FilterOption, ViewModel } from '../types'
import { CampaignSection } from './CampaignSection'
import { EmptyState } from './EmptyState'

const { AutoLayout } = figma.widget

export interface CardViewProps {
  vm: ViewModel
  ui: Ui
  locked: boolean
  campaigns: FilterOption[]
  edit: EditApi
  onToggleExpanded: (id: string) => void
}

export function CardView({ vm, ui, locked, campaigns, edit, onToggleExpanded }: CardViewProps) {
  let kids
  if (vm.isEmpty) {
    kids = [<EmptyState key="empty" message={ui.t.emptyNoInitiatives} />]
  } else if (vm.noResults) {
    kids = [<EmptyState key="noresults" message={ui.t.noResults} />]
  } else {
    kids = vm.sections.map((section) => (
      <CampaignSection
        key={section.id}
        section={section}
        ui={ui}
        locked={locked}
        campaigns={campaigns}
        edit={edit}
        onToggleExpanded={onToggleExpanded}
      />
    ))
  }
  return (
    <AutoLayout direction="vertical" width="fill-parent" spacing={LAYOUT.sectionSpacing}>
      {kids}
    </AutoLayout>
  )
}
