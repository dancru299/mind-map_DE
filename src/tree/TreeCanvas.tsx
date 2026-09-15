import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { TreeNode } from '../content/types'
import { STEP_BY_ID, colorOf, isAncestorOrSelf } from '../content/load'
import { bbox, collapsedPath, layout, linkPath, type Placed } from './layout'
import { useViewport } from './useViewport'

interface Props {
  root: TreeNode
  openIds: Set<string>
  selected: TreeNode
  fitRequest: number                    // tăng số này để yêu cầu "vừa màn hình" sau khi cây đổi
  routeMode: boolean                    // đánh số bước trên node, làm mờ mục ngoài lộ trình
  onNodeClick: (n: TreeNode) => void
}

export function TreeCanvas({ root, openIds, selected, fitRequest, routeMode, onNodeClick }: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const { view: vp, zoomPct, wheelMode, setWheelMode } = useViewport(stageRef, worldRef)
  const lay = useMemo(() => layout(root, openIds), [root, openIds])
  const [helpOpen, setHelpOpen] = useState(false)

  // Khung nhìn: lần đầu vừa màn hình (không nhỏ hơn 50%); khi yêu cầu fit; còn lại chỉ dịch tối thiểu để mục chọn lọt vào
  const first = useRef(true), lastFit = useRef(fitRequest)
  useLayoutEffect(() => {
    const selBox = lay.byId.get(selected.id)
    if (first.current) { first.current = false; vp.fit(bbox(lay.placed), false, 0.5, selBox && bbox([selBox])); return }
    if (fitRequest !== lastFit.current) { lastFit.current = fitRequest; vp.fit(bbox(lay.placed), true, 0.5, selBox && bbox([selBox])); return }
    if (!selBox) return
    const kids = openIds.has(selected.id) ? selected.children.map(c => lay.byId.get(c.id)).filter((p): p is Placed => !!p) : []
    vp.ensureVisible(bbox([selBox, ...kids]), bbox([selBox]))
  }, [lay, selected, fitRequest, openIds, vp])

  // Giữ focus trên node đang chọn để phím mũi tên hoạt động (trừ khi đang gõ tìm kiếm)
  useLayoutEffect(() => {
    const active = document.activeElement as HTMLElement | null
    if (active && (active.tagName === 'INPUT' || active.tagName === 'SELECT' || active.closest('.panel'))) return
    worldRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(selected.id)}"]`)?.focus({ preventScroll: true })
  }, [selected])

  useEffect(() => { // phím zoom do App bắt rồi chuyển sang
    const h = (e: Event) => {
      const k = (e as CustomEvent<string>).detail
      if (k === '+' || k === '=') vp.zoomStep(1)
      else if (k === '-') vp.zoomStep(-1)
      else if (k === '0') vp.fit(bbox(lay.placed), true)
      else if (k === 'c' || k === 'C') { const b = lay.byId.get(selected.id); if (b) vp.centerOn(bbox([b]), true) }
    }
    window.addEventListener('de-mm:key', h); return () => window.removeEventListener('de-mm:key', h)
  }, [lay, selected, vp])

  useEffect(() => { // bấm ra ngoài thì đóng bảng hướng dẫn
    if (!helpOpen) return
    const h = (e: MouseEvent) => { if (!(e.target as Element).closest('.help')) setHelpOpen(false) }
    document.addEventListener('click', h); return () => document.removeEventListener('click', h)
  }, [helpOpen])

  useLayoutEffect(() => {
    let t: number | undefined
    const onResize = () => { window.clearTimeout(t); t = window.setTimeout(() => { const b = lay.byId.get(selected.id); if (b) vp.ensureVisible(bbox([b]), bbox([b])) }, 120) }
    window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize)
  }, [lay, selected, vp])

  return (
    <div className="stage" ref={stageRef} onDoubleClick={e => { if (!(e.target as Element).closest('.node,.fab,.help')) vp.fit(bbox(lay.placed), true) }}>
      <div className="world" ref={worldRef} style={{ width: lay.width, height: lay.height }}>
        <svg className="links" width={lay.width} height={lay.height}>
          {lay.placed.filter(p => p.node.depth > 0).map(p => (
            <LinkView key={p.node.id} p={lay.byId.get(p.node.parent!.id)!} c={p} highlighted={isAncestorOrSelf(p.node, selected)} off={routeMode && !onRoute(p.node)} />
          ))}
        </svg>
        {lay.placed.map(p => (
          <NodeView key={p.node.id} p={p} anchor={p.node.parent ? lay.byId.get(p.node.parent.id)! : p}
            open={openIds.has(p.node.id) && p.node.children.length > 0} selected={p.node === selected} onClick={() => onNodeClick(p.node)}
            step={routeMode ? STEP_BY_ID.get(p.node.id)?.index : undefined} off={routeMode && !onRoute(p.node)} />
        ))}
      </div>

      <div className="fab">
        <div className="grp">
          <button onClick={() => vp.zoomStep(1)} title="Phóng to (+)" aria-label="Phóng to"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></button>
          <div className="zoomv" onClick={() => vp.setZoom(1)} title="Về 100%">{zoomPct}%</div>
          <button onClick={() => vp.zoomStep(-1)} title="Thu nhỏ (−)" aria-label="Thu nhỏ"><svg viewBox="0 0 24 24"><path d="M5 12h14" /></svg></button>
        </div>
        <div className="grp">
          <button onClick={() => vp.fit(bbox(lay.placed), true)} title="Vừa màn hình (0)" aria-label="Vừa màn hình"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg></button>
          <button onClick={() => { const b = lay.byId.get(selected.id); if (b) vp.centerOn(bbox([b]), true) }} title="Về mục đang chọn (C)" aria-label="Về mục đang chọn"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></svg></button>
        </div>
      </div>

      <div className={'help' + (helpOpen ? ' open' : '')}>
        <button onClick={() => setHelpOpen(o => !o)} aria-label="Hướng dẫn thao tác" title="Hướng dẫn">?</button>
        <div className="pop">
          <h4>Chuột / chạm</h4>
          <dl>
            <dt>Kéo nền</dt><dd>di chuyển cả cây</dd>
            <dt>Cuộn</dt><dd>di chuyển lên xuống · <kbd>Shift</kbd> ngang</dd>
            <dt><kbd>Ctrl</kbd> + cuộn</dt><dd>phóng to / thu nhỏ tại con trỏ</dd>
            <dt>Chụm 2 ngón</dt><dd>phóng to / thu nhỏ</dd>
            <dt>Bấm đúp nền</dt><dd>vừa màn hình</dd>
          </dl>
          <h4>Bàn phím</h4>
          <dl>
            <dt><kbd>→</kbd> <kbd>←</kbd></dt><dd>vào nhánh con / về cha</dd>
            <dt><kbd>↑</kbd> <kbd>↓</kbd></dt><dd>mục anh em</dd>
            <dt><kbd>Enter</kbd></dt><dd>mở / đóng nhánh</dd>
            <dt><kbd>+</kbd> <kbd>−</kbd> <kbd>0</kbd></dt><dd>zoom · vừa màn hình</dd>
            <dt><kbd>N</kbd> <kbd>P</kbd></dt><dd>bước sau / trước trong lộ trình</dd>
            <dt><kbd>/</kbd></dt><dd>tìm kiếm</dd>
          </dl>
          <label>Cuộn chuột không giữ phím
            <select value={wheelMode} onChange={e => setWheelMode(e.target.value as 'pan' | 'zoom')}>
              <option value="pan">Di chuyển</option>
              <option value="zoom">Phóng to / thu nhỏ</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  )
}

const chev = <svg viewBox="0 0 10 10" fill="currentColor"><path d="M3 1l4 4-4 4z" /></svg>

/** Node "thuộc lộ trình" = chính nó là một bước, hoặc là tổ tiên của một bước (để nhánh dẫn tới bước không bị mờ) */
const routeAncestors = new Set<string>()
STEP_BY_ID.forEach(st => { let s: TreeNode | null = st.node; while (s) { routeAncestors.add(s.id); s = s.parent } })
const onRoute = (n: TreeNode) => routeAncestors.has(n.id)

function NodeView({ p, anchor, open, selected, onClick, step, off }: { p: Placed; anchor: Placed; open: boolean; selected: boolean; onClick: () => void; step?: number; off?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  // Lúc mới xuất hiện: đặt tại vị trí cha rồi trượt ra vị trí thật
  useLayoutEffect(() => {
    const el = ref.current; if (!el || anchor === p) return
    el.style.transform = `translate(${anchor.x}px,${anchor.y}px)`; el.style.opacity = '0'
    void el.getBoundingClientRect()
    el.style.transform = `translate(${p.x}px,${p.y}px)`; el.style.opacity = ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const n = p.node
  const cls = ['node', `depth${Math.min(n.depth, 2)}`, open ? 'open' : '', n.children.length ? '' : 'leaf', selected ? 'sel' : '', off ? 'off' : '', step ? 'onroute' : ''].filter(Boolean).join(' ')
  return (
    <div ref={ref} className={cls} data-id={n.id} tabIndex={0} role="treeitem" aria-expanded={n.children.length ? open : undefined} aria-selected={selected}
      style={{ transform: `translate(${p.x}px,${p.y}px)`, width: p.w, height: p.h, '--lc': colorOf(n) } as CSSProperties}
      onClick={e => { e.stopPropagation(); onClick() }}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}>
      {step && <span className="step" aria-label={`Bước ${step}`}>{step}</span>}
      <span className="lbl">{n.title}</span>
      {n.children.length > 0 && <span className="cnt">{chev}<span>{n.children.length}</span></span>}
    </div>
  )
}

function LinkView({ p, c, highlighted, off }: { p: Placed; c: Placed; highlighted: boolean; off?: boolean }) {
  const ref = useRef<SVGPathElement>(null)
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return
    el.setAttribute('d', collapsedPath(p)); void el.getBoundingClientRect(); el.setAttribute('d', linkPath(p, c))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <path ref={ref} d={linkPath(p, c)} className={[highlighted ? 'hl' : '', off ? 'off' : ''].filter(Boolean).join(' ') || undefined} style={{ '--lc': colorOf(c.node) } as CSSProperties} />
}
