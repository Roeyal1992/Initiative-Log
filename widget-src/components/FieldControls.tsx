// Reusable inline editing primitives: text field, chip selector, labeled field,
// action button, icon button, error text. RTL-aware. See 03_BUILD.md §15.11.

import { COLORS, LAYOUT } from '../constants'
import { formatLink, linkHref } from '../formatters'
import { Ui, order } from '../i18n'
import { Badge } from './Badge'

const { AutoLayout, Text, Input } = figma.widget

// Tap-to-expand single-select: shows the current value as a pill in a boxed field;
// tapping it reveals the options as chips inline. Used for campaign/status in edit mode.
export function Select<T extends string>({
  ui,
  open,
  value,
  options,
  onToggleOpen,
  onSelect,
}: {
  ui: Ui
  open: boolean
  value: T
  options: { value: T; label: string }[]
  onToggleOpen: () => void
  onSelect: (v: T) => void
}) {
  if (open) {
    return <Chips ui={ui} options={options} value={value} onSelect={onSelect} />
  }
  const current = options.find((o) => o.value === value)
  return (
    <AutoLayout
      onClick={onToggleOpen}
      width="fill-parent"
      verticalAlignItems="center"
      horizontalAlignItems={ui.dir === 'rtl' ? 'end' : 'start'}
      fill={COLORS.surface}
      stroke={COLORS.border}
      strokeWidth={1}
      cornerRadius={6}
      padding={{ vertical: 5, horizontal: 8 }}
    >
      <Badge text={current ? current.label : value} bg={COLORS.accent} fg="#FFFFFF" />
    </AutoLayout>
  )
}

// Hour estimate rendered as number + unit laid out by direction, so the unit sits
// left of the number in RTL (Hebrew) and right of it in LTR — no bidi string guesswork.
export function Hours({ ui, hours, fontSize }: { ui: Ui; hours: number; fontSize?: number }) {
  const size = fontSize ?? LAYOUT.fontSizeSmall
  return (
    <AutoLayout spacing={3} verticalAlignItems="center">
      {order(
        [
          <Text key="n" fontSize={size} fill={COLORS.textMuted}>
            {`${hours}`}
          </Text>,
          <Text key="u" fontSize={size} fill={COLORS.textMuted}>
            {ui.t.hoursUnit}
          </Text>,
        ],
        ui.dir,
      )}
    </AutoLayout>
  )
}

// Read-only clickable chip for a stored link (used in locked / view mode).
// Opens the URL via figma.openExternal on click.
export function LinkChip({ url }: { url: string }) {
  const href = linkHref(url)
  if (!href) {
    return (
      <Text fontSize={LAYOUT.fontSizeBody} fill={COLORS.textFaint}>
        —
      </Text>
    )
  }
  return (
    <AutoLayout
      fill={COLORS.surfaceSunken}
      cornerRadius={6}
      padding={{ vertical: 4, horizontal: 10 }}
      verticalAlignItems="center"
      onClick={() => figma.openExternal(href)}
    >
      <Text fontSize={LAYOUT.fontSizeSmall} fontWeight={600} fill={COLORS.accent}>
        {`↗ ${formatLink(url)}`}
      </Text>
    </AutoLayout>
  )
}

// Single- or multi-line text input that commits on blur / Enter.
export function TextField({
  ui,
  value,
  placeholder,
  onCommit,
  width,
  multiline,
  fontWeight,
}: {
  ui: Ui
  value: string
  placeholder?: string
  onCommit: (v: string) => void
  width?: number | 'fill-parent'
  multiline?: boolean
  fontWeight?: 400 | 500 | 600 | 700
}) {
  return (
    <Input
      value={value}
      placeholder={placeholder}
      width={width ?? 'fill-parent'}
      inputBehavior={multiline ? 'multiline' : 'wrap'}
      horizontalAlignText={ui.dir === 'rtl' ? 'right' : 'left'}
      fontSize={LAYOUT.fontSizeBody}
      fontWeight={fontWeight}
      fill={COLORS.text}
      inputFrameProps={{
        fill: COLORS.surface,
        stroke: COLORS.border,
        strokeWidth: 1,
        cornerRadius: 6,
        padding: { vertical: 6, horizontal: 8 },
      }}
      onTextEditEnd={(e) => onCommit(e.characters)}
    />
  )
}

export function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <AutoLayout
      onClick={onClick}
      padding={{ vertical: 4, horizontal: 10 }}
      cornerRadius={6}
      fill={active ? COLORS.accent : COLORS.surfaceSunken}
      verticalAlignItems="center"
    >
      <Text fontSize={LAYOUT.fontSizeSmall} fill={active ? '#FFFFFF' : COLORS.textMuted} fontWeight={active ? 600 : 500}>
        {label}
      </Text>
    </AutoLayout>
  )
}

// Single-select chip group. Generic over the option value type. RTL-aware ordering.
export function Chips<T extends string>({
  ui,
  options,
  value,
  onSelect,
}: {
  ui: Ui
  options: { value: T; label: string }[]
  value: T
  onSelect: (v: T) => void
}) {
  const chips = options.map((o) => (
    <Chip key={o.value} label={o.label} active={o.value === value} onClick={() => onSelect(o.value)} />
  ))
  return (
    <AutoLayout width="fill-parent" spacing={6} wrap={true}>
      {order(chips, ui.dir)}
    </AutoLayout>
  )
}

// Label + control, stacked vertically, with an optional (already-localized) error below.
export function LabeledField({
  ui,
  label,
  error,
  children,
}: {
  ui: Ui
  label: string
  error?: string
  children: FigmaDeclarativeNode
}) {
  const align = ui.dir === 'rtl' ? 'right' : 'left'
  const kids = [
    <Text key="label" width="fill-parent" horizontalAlignText={align} fontSize={LAYOUT.fontSizeSmall} fontWeight={600} fill={COLORS.textFaint}>
      {label}
    </Text>,
    children,
  ]
  if (error) {
    kids.push(
      <Text key="error" width="fill-parent" horizontalAlignText={align} fontSize={LAYOUT.fontSizeSmall} fill={COLORS.danger}>
        {error}
      </Text>,
    )
  }
  return (
    <AutoLayout direction="vertical" width="fill-parent" spacing={4}>
      {kids}
    </AutoLayout>
  )
}

export function ActionButton({
  label,
  onClick,
  variant,
}: {
  label: string
  onClick: () => void
  variant?: 'primary' | 'neutral' | 'danger'
}) {
  const styles =
    variant === 'primary'
      ? { fill: COLORS.accent, fg: '#FFFFFF', stroke: COLORS.accent }
      : variant === 'danger'
        ? { fill: COLORS.surface, fg: COLORS.danger, stroke: COLORS.border }
        : { fill: COLORS.surface, fg: COLORS.textMuted, stroke: COLORS.border }
  return (
    <AutoLayout onClick={onClick} padding={{ vertical: 6, horizontal: 12 }} cornerRadius={8} fill={styles.fill} stroke={styles.stroke} strokeWidth={1} verticalAlignItems="center">
      <Text fontSize={LAYOUT.fontSizeBody} fill={styles.fg} fontWeight={600}>
        {label}
      </Text>
    </AutoLayout>
  )
}

// Compact square button for a single glyph (pencil / done).
export function IconButton({ glyph, active, onClick }: { glyph: string; active?: boolean; onClick: () => void }) {
  return (
    <AutoLayout
      onClick={onClick}
      width={28}
      height={28}
      cornerRadius={6}
      fill={active ? COLORS.accent : COLORS.surfaceSunken}
      horizontalAlignItems="center"
      verticalAlignItems="center"
    >
      <Text fontSize={LAYOUT.fontSizeBody} fill={active ? '#FFFFFF' : COLORS.textMuted}>
        {glyph}
      </Text>
    </AutoLayout>
  )
}
