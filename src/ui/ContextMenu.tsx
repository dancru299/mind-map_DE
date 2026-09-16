import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface MenuItem { label: string; icon?: ReactNode; hint?: string; danger?: boolean; disabled?: boolean; checked?: boolean; onSelect: () => void }
export interface MenuMastery { kind: 'mastery'; label: string; value: number; onSet: (v: number) => void }
export type MenuEntry = MenuItem | MenuMastery | 'sep'
const isItem = (e: MenuEntry): e is MenuItem => e !== 'sep' && !('kind' in e)

interface Props { x: number; y: number; items: MenuEntry[]; title?: string; onClose: () => void }

/** Menu ngữ cảnh: mở tại toạ độ, tự né mép màn hình, điều hướng bằng phím, đóng khi bấm ra ngoài / Esc / cuộn */
export function ContextMenu({ x, y, items, title, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: x, top: y })
  const [active, setActive] = useState(-1)
  const actionable = items.map((it, i) => (isItem(it) && !it.disabled ? i : -1)).filter(i => i >= 0)

  useLayoutEffect(() => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect(), M = 8
    setPos({ left: Math.min(x, window.innerWidth - r.width - M), top: Math.min(y, window.innerHeight - r.height - M) })
  }, [x, y])

  useEffect(() => {
    const down = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) onClose() }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); if (!actionable.length) return
        const cur = actionable.indexOf(active), next = e.key === 'ArrowDown' ? (cur + 1) % actionable.length : (cur - 1 + actionable.length) % actionable.length
        setActive(actionable[next])
      }
      if (e.key === 'Enter' && active >= 0) { e.preventDefault(); (items[active] as MenuItem).onSelect(); onClose() }
    }
    document.addEventListener('pointerdown', down, true); document.addEventListener('keydown', key)
    window.addEventListener('wheel', onClose, { passive: true }); window.addEventListener('resize', onClose)
    return () => { document.removeEventListener('pointerdown', down, true); document.removeEventListener('keydown', key); window.removeEventListener('wheel', onClose); window.removeEventListener('resize', onClose) }
  }, [onClose, active, items, actionable])

  return createPortal(
    <div ref={ref} className="cmenu" role="menu" style={{ left: pos.left, top: pos.top }} onContextMenu={e => e.preventDefault()}>
      {title && <div className="cmenu-title">{title}</div>}
      {items.map((it, i) => it === 'sep'
        ? <div key={i} className="cmenu-sep" role="separator" />
        : 'kind' in it
        ? <div key={i} className="cmenu-mastery"><span className="lb">{it.label}</span><div className="chips">{[0, 25, 50, 75, 100].map(v => <button key={v} className={it.value === v ? 'on' : undefined} onClick={() => { it.onSet(v); onClose() }}>{v}</button>)}</div></div>
        : <button key={i} role="menuitem" className={['cmenu-item', it.danger ? 'danger' : '', i === active ? 'active' : '', it.checked ? 'checked' : ''].filter(Boolean).join(' ')}
            disabled={it.disabled} onMouseEnter={() => setActive(i)} onClick={() => { it.onSelect(); onClose() }}>
            <span className="ic">{it.icon}</span><span className="lb">{it.label}</span>{it.hint && <kbd>{it.hint}</kbd>}
          </button>)}
    </div>, document.body)
}
