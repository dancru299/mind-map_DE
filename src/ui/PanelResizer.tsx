import { useCallback } from 'react'

export const PANEL_DEFAULT = 380, PANEL_MIN = 320
export const panelMax = () => Math.min(760, Math.floor(window.innerWidth * 0.6))
export function loadPanelWidth(): number { try { const v = Number(localStorage.getItem('de-mm-panel-w')); return v >= PANEL_MIN ? Math.min(v, panelMax()) : PANEL_DEFAULT } catch { return PANEL_DEFAULT } }

/** Tay nắm ở cạnh trái panel: kéo để đổi độ rộng, bấm đúp để về mặc định */
export function PanelResizer({ width, onChange }: { width: number; onChange: (w: number) => void }) {
  const down = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    const el = e.currentTarget as HTMLElement; try { el.setPointerCapture(e.pointerId) } catch { /* pointer giả lập */ }; el.classList.add('active')
    document.body.classList.add('col-resizing')
    const startX = e.clientX, startW = width
    const move = (ev: PointerEvent) => onChange(Math.min(panelMax(), Math.max(PANEL_MIN, startW + (startX - ev.clientX))))
    const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.classList.remove('active'); document.body.classList.remove('col-resizing') }
    el.addEventListener('pointermove', move); el.addEventListener('pointerup', up)
  }, [width, onChange])
  return <div className="panel-resizer" role="separator" aria-orientation="vertical" aria-label="Kéo để đổi độ rộng panel" title="Kéo để đổi độ rộng · bấm đúp để về mặc định"
    onPointerDown={down} onDoubleClick={() => onChange(PANEL_DEFAULT)} />
}
