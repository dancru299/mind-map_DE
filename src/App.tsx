import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHistory } from './useHistory'
import type { TreeNode } from './content/types'
import { ALL, BY_ID, ROOT, STEPS, STEP_BY_ID, pathOf } from './content/load'
import { TreeCanvas } from './tree/TreeCanvas'
import { DetailPanel } from './panel/DetailPanel'
import { Search } from './Search'
import { Legend } from './Legend'
import { RouteBar } from './RouteBar'
import { useUserData } from './store/UserData'
import { progressOf, summary } from './store/progress'
import { ContextMenu, type MenuEntry } from './ui/ContextMenu'
import { NoteWindow } from './notes/NoteWindow'
import { PanelResizer, loadPanelWidth } from './ui/PanelResizer'
import { IcExport, IcImport, IcLink, IcMore, IcNote, IcOpen, IcOpenAll, IcTarget, IcTrash } from './ui/icons'

const descendants = (n: TreeNode): TreeNode[] => n.children.flatMap(c => [c, ...descendants(c)])

const idFromPath = (pathname: string) => decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '')
const ancestorsAndSelf = (n: TreeNode) => pathOf(n).filter(s => s.children.length > 0).map(s => s.id)

export default function App() {
  const { path, navigate } = useHistory()
  const selected = useMemo(() => BY_ID.get(idFromPath(path)) ?? ROOT, [path])
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(ancestorsAndSelf(selected)))
  const [fitRequest, setFitRequest] = useState(0)
  const [routeMode, setRouteMode] = useState(() => { try { return localStorage.getItem('de-mm-route') === '1' } catch { return false } })
  const user = useUserData()
  const [menu, setMenu] = useState<{ x: number; y: number; node: TreeNode; kind: 'node' | 'data' } | null>(null)
  const [noteFor, setNoteFor] = useState<TreeNode | null>(null)
  const [openTerm, setOpenTerm] = useState<string | null>(null)
  const [toast, setToast] = useState<{ text: string; action?: { label: string; run: () => void } } | null>(null)
  const [panelW, setPanelW] = useState(loadPanelWidth)
  const importRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const showToast = useCallback((text: string, action?: { label: string; run: () => void }) => {
    setToast({ text, action }); window.clearTimeout(toastTimer.current); toastTimer.current = window.setTimeout(() => setToast(null), action ? 7000 : 3000)
  }, [])
  useEffect(() => { try { localStorage.setItem('de-mm-panel-w', String(panelW)) } catch { /* bỏ qua */ } }, [panelW])
  const searchRef = useRef<HTMLInputElement>(null)

  // URL không hợp lệ → về gốc; mục được chọn thì các cấp cha phải đang mở (deep link, back/forward)
  useEffect(() => { if (path !== '/' && !BY_ID.has(idFromPath(path))) navigate('/', true) }, [path, navigate])
  useEffect(() => {
    setOpenIds(prev => {
      const need = pathOf(selected).slice(0, -1).filter(s => s.children.length > 0).map(s => s.id)
      if (need.every(id => prev.has(id))) return prev
      const next = new Set(prev); need.forEach(id => next.add(id)); return next
    })
  }, [selected])

  const go = useCallback((n: TreeNode) => {
    setOpenIds(prev => { const next = new Set(prev); ancestorsAndSelf(n).forEach(id => next.add(id)); return next })
    if (n !== selected) navigate(n.id ? `/${n.id}` : '/')
  }, [navigate, selected])

  // Bấm node: mục đang chọn → mở/đóng; mục khác → chọn và mở
  const onNodeClick = useCallback((n: TreeNode) => {
    if (n === selected) {
      if (n.children.length) setOpenIds(prev => { const next = new Set(prev); next.has(n.id) ? next.delete(n.id) : next.add(n.id); return next })
      return
    }
    go(n)
  }, [selected, go])

  // Bật lộ trình: mở sẵn mọi nhánh chứa bước, vừa màn hình
  const toggleRoute = () => {
    const on = !routeMode; setRouteMode(on); try { localStorage.setItem('de-mm-route', on ? '1' : '0') } catch { /* bỏ qua */ }
    if (on && STEPS.length) {
      setOpenIds(prev => { const next = new Set(prev); STEPS.forEach(st => pathOf(st.node).slice(0, -1).forEach(a => next.add(a.id))); return next })
      setFitRequest(f => f + 1)
    }
  }
  const stepBy = useCallback((d: 1 | -1) => {
    const cur = STEP_BY_ID.get(selected.id)
    const target = cur ? STEPS[cur.index - 1 + d] : STEPS[0]
    if (target) go(target.node)
  }, [selected, go])

  // Chấm mức nắm vững; đạt 100% thì báo phần hành trình vừa cộng, trong lộ trình gợi ý luôn bước tiếp
  const setMastery = useCallback(async (n: TreeNode, v: number) => {
    const before = user.progress.get(n.id)?.mastery ?? 0
    await user.setMastery(n.id, v)
    if (v >= 100 && before < 100) {
      const gain = (n.share * (100 - before) / 100 * 100).toFixed(1).replace('.', ',')
      const step = STEP_BY_ID.get(n.id), next = step ? STEPS[step.index] : undefined
      if (routeMode && next) showToast(`Thành thạo · ${n.title} · +${gain}% hành trình`, { label: `Bước ${next.index}: ${next.node.title} →`, run: () => go(next.node) })
      else showToast(`Thành thạo · ${n.title} · +${gain}% hành trình`)
    }
  }, [user, routeMode, showToast, go])
  const setMany = useCallback(async (ids: string[], v: number) => { await user.setManyMastery(ids, v); showToast(`Đã đặt ${ids.length} mục thành ${v}%`) }, [user, showToast])

  const nodeMenu = (n: TreeNode): MenuEntry[] => {
    const isOpen = openIds.has(n.id), isLeaf = n.children.length === 0
    return [
      { label: user.notes.has(n.id) ? 'Mở ghi chú' : 'Thêm ghi chú', icon: <IcNote />, hint: 'G', onSelect: () => { if (n !== selected) go(n); setNoteFor(n) } },
      isLeaf
        ? { kind: 'mastery', label: 'Mức nắm vững', value: user.progress.get(n.id)?.mastery ?? 0, onSet: (v: number) => setMastery(n, v) }
        : { label: `Tiến độ nhánh: ${Math.round(progressOf(n, user.progress) * 100)}% — xem chi tiết`, icon: <IcTarget />, onSelect: () => go(n) },
      'sep',
      { label: isOpen ? 'Thu nhánh' : 'Mở nhánh', icon: <IcOpen />, disabled: !n.children.length, onSelect: () => setOpenIds(p => { const x = new Set(p); isOpen ? x.delete(n.id) : x.add(n.id); return x }) },
      { label: 'Mở toàn bộ nhánh con', icon: <IcOpenAll />, disabled: !n.children.some(c => c.children.length), onSelect: () => setOpenIds(p => { const x = new Set(p); x.add(n.id); descendants(n).forEach(d => { if (d.children.length) x.add(d.id) }); return x }) },
      { label: 'Đưa vào giữa màn hình', icon: <IcTarget />, hint: 'C', onSelect: () => { go(n); window.dispatchEvent(new CustomEvent('de-mm:key', { detail: 'c' })) } },
      'sep',
      { label: 'Sao chép liên kết', icon: <IcLink />, onSelect: () => { navigator.clipboard?.writeText(`${location.origin}/${n.id}`).then(() => showToast('Đã sao chép liên kết')) } },
    ]
  }
  const dataMenu = (): MenuEntry[] => [
    { label: 'Xuất dữ liệu học (ghi chú, đánh dấu)', icon: <IcExport />, onSelect: async () => {
      const blob = await user.exportAll(), a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = `de-mindmap-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    } },
    { label: 'Nhập từ file đã xuất', icon: <IcImport />, onSelect: () => importRef.current?.click() },
    'sep',
    { label: 'Xoá toàn bộ ghi chú & đánh dấu', icon: <IcTrash />, danger: true, onSelect: async () => { if (confirm('Xoá toàn bộ ghi chú, ảnh và đánh dấu đã học trên trình duyệt này? Không hoàn tác được.')) { await user.clearAll(); showToast('Đã xoá toàn bộ dữ liệu học') } } },
  ]
  const onImport = async (f: File | undefined) => {
    if (!f) return
    try { const r = await user.importAll(f); showToast(`Đã nhập ${r.progress} đánh dấu, ${r.notes} ghi chú, ${r.images} ảnh`) }
    catch (e) { showToast(`Không nhập được: ${(e as Error).message}`) }
  }

  const expandAll = () => { setOpenIds(new Set(ALL.filter(n => n.children.length).map(n => n.id))); setFitRequest(f => f + 1) }
  const collapseAll = () => { setOpenIds(new Set([ROOT.id])); if (selected !== ROOT) navigate('/'); setFitRequest(f => f + 1) }

  // Điều hướng bàn phím trên cây (không áp dụng khi đang gõ ô tìm kiếm / trong panel)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target instanceof HTMLElement ? e.target : document.body
      if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable || t.closest('.panel,.notewin,.cmenu')) return
      const sib = selected.parent ? selected.parent.children : [], i = sib.indexOf(selected)
      if (e.key === 'ArrowRight') { e.preventDefault(); if (selected.children.length) { if (openIds.has(selected.id)) go(selected.children[0]); else setOpenIds(p => new Set(p).add(selected.id)) } }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); if (openIds.has(selected.id) && selected.children.length && selected !== ROOT) setOpenIds(p => { const n = new Set(p); n.delete(selected.id); return n }); else if (selected.parent) go(selected.parent) }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (i < sib.length - 1) go(sib[i + 1]) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (i > 0) go(sib[i - 1]) }
      else if (e.key === '/') { e.preventDefault(); searchRef.current?.focus() }
      else if ((e.key === 'n' || e.key === 'N') && STEPS.length) stepBy(1)
      else if ((e.key === 'p' || e.key === 'P') && STEPS.length) stepBy(-1)
      else if ((e.key === 'm' || e.key === 'M') && !selected.children.length) { const cur = user.progress.get(selected.id)?.mastery ?? 0; setMastery(selected, cur >= 100 ? 0 : 100) }
      else if (e.key === 'g' || e.key === 'G') setNoteFor(selected)
      else if (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '0' || e.key === 'c' || e.key === 'C') {
        // chuyển cho TreeCanvas qua sự kiện tuỳ chỉnh để không phải nâng trạng thái viewport lên đây
        window.dispatchEvent(new CustomEvent('de-mm:key', { detail: e.key }))
      }
    }
    document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h)
  }, [selected, openIds, go, stepBy, setMastery, user.progress])

  const sum = summary(user.progress), pct = Math.round(sum.total * 100)
  return (
    <div className="app" style={{ '--panel-w': `${panelW}px` } as React.CSSProperties}>
      <header className="bar">
        <div className="brand">
          <b>Gia phả Data Engineering</b>
          {sum.touched > 0
            ? <button className="prog" title={`Hành trình DE: ${pct}% · ${sum.mastered} thành thạo, ${sum.touched - sum.mastered} đang học trên ${sum.leafCount} mục lá — tính theo trọng số`} onClick={() => go(ROOT)}><i style={{ '--w': `${pct}%` } as React.CSSProperties} /><span>Hành trình DE · <b>{pct}%</b> · {sum.mastered}/{sum.leafCount} thành thạo</span></button>
            : <small>bấm vào một mục để mở nhánh · chuột phải để ghi chú, chấm mức nắm vững</small>}
        </div>
        <Search onPick={n => { setOpenTerm(null); go(n) }} onPickTerm={(n, term) => { setOpenTerm(term); go(n) }} inputRef={searchRef} />
        <div className="ctl">
          {STEPS.length > 0 && <button className={routeMode ? 'on' : undefined} onClick={toggleRoute} title="Bật/tắt lộ trình học gợi ý" aria-pressed={routeMode}>Lộ trình</button>}
          <button onClick={expandAll} title="Mở toàn bộ cây">Mở tất cả</button>
          <button onClick={collapseAll} title="Thu về các nhánh cấp 1">Thu gọn</button>
          <button className="icon" title="Xuất / nhập dữ liệu học" aria-label="Thêm" onClick={e => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setMenu({ x: r.right - 260, y: r.bottom + 6, node: ROOT, kind: 'data' }) }}><IcMore /></button>
          <input ref={importRef} type="file" accept="application/json" hidden onChange={e => { onImport(e.target.files?.[0]); e.target.value = '' }} />
        </div>
      </header>
      <div className="stage-wrap">
        {routeMode ? <RouteBar selected={selected} onGo={go} /> : <Legend root={ROOT} onGo={go} />}
        <TreeCanvas root={ROOT} openIds={openIds} selected={selected} fitRequest={fitRequest} routeMode={routeMode} onNodeClick={onNodeClick}
          onNodeMenu={(node, x, y) => setMenu({ x, y, node, kind: 'node' })} />
      </div>
      <div className="panel-wrap">
        <PanelResizer width={panelW} onChange={setPanelW} />
        <DetailPanel node={selected} routeMode={routeMode} openTerm={openTerm} onGo={n => { setOpenTerm(null); go(n) }} onOpenNote={setNoteFor} onSetMastery={setMastery} onSetMany={setMany} />
      </div>
      {menu && <ContextMenu x={menu.x} y={menu.y} title={menu.kind === 'node' ? menu.node.title : undefined} items={menu.kind === 'node' ? nodeMenu(menu.node) : dataMenu()} onClose={() => setMenu(null)} />}
      {noteFor && <NoteWindow node={noteFor} onClose={() => setNoteFor(null)} onGo={go} />}
      {toast && (
        <div className="toast" role="status">
          <span>{toast.text}</span>
          {toast.action && <button onClick={() => { toast.action!.run(); setToast(null) }}>{toast.action.label}</button>}
        </div>
      )}
    </div>
  )
}
