import { useEffect, useMemo, useRef, useState } from 'react'
import type { TreeNode } from './content/types'
import { ALL, GLOSSARY, GLOSS_TYPE_LABEL, pathOf, type Gloss } from './content/load'

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase()
const INDEX = ALL.map(n => ({ n, text: norm([n.title, n.tagline ?? '', ...n.tools].join(' ')) }))
const GINDEX = GLOSSARY.filter(g => g.nodes.length).map(g => ({ g, text: norm([g.term, ...g.aliases].join(' ')) }))
type Hit = { kind: 'node'; n: TreeNode } | { kind: 'gloss'; g: Gloss }

export function Search({ onPick, onPickTerm, inputRef }: { onPick: (n: TreeNode) => void; onPickTerm: (n: TreeNode, term: string) => void; inputRef: React.RefObject<HTMLInputElement | null> }) {
  const [q, setQ] = useState(''), [open, setOpen] = useState(false), [active, setActive] = useState(-1)
  const wrap = useRef<HTMLDivElement>(null)
  const hits = useMemo<Hit[]>(() => {
    const v = norm(q.trim()); if (!v) return []
    const nodes: Hit[] = INDEX.filter(x => x.text.includes(v)).slice(0, 8).map(x => ({ kind: 'node', n: x.n }))
    const gl: Hit[] = GINDEX.filter(x => x.text.includes(v)).slice(0, 6).map(x => ({ kind: 'gloss', g: x.g }))
    return [...nodes, ...gl]
  }, [q])

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('click', h); return () => document.removeEventListener('click', h)
  }, [])

  const pick = (h: Hit) => { if (h.kind === 'node') onPick(h.n); else onPickTerm(h.g.nodes[0], h.g.term); setOpen(false); setQ(''); inputRef.current?.blur() }
  return (
    <div className="search" ref={wrap}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input ref={inputRef} type="search" value={q} placeholder="Tìm khái niệm, công cụ… (vd: Kafka, SCD, backfill)" autoComplete="off" aria-label="Tìm kiếm"
        onChange={e => { setQ(e.target.value); setOpen(true); setActive(-1) }}
        onFocus={() => { if (q.trim()) setOpen(true) }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (hits.length) setActive(a => (a + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length) }
          else if (e.key === 'Enter') { const n = hits[active >= 0 ? active : 0]; if (n) pick(n) }
          else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
        }} />
      {open && q.trim() && (
        <div className="results" role="listbox">
          {hits.length === 0 && <div className="empty">Không thấy mục nào khớp.</div>}
          {hits.map((h, i) => h.kind === 'node' ? (
            <button key={h.n.id} className={i === active ? 'active' : undefined} role="option" aria-selected={i === active} onClick={() => pick(h)}>
              <span>{h.n.title}</span>
              <span className="rp">{pathOf(h.n).slice(0, -1).map(s => s.title).join(' / ')}</span>
            </button>
          ) : (
            <button key={'g:' + h.g.term} className={'gl' + (i === active ? ' active' : '')} role="option" aria-selected={i === active} onClick={() => pick(h)}>
              <span><em>{GLOSS_TYPE_LABEL[h.g.type]}</em> {h.g.term}</span>
              <span className="rp">{h.g.def.length > 110 ? h.g.def.slice(0, 110) + '…' : h.g.def}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
