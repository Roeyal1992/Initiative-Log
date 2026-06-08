// Low-level badge primitive (colored pill with a text label).
// Shared by StatusBadge, PriorityBadge, and TaskStatusBadge.

import { LAYOUT } from '../constants'

const { AutoLayout, Text } = figma.widget

export interface BadgeProps {
  text: string
  bg: string
  fg: string
}

export function Badge({ text, bg, fg }: BadgeProps) {
  return (
    <AutoLayout
      fill={bg}
      cornerRadius={6}
      padding={{ vertical: 2, horizontal: 8 }}
      verticalAlignItems="center"
    >
      <Text fontSize={LAYOUT.fontSizeSmall} fill={fg} fontWeight={600}>
        {text}
      </Text>
    </AutoLayout>
  )
}
