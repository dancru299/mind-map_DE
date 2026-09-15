import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BBox } from './layout'

export const ZMIN = 0.3, ZMAX = 2.2
const clampZ = (z: number) => Math.min(ZMAX, Math.max(ZMIN, z))
export type WheelMode = 'pan' | 'zoom'

/**
 * Pan/zoom trên mặt phẳng tự do. Trạng thái nằm trong ref (không re-render khi kéo),
 * transform được ghi thẳng vào DOM của world. Chỉ zoomPct là state để hiện số %.
 */
export function useViewport(stageRef: React.RefObject<HTMLDivElement | null>, worldRef: React.RefObject<HTMLDivElement | null>) {
  const v = useRef({ tx: 0, ty: 0, scale: 1 })
  const [zoomPct, setZoomPct] = useState(100)
  const wheelModeRef = useRef<WheelMode>('pan')
  const [wheelMode, setWheelModeState] = useState<WheelMode>(() => {
    try { return (localStorage.getItem('de-mm-wheel') as WheelMode) || 'pan' } catch { return 'pan' }
  })
  wheelModeRef.current = wheelMode
  const setWheelMode = (m: WheelMode) => { setWheelModeState(m); try { localStorage.setItem('de-mm-wheel', m) } catch { /* bỏ qua */ } }

  const apply = useCallback((anim: boolean) => {
    const w = worldRef.current, s = stageRef.current; if (!w || !s) return
    const { tx, ty, scale } = v.current
    w.classList.toggle('anim', anim)
    w.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`
    s.style.setProperty('--gx', `${tx}px`); s.style.setProperty('--gy', `${ty}px`)
    const g = 22 * Math.max(scale, 0.55); s.style.backgroundSize = `${g}px ${g}px`
    setZoomPct(Math.round(scale * 100))
  }, [stageRef, worldRef])

  const zoomAt = useCallback((z: number, sx: number, sy: number, anim: boolean) => {
    const c = v.current; z = clampZ(z)
    const wx = (sx - c.tx) / c.scale, wy = (sy - c.ty) / c.scale
    c.scale = z; c.tx = sx - wx * z; c.ty = sy - wy * z; apply(anim)
  }, [apply])
  const zoomStep = useCallback((dir: 1 | -1) => {
    const s = stageRef.current; if (!s) return
    zoomAt(v.current.scale * (dir > 0 ? 1.2 : 1 / 1.2), s.clientWidth / 2, s.clientHeight / 2, true)
  }, [stageRef, zoomAt])
  const setZoom = useCallback((z: number) => { const s = stageRef.current; if (s) zoomAt(z, s.clientWidth / 2, s.clientHeight / 2, true) }, [stageRef, zoomAt])

  const centerOn = useCallback((b: BBox, anim: boolean) => {
    const s = stageRef.current; if (!s) return
    const c = v.current
    c.tx = s.clientWidth / 2 - (b.x1 + b.w / 2) * c.scale; c.ty = s.clientHeight / 2 - (b.y1 + b.h / 2) * c.scale; apply(anim)
  }, [stageRef, apply])

  /** Vừa khung; nếu phải thu nhỏ dưới minScale thì giữ minScale và đặt focus vào giữa */
  const fit = useCallback((b: BBox, anim: boolean, minScale?: number, focus?: BBox) => {
    const s = stageRef.current; if (!s || !(b.w > 0)) return
    const sw = s.clientWidth, sh = s.clientHeight, M = 48, c = v.current
    const z = Math.min((sw - M * 2) / b.w, (sh - M * 2) / b.h, 1.15)
    if (minScale && z < minScale) { c.scale = minScale; centerOn(focus ?? b, anim); return }
    c.scale = clampZ(z)
    c.tx = (sw - b.w * c.scale) / 2 - b.x1 * c.scale; c.ty = (sh - b.h * c.scale) / 2 - b.y1 * c.scale; apply(anim)
  }, [stageRef, apply, centerOn])

  /** Dịch ít nhất có thể để vùng b lọt vào khung nhìn */
  const ensureVisible = useCallback((b: BBox, focus: BBox) => {
    const s = stageRef.current; if (!s) return
    const c = v.current, M = 36, sw = s.clientWidth, sh = s.clientHeight
    if (b.w * c.scale > sw - M * 2 || b.h * c.scale > sh - M * 2) { centerOn(focus, true); return }
    const x1 = b.x1 * c.scale + c.tx, y1 = b.y1 * c.scale + c.ty, x2 = b.x2 * c.scale + c.tx, y2 = b.y2 * c.scale + c.ty
    let dx = 0, dy = 0
    if (x1 < M) dx = M - x1; else if (x2 > sw - M) dx = sw - M - x2
    if (y1 < M) dy = M - y1; else if (y2 > sh - M) dy = sh - M - y2
    if (dx || dy) { c.tx += dx; c.ty += dy; apply(true) }
  }, [stageRef, apply, centerOn])

  // Chuột / chạm: kéo nền, chụm ngón, cuộn
  useEffect(() => {
    const s = stageRef.current, w = worldRef.current; if (!s || !w) return
    const pointers = new Map<number, { x: number; y: number }>()
    let drag: { x: number; y: number; tx: number; ty: number } | null = null
    let pinch: { d: number; mx: number; my: number; scale: number; tx: number; ty: number } | null = null
    const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)
    const isUi = (t: EventTarget | null) => (t as Element | null)?.closest?.('.node,.fab,.help') != null

    const down = (e: PointerEvent) => {
      if (isUi(e.target) || (e.pointerType === 'mouse' && e.button !== 0)) return
      s.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      w.classList.remove('anim')
      if (pointers.size === 1) { drag = { x: e.clientX, y: e.clientY, tx: v.current.tx, ty: v.current.ty }; s.classList.add('dragging') }
      else if (pointers.size === 2) {
        drag = null; const [a, b] = [...pointers.values()]
        pinch = { d: dist(a, b), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, ...v.current }
      }
    }
    const move = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const r = s.getBoundingClientRect(), c = v.current
      if (pinch && pointers.size >= 2) {
        const [a, b] = [...pointers.values()], d = dist(a, b), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
        const sx = pinch.mx - r.left, sy = pinch.my - r.top, wx = (sx - pinch.tx) / pinch.scale, wy = (sy - pinch.ty) / pinch.scale
        c.scale = clampZ(pinch.scale * d / pinch.d); c.tx = (mx - r.left) - wx * c.scale; c.ty = (my - r.top) - wy * c.scale; apply(false)
      } else if (drag) { c.tx = drag.tx + (e.clientX - drag.x); c.ty = drag.ty + (e.clientY - drag.y); apply(false) }
    }
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null
      if (pointers.size === 0) { drag = null; s.classList.remove('dragging') }
      else if (pointers.size === 1) { const [p] = [...pointers.values()]; drag = { x: p.x, y: p.y, tx: v.current.tx, ty: v.current.ty } }
    }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? s.clientHeight : 1, dx = e.deltaX * k, dy = e.deltaY * k
      const r = s.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top, c = v.current
      w.classList.remove('anim')
      if (e.ctrlKey || e.metaKey || wheelModeRef.current === 'zoom') zoomAt(c.scale * Math.exp(-dy * 0.0022), sx, sy, false)
      else if (e.shiftKey) { c.tx -= (dy || dx); apply(false) }
      else { c.tx -= dx; c.ty -= dy; apply(false) }
    }
    s.addEventListener('pointerdown', down); s.addEventListener('pointermove', move)
    s.addEventListener('pointerup', up); s.addEventListener('pointercancel', up)
    s.addEventListener('wheel', wheel, { passive: false })
    return () => {
      s.removeEventListener('pointerdown', down); s.removeEventListener('pointermove', move)
      s.removeEventListener('pointerup', up); s.removeEventListener('pointercancel', up)
      s.removeEventListener('wheel', wheel)
    }
  }, [stageRef, worldRef, apply, zoomAt])

  // API ổn định (không đổi identity giữa các render) để dùng làm dependency của effect
  const view = useMemo(() => ({ zoomStep, setZoom, fit, centerOn, ensureVisible }), [zoomStep, setZoom, fit, centerOn, ensureVisible])
  return { view, zoomPct, wheelMode, setWheelMode }
}
