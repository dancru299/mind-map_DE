import { useEffect, useState, type CSSProperties } from 'react'
import type { TreeNode } from '../content/types'
import { GLOSS_TYPE_LABEL, colorOf, glossOf, type Gloss } from '../content/load'

interface Props { node: TreeNode; openTerm?: string | null; onGo: (n: TreeNode) => void }

/** Hàng chip từ khoá; bấm một chip thì thẻ định nghĩa mở ngay bên dưới (không cần đi tra) */
export function ToolChips({ node, openTerm, onGo }: Props) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => { setActive(openTerm ?? null) }, [node.id, openTerm])
  const entry: Gloss | undefined = active ? glossOf(active) : undefined
  const related = entry ? entry.nodes.filter(n => n !== node).slice(0, 6) : []
  return (
    <div className="sec tools">
      <h3>Công cụ &amp; từ khoá <small>bấm để xem nghĩa</small></h3>
      <div className="chips">
        {node.tools.map(t => {
          const g = glossOf(t)
          return (
            <button key={t} className={['chip', g ? 'has' : 'plain', active === t ? 'on' : ''].filter(Boolean).join(' ')}
              aria-expanded={active === t} disabled={!g} title={g ? undefined : 'Chưa có định nghĩa'}
              onClick={() => setActive(a => (a === t ? null : t))}>{t}</button>
          )
        })}
      </div>
      {entry && active && (
        <div className="gloss" role="region" aria-label={`Định nghĩa ${entry.term}`}>
          <div className="g-head">
            <b>{entry.term}</b>
            <span className={`g-type t-${entry.type}`}>{GLOSS_TYPE_LABEL[entry.type]}</span>
            {entry.aliases.length > 0 && <small className="g-alias">còn gọi: {entry.aliases.join(', ')}</small>}
            <button className="g-close" onClick={() => setActive(null)} aria-label="Đóng">×</button>
          </div>
          <p>{entry.def}</p>
          {entry.more && <p className="g-more">{entry.more}</p>}
          {related.length > 0 && (
            <div className="g-related">
              <span>Cũng xuất hiện ở</span>
              {related.map(n => <button key={n.id} onClick={() => onGo(n)} style={{ '--lc': colorOf(n) } as CSSProperties}><i />{n.title}</button>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
