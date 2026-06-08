// Readable empty / no-results message block.

import { COLORS, LAYOUT } from '../constants'

const { AutoLayout, Text } = figma.widget

export function EmptyState({ message }: { message: string }) {
  return (
    <AutoLayout
      width="fill-parent"
      padding={16}
      cornerRadius={8}
      fill={COLORS.surfaceAlt}
      horizontalAlignItems="center"
    >
      <Text fontSize={LAYOUT.fontSizeBody} fill={COLORS.textMuted}>
        {message}
      </Text>
    </AutoLayout>
  )
}
