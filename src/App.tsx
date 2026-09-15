import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHistory } from './useHistory'
import type { TreeNode } from './content/types'
import { ALL, BY_ID, ROOT, STEPS, STEP_BY_ID, pathOf } from './content/load'
import { TreeCanvas } from './tree/TreeCanvas'
import { DetailPanel } from './panel/DetailPanel'
import { Search } from './Search'
import { Legend } from './Legend'
import { RouteBar } from './RouteBar'

const idFromPath = (pathname: string) => decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '')
const ancestorsAndSelf = (n: TreeNode) => pathOf(n).filter(s => s.children.length > 0).map(s => s.id)

export default function App() {
  const { path, navigate } = useHistory()
  const selected = useMemo(() => BY_ID.get(idFromPath(path)) ?? ROOT, [path])
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(ancestorsAndSelf(selected)))
  const [fitRequest, setFitRequest] = useState(0)
  const [routeMode, setRouteMode] = useState(() => { try { return localStorage.getItem('de-mm-route') === '1' } catch { return false } })
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

  const expandAll = () => { setOpenIds(new Set(ALL.filter(n => n.children.length).map(n => n.id))); setFitRequest(f => f + 1) }
  const collapseAll = () => { setOpenIds(new Set([ROOT.id])); if (selected !== ROOT) navigate('/'); setFitRequest(f => f + 1) }

  // Điều hướng bàn phím trên cây (không áp dụng khi đang gõ ô tìm kiếm / trong panel)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.closest('.panel')) return
      const sib = selected.parent ? selected.parent.children : [], i = sib.indexOf(selected)
      if (e.key === 'ArrowRight') { e.preventDefault(); if (selected.children.length) { if (openIds.has(selected.id)) go(selected.children[0]); else setOpenIds(p => new Set(p).add(selected.id)) } }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); if (openIds.has(selected.id) && selected.children.length && selected !== ROOT) setOpenIds(p => { const n = new Set(p); n.delete(selected.id); return n }); else if (selected.parent) go(selected.parent) }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (i < sib.length - 1) go(sib[i + 1]) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (i > 0) go(sib[i - 1]) }
      else if (e.key === '/') { e.preventDefault(); searchRef.current?.focus() }
      else if ((e.key === 'n' || e.key === 'N') && STEPS.length) stepBy(1)
      else if ((e.key === 'p' || e.key === 'P') && STEPS.length) stepBy(-1)
      else if (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '0' || e.key === 'c' || e.key === 'C') {
        // chuyển cho TreeCanvas qua sự kiện tuỳ chỉnh để không phải nâng trạng thái viewport lên đây
        window.dispatchEvent(new CustomEvent('de-mm:key', { detail: e.key }))
      }
    }
    document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h)
  }, [selected, openIds, go, stepBy])

  return (
    <div className="app">
      <header className="bar">
        <div className="brand"><b>Gia phả Data Engineering</b><small>bấm vào một mục để mở nhánh hoặc xem khái niệm</small></div>
        <Search onPick={go} inputRef={searchRef} />
        <div className="ctl">
          {STEPS.length > 0 && <button className={routeMode ? 'on' : undefined} onClick={toggleRoute} title="Bật/tắt lộ trình học gợi ý" aria-pressed={routeMode}>Lộ trình</button>}
          <button onClick={expandAll} title="Mở toàn bộ cây">Mở tất cả</button>
          <button onClick={collapseAll} title="Thu về các nhánh cấp 1">Thu gọn</button>
        </div>
      </header>
      <div className="stage-wrap">
        {routeMode ? <RouteBar selected={selected} onGo={go} /> : <Legend root={ROOT} onGo={go} />}
        <TreeCanvas root={ROOT} openIds={openIds} selected={selected} fitRequest={fitRequest} routeMode={routeMode} onNodeClick={onNodeClick} />
      </div>
      <DetailPanel node={selected} routeMode={routeMode} onGo={go} />
    </div>
  )
}
