// Browser shim that emulates just enough of the Figma widget runtime to render the
// REAL widget components/logic in a VS Code Simple Browser for fast UX iteration.
//
// FIDELITY WARNING: AutoLayout is approximated with CSS flexbox. This is good for
// content, copy, RTL, spacing and layout structure — but it does NOT reproduce
// Figma's AutoLayout sizing quirks. Figma remains the source of truth for pixel/
// layout-quirk fidelity. Installs a global `figma` on import (side effect).

interface VNode {
  type: any
  props: any
  children: any[]
}

const store: Record<string, any> = {}
const mapStore: Record<string, Map<string, any>> = {}
let rootComponent: (() => any) | null = null
let container: HTMLElement | null = null
let scheduled = false

function scheduleRerender() {
  if (scheduled) return
  scheduled = true
  queueMicrotask(() => {
    scheduled = false
    renderApp()
  })
}

function h(type: any, props: any, ...children: any[]): VNode {
  return { type, props: props || {}, children: children.flat(Infinity) }
}

// --- style mapping ---

function colorToCss(c: any): string {
  if (typeof c === 'string') return c
  if (c && typeof c === 'object') {
    const { r = 0, g = 0, b = 0, a = 1 } = c
    return `rgba(${(r * 255) | 0},${(g * 255) | 0},${(b * 255) | 0},${a})`
  }
  return 'transparent'
}

function padToCss(p: any): string {
  if (p == null) return '0'
  if (typeof p === 'number') return `${p}px`
  if ('top' in p || 'right' in p || 'bottom' in p || 'left' in p) {
    return `${p.top || 0}px ${p.right || 0}px ${p.bottom || 0}px ${p.left || 0}px`
  }
  return `${p.vertical || 0}px ${p.horizontal || 0}px`
}

function alignToCss(a: any): string | undefined {
  switch (a) {
    case 'start':
      return 'flex-start'
    case 'end':
      return 'flex-end'
    case 'center':
      return 'center'
    case 'baseline':
      return 'baseline'
    default:
      return undefined
  }
}

function applySize(s: any, w: any, prop: 'width' | 'height') {
  if (w === 'fill-parent') {
    if (prop === 'width') {
      s.flexGrow = '1'
      s.flexBasis = '0'
      s.minWidth = '0'
    } else {
      s.alignSelf = 'stretch'
    }
  } else if (typeof w === 'number') {
    s[prop] = `${w}px`
    if (prop === 'width') s.flexShrink = '0'
  }
}

function autoStyle(p: any): Partial<CSSStyleDeclaration> {
  const dir = p.direction === 'vertical' ? 'column' : 'row'
  const s: any = { display: 'flex', flexDirection: dir, boxSizing: 'border-box' }
  // Figma's spacing="auto" distributes children to the edges (space-between);
  // a numeric spacing is a fixed gap.
  if (p.spacing === 'auto') s.justifyContent = 'space-between'
  else if (p.spacing != null) s.gap = `${p.spacing}px`
  s.padding = padToCss(p.padding)
  if (p.fill) s.background = colorToCss(p.fill)
  if (p.cornerRadius) s.borderRadius = `${p.cornerRadius}px`
  if (p.stroke) s.border = `${p.strokeWidth || 1}px solid ${colorToCss(p.stroke)}`
  if (p.wrap) s.flexWrap = 'wrap'
  applySize(s, p.width, 'width')
  applySize(s, p.height, 'height')
  const cross = dir === 'row' ? p.verticalAlignItems : p.horizontalAlignItems
  const main = dir === 'row' ? p.horizontalAlignItems : p.verticalAlignItems
  const ai = alignToCss(cross)
  if (ai) s.alignItems = ai
  const jc = alignToCss(main)
  if (jc && p.spacing !== 'auto') s.justifyContent = jc
  return s
}

function textStyle(p: any): Partial<CSSStyleDeclaration> {
  const s: any = { fontSize: `${p.fontSize || 13}px`, lineHeight: '1.35', boxSizing: 'border-box' }
  if (p.fontWeight) s.fontWeight = String(p.fontWeight)
  if (p.fill) s.color = colorToCss(p.fill)
  if (p.horizontalAlignText) s.textAlign = p.horizontalAlignText
  applySize(s, p.width, 'width')
  s.whiteSpace = p.width != null ? 'normal' : 'nowrap'
  s.overflowWrap = 'anywhere'
  return s
}

// --- widget primitives (return host vnodes) ---

function toArr(c: any): any[] {
  return c == null ? [] : Array.isArray(c) ? c.flat(Infinity) : [c]
}
function AutoLayout(props: any): VNode {
  return { type: '@div', props, children: toArr(props.children) }
}
function TextComp(props: any): VNode {
  return { type: '@text', props, children: toArr(props.children) }
}
function InputComp(props: any): VNode {
  return { type: '@input', props, children: [] }
}
function Fragment(props: any): VNode {
  return { type: '@frag', props, children: toArr(props.children) }
}

// --- hooks (synced state keyed by name; order-independent) ---

function useSyncedState<T>(name: string, init: T): [T, (v: T) => void] {
  if (!(name in store)) store[name] = init
  return [store[name], (v: T) => {
    store[name] = v
    scheduleRerender()
  }]
}

function useSyncedMap<T>(name: string) {
  const m = mapStore[name] || (mapStore[name] = new Map<string, any>())
  return {
    get: (k: string) => m.get(k) as T | undefined,
    has: (k: string) => m.has(k),
    set: (k: string, v: T) => {
      m.set(k, v)
      scheduleRerender()
    },
    delete: (k: string) => {
      m.delete(k)
      scheduleRerender()
    },
    keys: () => Array.from(m.keys()),
    values: () => Array.from(m.values()) as T[],
    entries: () => Array.from(m.entries()) as [string, T][],
    get size() {
      return m.size
    },
  }
}

let effectQueue: Array<() => void> = []
function useEffect(fn: () => void) {
  effectQueue.push(fn)
}
function register(component: () => any) {
  rootComponent = component
}

// --- render ---

function renderNode(vnode: any): Node {
  if (vnode == null || typeof vnode === 'boolean') return document.createComment('')
  if (typeof vnode === 'string' || typeof vnode === 'number') return document.createTextNode(String(vnode))
  if (Array.isArray(vnode)) {
    const frag = document.createDocumentFragment()
    vnode.flat(Infinity).forEach((c) => frag.appendChild(renderNode(c)))
    return frag
  }
  const { type, props, children } = vnode as VNode
  if (typeof type === 'function') return renderNode(type({ ...props, children }))
  if (type === '@frag') {
    const frag = document.createDocumentFragment()
    children.forEach((c) => frag.appendChild(renderNode(c)))
    return frag
  }
  if (type === '@text') {
    const el = document.createElement(props.href ? 'a' : 'span')
    Object.assign(el.style, textStyle(props))
    if (props.href) {
      ;(el as HTMLAnchorElement).href = props.href
      ;(el as HTMLAnchorElement).target = '_blank'
      el.style.textDecoration = 'none'
    }
    if (props.onClick) {
      el.style.cursor = 'pointer'
      el.addEventListener('click', () => props.onClick({}))
    }
    children.forEach((c) => el.appendChild(renderNode(c)))
    return el
  }
  if (type === '@input') {
    const el = document.createElement('input')
    el.value = props.value ?? ''
    if (props.placeholder) el.placeholder = props.placeholder
    Object.assign(el.style, textStyle(props), {
      border: '1px solid #E4E7EB',
      borderRadius: '6px',
      padding: '6px 8px',
      width: props.width === 'fill-parent' ? '100%' : typeof props.width === 'number' ? `${props.width}px` : 'auto',
      whiteSpace: 'normal',
      outline: 'none',
    })
    if (props.inputFrameProps && props.inputFrameProps.fill) el.style.background = colorToCss(props.inputFrameProps.fill)
    const commit = () => props.onTextEditEnd && props.onTextEditEnd({ characters: el.value })
    el.addEventListener('blur', commit)
    el.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter' && props.inputBehavior !== 'multiline') el.blur()
    })
    return el
  }
  // '@div'
  const el = document.createElement('div')
  Object.assign(el.style, autoStyle(props))
  if (props.onClick) {
    el.style.cursor = 'pointer'
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      props.onClick({})
    })
  }
  children.forEach((c) => el.appendChild(renderNode(c)))
  return el
}

function renderApp() {
  if (!rootComponent || !container) return
  effectQueue = []
  const tree = rootComponent()
  container.innerHTML = ''
  container.appendChild(renderNode(tree))
  const q = effectQueue
  effectQueue = []
  q.forEach((fn) => {
    try {
      fn()
    } catch (err) {
      console.error('useEffect error:', err)
    }
  })
}

export function mountPreview() {
  container = document.getElementById('root')
  renderApp()
}

// Install the global `figma` shim as an import side effect (before widget code loads).
;(globalThis as any).figma = {
  widget: {
    h,
    AutoLayout,
    Text: TextComp,
    Input: InputComp,
    Fragment,
    useSyncedState,
    useSyncedMap,
    useEffect,
    register,
    waitForTask: () => {},
  },
  openExternal: (url: string) => window.open(url, '_blank'),
  currentUser: { id: 'preview-user', name: 'Preview', color: '#3B6FED', photoUrl: null, sessionId: 0 },
}
