import { useCallback, useEffect, useRef, useState } from 'react'

export interface Geo { x: number; y: number; w: number; h: number }
export type Dir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
const MIN_W = 300, MIN_H = 180, MARGIN = 12

/** Kéo (thanh tiêu đề) và co giãn (8 cạnh/góc) cho cửa sổ nổi; giữ trong viewport; nhớ vị trí qua localStorage */
export function useWindowGeometry(storageKey: string, initial: () => Geo) {
  const [geo, setGeo] = useState<Geo>(() => {
    try { const s = localStorage.getItem(storageKey); if (s) return clamp(JSON.parse(s)) } catch { /* bỏ qua */ }
    return clamp(initial())
  })
  const live = useRef(geo); live.current = geo
  const persist = useCallback((g: Geo) => { try { localStorage.setItem(storageKey, JSON.stringify(g)) } catch { /* bỏ qua */ } }, [storageKey])

  const startDrag = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    const el = e.currentTarget as HTMLElement; try { el.setPointerCapture(e.pointerId) } catch { /* pointer giả lập */ }
    const start = { x: e.clientX, y: e.clientY, g: live.current }
    const move = (ev: PointerEvent) => setGeo(clamp({ ...start.g, x: start.g.x + ev.clientX - start.x, y: start.g.y + ev.clientY - start.y }))
    const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); persist(live.current) }
    el.addEventListener('pointermove', move); el.addEventListener('pointerup', up)
  }, [persist])

  const startResize = useCallback((dir: Dir) => (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault(); e.stopPropagation()
    const el = e.currentTarget as HTMLElement; try { el.setPointerCapture(e.pointerId) } catch { /* pointer giả lập */ }
    const start = { x: e.clientX, y: e.clientY, g: live.current }
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - start.x, dy = ev.clientY - start.y, g = { ...start.g }
      if (dir.includes('e')) g.w = Math.max(MIN_W, start.g.w + dx)
      if (dir.includes('s')) g.h = Math.max(MIN_H, start.g.h + dy)
      if (dir.includes('w')) { const w = Math.max(MIN_W, start.g.w - dx); g.x = start.g.x + (start.g.w - w); g.w = w }
      if (dir.includes('n')) { const h = Math.max(MIN_H, start.g.h - dy); g.y = start.g.y + (start.g.h - h); g.h = h }
      setGeo(clamp(g))
    }
    const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); persist(live.current) }
    el.addEventListener('pointermove', move); el.addEventListener('pointerup', up)
  }, [persist])

  useEffect(() => { const h = () => setGeo(g => clamp(g)); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, [])
  const reset = useCallback(() => { const g = clamp(initial()); setGeo(g); persist(g) }, [initial, persist])
  return { geo, startDrag, startResize, reset }
}

function clamp(g: Geo): Geo {
  const vw = window.innerWidth, vh = window.innerHeight
  const w = Math.min(Math.max(MIN_W, g.w), vw - MARGIN * 2), h = Math.min(Math.max(MIN_H, g.h), vh - MARGIN * 2)
  const x = Math.min(Math.max(MARGIN, g.x), vw - w - MARGIN), y = Math.min(Math.max(MARGIN, g.y), vh - h - MARGIN)
  return { x, y, w, h }
}
