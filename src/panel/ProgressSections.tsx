import { useState, type CSSProperties } from 'react'
import type { TreeNode } from '../content/types'
import { colorOf, ROOT } from '../content/load'
import { useUserData } from '../store/UserData'
import { LEVELS, leaves, levelLabel, progressOf, summary, weakSpots } from '../store/progress'
import { Bar, MasteryControl, WeightDots } from '../ui/MasteryControl'

const fmtPct = (x: number, digits = 1) => `${(x * 100).toFixed(digits).replace('.', ',')}%`

/** Mục lá: tự chấm mức nắm vững + cho biết mục này nặng bao nhiêu trong hành trình */
export function LeafMastery({ node, onSet }: { node: TreeNode; onSet: (v: number) => void }) {
  const { progress } = useUserData()
  const v = progress.get(node.id)?.mastery ?? 0
  return (
    <section className="prog-sec">
      <div className="ps-head"><h3>Mức nắm vững của bạn</h3><span className="ps-val">{v}% · {levelLabel(v)}</span></div>
      <MasteryControl value={v} onChange={onSet} />
      <p className="ps-meta">
        <WeightDots w={node.weight} /> Trọng số {node.weight}/5 · mục này chiếm <b>{fmtPct(node.share)}</b> hành trình DE
        {v < 100 && <> · nắm trọn sẽ cộng thêm <b>{fmtPct(node.share * (1 - v / 100))}</b></>}
      </p>
    </section>
  )
}

/** Nhánh: tiến độ tổng hợp từ các lá (có trọng số) + danh sách con + đặt hàng loạt */
export function BranchProgress({ node, onGo, onSetAll }: { node: TreeNode; onGo: (n: TreeNode) => void; onSetAll: (ids: string[], v: number) => void }) {
  const { progress } = useUserData()
  const [bulk, setBulk] = useState(false)
  const p = progressOf(node, progress), ls = leaves(node)
  return (
    <section className="prog-sec">
      <div className="ps-head"><h3>Tiến độ nhánh</h3><span className="ps-val big">{Math.round(p * 100)}%</span></div>
      <Bar value={p} color={colorOf(node)} />
      <p className="ps-meta">Tính từ {ls.length} mục lá theo trọng số (tổng {node.weightSum}) · nhánh này chiếm <b>{fmtPct(node.share)}</b> hành trình</p>
      <ul className="kidprog">
        {node.children.map(k => {
          const kp = progressOf(k, progress), m = progress.get(k.id)?.mastery
          return (
            <li key={k.id}>
              <button onClick={() => onGo(k)} style={{ '--lc': colorOf(k) } as CSSProperties}>
                <span className="kt">{k.title}</span>
                {k.children.length ? <small>{leaves(k).length} mục · {fmtPct(k.share, 1)}</small> : <small><WeightDots w={k.weight} /> {fmtPct(k.share, 1)}</small>}
                <Bar value={kp} color={colorOf(k)} thin />
                <b className={kp >= 1 ? 'ok' : undefined}>{k.children.length ? `${Math.round(kp * 100)}%` : m != null ? `${m}%` : '—'}</b>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="bulk">
        {!bulk ? <button className="ghost" onClick={() => setBulk(true)}>Đặt mức cho tất cả {ls.length} mục lá…</button> : (
          <>
            <span>Đặt tất cả {ls.length} mục lá thành:</span>
            {LEVELS.map(l => <button key={l.value} title={l.hint} onClick={() => { if (confirm(`Đặt ${ls.length} mục lá trong "${node.title}" thành ${l.value}% (${l.label})?`)) { onSetAll(ls.map(x => x.id), l.value); setBulk(false) } }}>{l.value}</button>)}
            <button className="ghost" onClick={() => setBulk(false)}>Huỷ</button>
          </>
        )}
      </div>
    </section>
  )
}

/** Gốc: bạn đang ở đâu trong hành trình */
export function Dashboard({ onGo }: { onGo: (n: TreeNode) => void }) {
  const { progress } = useUserData()
  const s = summary(progress), weak = weakSpots(progress)
  return (
    <section className="prog-sec dash">
      <div className="ps-head"><h3>Bạn đang ở đâu</h3><span className="ps-val big">{Math.round(s.total * 100)}%</span></div>
      <Bar value={s.total} />
      <p className="ps-meta">{s.mastered} thành thạo · {s.touched - s.mastered} đang học · {s.leafCount - s.touched} chưa chạm, trên {s.leafCount} mục lá. Mỗi mục có trọng số 1–5 theo mức quan trọng, nên % này không chia đều theo số mục.</p>
      <ul className="kidprog">
        {s.branches.map(({ node: b, progress: bp }) => (
          <li key={b.id}>
            <button onClick={() => onGo(b)} style={{ '--lc': colorOf(b) } as CSSProperties}>
              <span className="kt">{b.title}</span><small>{fmtPct(b.share, 0)} hành trình</small>
              <Bar value={bp} color={colorOf(b)} thin /><b className={bp >= 1 ? 'ok' : undefined}>{Math.round(bp * 100)}%</b>
            </button>
          </li>
        ))}
      </ul>
      {weak.length > 0 && (
        <>
          <h4 className="ps-sub">Quan trọng nhưng còn yếu — nên học tiếp</h4>
          <ul className="weak">
            {weak.map(n => {
              const m = progress.get(n.id)?.mastery ?? 0
              return <li key={n.id}><button onClick={() => onGo(n)} style={{ '--lc': colorOf(n) } as CSSProperties}><i /><span className="kt">{n.title}</span><WeightDots w={n.weight} /><b>{m}%</b></button></li>
            })}
          </ul>
        </>
      )}
      {ROOT.weightSum === 0 && <p className="ps-meta">Chưa có mục nào có trọng số.</p>}
    </section>
  )
}
