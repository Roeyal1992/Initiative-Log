// Preview entry. Order matters:
// 1) import the shim — installs the global `figma` runtime as a side effect
// 2) import the widget code — its top-level `figma.widget` access + register() then work
// 3) mount into the page
import { mountPreview } from './figma-shim'
import '../widget-src/code'

// The widget is a fixed 760px-wide Figma widget. Scale it down (via CSS zoom, which
// reflows cleanly in Chromium) so it always fits the preview panel — no clipping/scroll.
const DESIGN_WIDTH = 760
function fitToWidth() {
  const wrap = document.getElementById('wrap')
  const root = document.getElementById('root')
  if (!wrap || !root) return
  const avail = wrap.clientWidth - 24 // account for #wrap padding
  const scale = Math.max(0.4, Math.min(1, avail / DESIGN_WIDTH))
  ;(root.style as any).zoom = String(scale)
}

mountPreview()
fitToWidth()
window.addEventListener('resize', fitToWidth)
const wrapEl = document.getElementById('wrap')
if (wrapEl && 'ResizeObserver' in window) new ResizeObserver(fitToWidth).observe(wrapEl)

